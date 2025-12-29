// Dosya: apps/core-engine/src/trade/dto/create-trade.dto.ts

import { IsString, IsNumber, IsUUID, Min, IsPositive } from 'class-validator';

export class CreateTradeDto {
    @IsUUID('4', { message: 'Geçersiz Kullanıcı ID formatı' })
    userId: string;

    @IsNumber()
    @IsPositive({ message: 'İşlem tutarı pozitif olmalıdır' })
    @Min(1, { message: 'Minimum işlem tutarı 1 birimdir' })
    amount: number;
}