// Dosya: apps/core-engine/src/trade/trade.controller.ts

// 1. ADIM: UseGuards'ı import ediyoruz (NestJS'in güvenlik özelliği)
import { Controller, Post, Body, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';

// 2. ADIM: Az önce oluşturduğumuz Güvenlik Görevlisini (Guard) çağırıyoruz
import { ApiKeyGuard } from '../guards/api-key.guard';

import { TradeService } from './trade.service';
import { CreateTradeDto } from './dto/create-trade.dto';

@Controller('trade')
@UseGuards(ApiKeyGuard) // 3. ADIM: <-- İŞTE BURASI! Görevliyi kapıya diktik.
export class TradeController {

    constructor(private readonly tradeService: TradeService) { }

    // Artık bu kapıdan (ve aşağıdaki tüm kapılardan) geçmek için şifre lazım.

    @Post('buy')
    @UsePipes(new ValidationPipe({ transform: true }))
    async buy(@Body() tradeDto: CreateTradeDto) {
        return await this.tradeService.executeBuy(tradeDto.userId, tradeDto.amount);
    }

    @Post('sell')
    @UsePipes(new ValidationPipe({ transform: true }))
    async sell(@Body() tradeDto: CreateTradeDto) {
        return await this.tradeService.executeSell(tradeDto.userId, tradeDto.amount);
    }
}