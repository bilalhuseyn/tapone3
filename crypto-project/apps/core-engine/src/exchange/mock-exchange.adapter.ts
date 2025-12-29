// Dosya: apps/core-engine/src/exchange/mock-exchange.adapter.ts

import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { IExchangeAdapter, OrderSide, OrderResult } from './exchange.interface';
import { firstValueFrom } from 'rxjs';
import { randomUUID } from 'crypto';

@Injectable()
export class MockExchangeAdapter implements IExchangeAdapter {
    private readonly logger = new Logger(MockExchangeAdapter.name);
    private readonly mockUrl = 'http://localhost:3002'; // Mock Exchange Portu

    constructor(private readonly httpService: HttpService) { }

    // 1. Fiyatı Mock Servisten Al
    async getPrice(symbol: string): Promise<number> {
        try {
            const { data } = await firstValueFrom(this.httpService.get(`${this.mockUrl}/price`));
            return Number(data.price);
        } catch (error) {
            this.logger.error('Mock Exchange bağlantı hatası! Varsayılan fiyat dönülüyor.');
            return 1.70; // Fail-safe (Hata durumunda sistem çökmesin)
        }
    }

    // 2. Emri Mock Servise İlet (Simülasyon)
    // apps/core-engine/src/exchange/mock-exchange.adapter.ts

    async createOrder(symbol: string, side: OrderSide, amount: number): Promise<OrderResult> {
        this.logger.log(`[BORSA EMRİ] ${side} ${amount} ${symbol} -> Mock Exchange'e iletiliyor...`);

        // --- DEĞİŞİKLİK BAŞLANGICI ---
        // Gerçek bir bağlantı testi yapalım. Eğer bağlantı yoksa HATA FIRLAT ki "Rollback" çalışsın.
        try {
            // Sadece bağlantı var mı diye kontrol ediyoruz (Fiyat sorarak)
            await firstValueFrom(this.httpService.get(`${this.mockUrl}/price`));
        } catch (e) {
            this.logger.error("🚨 BORSA BAĞLANTISI YOK! İşlem iptal ediliyor.");
            throw new Error("Borsa Erişim Hatası"); // <-- Bu hata TradeService'deki Rollback'i tetikler!
        }
        // --- DEĞİŞİKLİK BİTİŞİ ---

        const currentPrice = await this.getPrice(symbol);

        return {
            id: randomUUID(),
            filledAmount: amount,
            filledPrice: currentPrice,
            status: 'FILLED'
        };
    }

    async getBalance(currency: string): Promise<number> {
        return 1000000; // Sonsuz likiditemiz varmış gibi davranalım
    }
}