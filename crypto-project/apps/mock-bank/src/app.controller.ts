import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

    constructor(private readonly appService: AppService) { }

    // Core Engine bu adrese (GET /price) istek atıyor
    @Get('price')
    getPrice() {
        this.logger.log('💰 Core Engine fiyat sordu. Cevap: 1.70');

        // Core Engine'in beklediği JSON formatı
        return {
            symbol: 'USDT_AZN',
            price: 1.70,
            timestamp: new Date().toISOString(),
        };
    }
}