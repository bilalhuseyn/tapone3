// Dosya: apps/core-engine/src/app.module.ts

import { Module } from '@nestjs/common';

// 1. Yeni Yarattığımız "Resepsiyonist" (Controller)
import { AppController } from './app.controller';

// 2. Veritabanı Servisi
import { PrismaService } from './prisma.service';

// 3. Senin Daha Önce Kurduğun Güçlü Modüller
// (Klasör yapına göre bunları import ediyoruz)
import { WalletModule } from './wallet/wallet.module';
import { TradeModule } from './trade/trade.module';
import { ExchangeModule } from './exchange/exchange.module';

@Module({
    imports: [
        // Motorun diğer parçalarını buraya bağlıyoruz
        WalletModule,
        TradeModule,
        ExchangeModule,
    ],
    controllers: [AppController], // 👈 Yeni eklediğimiz Controller burada
    providers: [PrismaService],   // 👈 Veritabanı bağlantısı burada
})
export class AppModule { }