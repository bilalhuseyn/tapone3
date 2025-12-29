// Dosya: apps/mock-exchange/src/app.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

@Injectable()
export class AppService {
    private readonly logger = new Logger(AppService.name);

    // Fiyatı hafızada tutalım ki ani zıplamalar olmasın
    private currentPrice = 1.70;

    getPrice(symbol: string) {
        // Fiyatı her istekte %1 aşağı veya yukarı oynat (Volatilite)
        const volatility = 0.01; // %1 değişim
        const change = this.currentPrice * volatility * (Math.random() - 0.5);

        // Yeni fiyatı güncelle (Minimum 1.50, Maksimum 1.90 sınırları koyalım)
        this.currentPrice += change;
        if (this.currentPrice < 1.50) this.currentPrice = 1.50;
        if (this.currentPrice > 1.90) this.currentPrice = 1.90;

        // Virgülden sonra 4 hane hassasiyet (Örn: 1.7023)
        const finalPrice = Number(this.currentPrice.toFixed(4));

        return {
            symbol: 'USDT_AZN',
            price: finalPrice, // <-- Artık dinamik!
            timestamp: new Date().toISOString()
        };
    }

    createOrder(symbol: string, side: 'BUY' | 'SELL', amount: number) {
        this.logger.log(`[MOCK EXCHANGE] Yeni Emir: ${side} ${amount} ${symbol}`);

        // O anki güncel fiyat neyse ondan işlemi gerçekleştir
        // (Gerçek hayatta bu fiyat getPrice'dan biraz farklı olabilir ama simülasyon için aynı alıyoruz)
        const executionPrice = Number(this.currentPrice.toFixed(4));

        return {
            id: randomUUID(),
            symbol,
            side,
            filledAmount: amount,
            filledPrice: executionPrice, // <-- İşlem anlık fiyattan yapıldı
            status: 'FILLED',
            timestamp: new Date().toISOString()
        };
    }
}