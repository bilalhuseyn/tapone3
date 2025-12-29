// Dosya: apps/core-engine/src/app.controller.ts

import { Controller, Get, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller()
export class AppController {

    constructor(private readonly prisma: PrismaService) { }

    @Get()
    getHello(): string {
        return 'TapOne Core Engine (Fresh Start) 🚀';
    }

    @Post('buy')
    @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
    async handleBuyOrder(@Body() data: CreateTransactionDto) {

        console.log("🛡️ Temiz İstek:", data);

        const exchangeRate = 1.70;
        const usdtAmount = (data.amount / exchangeRate).toFixed(2);

        // 💾 VERİTABANINA KAYIT (Senin verdiğin şema ile %100 uyumlu)
        const savedTx = await this.prisma.transaction.create({
            data: {
                // Şemadaki: amountAZN Decimal
                amountAZN: data.amount,

                // Şemadaki: amountUSDT Decimal
                amountUSDT: parseFloat(usdtAmount),

                // Şemadaki: rate Decimal
                rate: exchangeRate,

                // Şemadaki: status String ("SUCCESS" artık serbest metin, Enum değil)
                status: "SUCCESS"
            }
        });

        console.log("✅ DB Kayıt ID:", savedTx.id);

        return {
            success: true,
            message: "İşlem Başarılı ✅",
            data: {
                sent: `${data.amount} AZN`,
                received: `${usdtAmount} USDT`,
                rate: exchangeRate,
                txId: savedTx.id
            }
        };
    }
}