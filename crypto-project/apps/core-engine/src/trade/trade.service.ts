// Dosya: apps/core-engine/src/trade/trade.service.ts

import { Injectable, BadRequestException, InternalServerErrorException, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Currency, TransactionType, TransactionStatus } from '@prisma/client';
import { IExchangeAdapter, EXCHANGE_PROVIDER, OrderSide } from '../exchange/exchange.interface';
import { Prisma } from '@prisma/client'; // <-- Decimal türü için bunu ekledik

@Injectable()
export class TradeService {
  private readonly logger = new Logger(TradeService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(EXCHANGE_PROVIDER) private exchangeAdapter: IExchangeAdapter
  ) { }

  // ==================================================================
  // 🟢 ALIM İŞLEMİ (AZN Ver -> USDT Al) - HASSAS MATEMATİK MODU
  // ==================================================================
  async executeBuy(userId: string, amountUsdt: number) {
    // Gelen miktarı Decimal'e çevir (Güvenli Matematik Başlangıcı)
    const amountDecimal = new Prisma.Decimal(amountUsdt);

    this.logger.log(`[TRADE] ${userId} NET ${amountDecimal} USDT almak istiyor...`);

    // 1. Fiyat Öğren
    let price: number;
    try {
      price = await this.exchangeAdapter.getPrice('USDT_AZN');
    } catch (e) {
      this.logger.error('Borsa fiyatı alınamadı.');
      throw new InternalServerErrorException("Borsa fiyatı alınamadı.");
    }

    // 🔥 HASSAS HESAPLAMA: (Miktar * Fiyat)
    // JS'nin çarpma işareti (*) yerine .mul() kullanıyoruz.
    const priceDecimal = new Prisma.Decimal(price);
    const costAzn = amountDecimal.mul(priceDecimal);

    this.logger.log(`[HESAPLAMA] ${amountDecimal} USDT almak için ${costAzn} AZN gerekiyor.`);

    // 2. Bakiyeyi Kilitle (AZN)
    try {
      await this.prisma.$transaction(async (tx) => {
        const userAccount = await tx.account.findUnique({
          where: { userId_currency: { userId, currency: Currency.AZN } }
        });

        // Veritabanındaki bakiyeyi al (Bu zaten Decimal gelir)
        const currentBalance = userAccount ? userAccount.balance : new Prisma.Decimal(0);

        // KONTROL: currentBalance < costAzn ?
        if (currentBalance.lessThan(costAzn)) {
          throw new BadRequestException(`Yetersiz AZN Bakiyesi! Gereken: ${costAzn}, Mevcut: ${currentBalance}`);
        }

        // GÜNCELLEME: Bakiyeden Düş, Kilide Ekle
        await tx.account.update({
          where: { userId_currency: { userId, currency: Currency.AZN } },
          data: {
            balance: { decrement: costAzn },      // Prisma bunu güvenli yapar
            lockedBalance: { increment: costAzn } // Prisma bunu güvenli yapar
          }
        });
      });
    } catch (error) {
      this.logger.error(`Bakiye kilitleme hatası: ${error.message}`);
      throw error;
    }

    // 3. Borsa Emri
    // Not: Borsa adaptörü hala number çalışıyor olabilir, oraya 'toNumber()' ile gönderiyoruz
    // Çünkü borsa API'leri genelde JSON number bekler.
    let order;
    try {
      order = await this.exchangeAdapter.createOrder('USDT_AZN', OrderSide.BUY, amountDecimal.toNumber());
      if (order.status !== 'FILLED') throw new Error('Borsa reddetti.');
    } catch (exchangeError) {
      // Rollback (İade)
      this.logger.error('Borsa Hatası! AZN iade ediliyor...');
      await this.prisma.account.update({
        where: { userId_currency: { userId, currency: Currency.AZN } },
        data: { balance: { increment: costAzn }, lockedBalance: { decrement: costAzn } }
      });
      throw new InternalServerErrorException('Borsa hatası, işlem iptal edildi.');
    }

    // 4. Tamamlama (Commit)
    return await this.prisma.$transaction(async (tx) => {
      // Kilitli AZN'yi yak
      await tx.account.update({
        where: { userId_currency: { userId, currency: Currency.AZN } },
        data: { lockedBalance: { decrement: costAzn } }
      });

      // USDT Ekle (Borsadan gelen net miktarı Decimal'e çevirip ekle)
      const filledAmountDecimal = new Prisma.Decimal(order.filledAmount);

      await tx.account.upsert({
        where: { userId_currency: { userId, currency: Currency.USDT } },
        update: { balance: { increment: filledAmountDecimal } },
        create: { userId, currency: Currency.USDT, balance: filledAmountDecimal, lockedBalance: 0 }
      });

      // Logla
      return await tx.transaction.create({
        data: {
          userId,
          idempotencyKey: order.id,
          type: TransactionType.BUY,
          status: TransactionStatus.COMPLETED,
          amountIn: costAzn,
          amountOut: filledAmountDecimal,
          feeAmount: 0,
        }
      });
    });
  }

