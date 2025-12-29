import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
    // Basit bir "Ben çalışıyorum" mesajı
    getHello(): string {
        return 'Mock Bank System is Active! 🏦';
    }

    // İleride webhook simülasyonu için kullanacağımız dummy fonksiyon
    processPayment(amount: number, currency: string) {
        return {
            status: 'SUCCESS',
            transactionId: 'bank_tx_' + Math.floor(Math.random() * 100000),
            timestamp: new Date().toISOString()
        };
    }
}