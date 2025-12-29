// Dosya: apps/core-engine/src/dto/create-transaction.dto.ts

import { IsNumber, IsPositive, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {

    // Gelen "text" verisini zorla "Number"a çevir
    @Type(() => Number)

    // 1. Kural: Sayı olmak zorunda
    @IsNumber({}, { message: 'Miktar bir sayı olmalıdır!' })

    // 2. Kural: Eksi veya Sıfır olamaz
    @IsPositive({ message: 'Miktar 0 dan büyük olmalı!' })

    // 3. Kural: Maksimum limit (Bank Grade Security)
    @Max(10000, { message: 'Tek seferde en fazla 10.000 AZN işlem yapılabilir.' })
    amount: number;
}