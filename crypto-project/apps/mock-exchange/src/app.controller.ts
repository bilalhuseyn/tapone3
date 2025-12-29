import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) { }

    // Core Engine buraya istek atıyor: GET /price
    @Get('price')
    getPrice() {
        return this.appService.getPrice('USDT_AZN');
    }

    // Core Engine buraya emir gönderiyor: POST /order
    @Post('order')
    createOrder(@Body() body: any) {
        return this.appService.createOrder(body.symbol, body.side, body.amount);
    }
}