  // ==================================================================
  // 🔴 SATIŞ İŞLEMİ (USDT Ver -> AZN Al) - HASSAS MATEMATİK MODU
  // ==================================================================
  async executeSell(userId: string, amountUsdt: number) {
    const amountDecimal = new Prisma.Decimal(amountUsdt);

    this.logger.log(`[TRADE] ${userId} ${amountDecimal} USDT SATMAK istiyor...`);

    // 1. Fiyat Öğren
    let price: number;
    try {
      price = await this.exchangeAdapter.getPrice('USDT_AZN');
    } catch (e) {
      throw new InternalServerErrorException("Borsa fiyatı alınamadı.");
    }

    const priceDecimal = new Prisma.Decimal(price);
    const gainAzn = amountDecimal.mul(priceDecimal); // HASSAS ÇARPMA

    this.logger.log(`[HESAPLAMA] ${amountDecimal} USDT satışı karşılığında ${gainAzn} AZN ödenecek.`);

    // 2. Bakiyeyi Kilitle (USDT)
    try {
      await this.prisma.$transaction(async (tx) => {
        const usdtAccount = await tx.account.findUnique({
          where: { userId_currency: { userId, currency: Currency.USDT } }
        });

        const currentUsdt = usdtAccount ? usdtAccount.balance : new Prisma.Decimal(0);

        // KONTROL: currentUsdt < amountDecimal ?
        if (currentUsdt.lessThan(amountDecimal)) {
          throw new BadRequestException(`Yetersiz USDT Bakiyesi! Mevcut: ${currentUsdt}`);
        }

        // USDT'yi Kilitle
        await tx.account.update({
          where: { userId_currency: { userId, currency: Currency.USDT } },
          data: {
            balance: { decrement: amountDecimal },
            lockedBalance: { increment: amountDecimal }
          }
        });
      });
    } catch (error) {
      this.logger.error(`Satış kilitleme hatası: ${error.message}`);
      throw error;
    }

    // 3. Borsa Emri (SELL)
    let order;
    try {
      order = await this.exchangeAdapter.createOrder('USDT_AZN', OrderSide.SELL, amountDecimal.toNumber());
      if (order.status !== 'FILLED') throw new Error('Borsa reddetti.');
    } catch (exchangeError) {
      // 🚨 Rollback: USDT'yi İade Et
      this.logger.error('Borsa Hatası! USDT iade ediliyor...');
      await this.prisma.account.update({
        where: { userId_currency: { userId, currency: Currency.USDT } },
        data: { balance: { increment: amountDecimal }, lockedBalance: { decrement: amountDecimal } }
      });
      throw new InternalServerErrorException('Borsa hatası, USDT iade edildi.');
    }

    // 4. Tamamlama (Commit)
    return await this.prisma.$transaction(async (tx) => {
      // Kilitli USDT'yi yak
      await tx.account.update({
        where: { userId_currency: { userId, currency: Currency.USDT } },
        data: { lockedBalance: { decrement: amountDecimal } }
      });

      // AZN Ekle
      await tx.account.upsert({
        where: { userId_currency: { userId, currency: Currency.AZN } },
        update: { balance: { increment: gainAzn } },
        create: { userId, currency: Currency.AZN, balance: gainAzn, lockedBalance: 0 }
      });

      // Logla
      return await tx.transaction.create({
        data: {
          userId,
          idempotencyKey: order.id,
          type: TransactionType.SELL,
          status: TransactionStatus.COMPLETED,
          amountIn: amountDecimal,
          amountOut: gainAzn,
          feeAmount: 0,
        }
      });
    });
  }
}