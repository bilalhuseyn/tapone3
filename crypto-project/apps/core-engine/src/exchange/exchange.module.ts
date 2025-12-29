// Dosya: apps/core-engine/src/exchange/exchange.module.ts

import { Module, Global } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MockExchangeAdapter } from './mock-exchange.adapter';
import { EXCHANGE_PROVIDER } from './exchange.interface';

@Global() // <-- DİKKAT: Bu modülü Global yapıyoruz ki her yerden erişilsin
@Module({
    imports: [HttpModule],
    providers: [
        {
            provide: EXCHANGE_PROVIDER, // Sistem "Borsa Sağlayıcı" istediğinde...
            useClass: MockExchangeAdapter // ...Ona "Mock Adaptörü" ver.
            // YARIN BURAYI "BinanceAdapter" YAPARSAN TÜM SİSTEM BINANCE OLUR! 🚀
        },
    ],
    exports: [EXCHANGE_PROVIDER],
})
export class ExchangeModule { }