// Dosya: apps/core-engine/src/guards/api-key.guard.ts

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();

        // İstekteki "x-api-key" başlığını (header) kontrol et
        const apiKey = request.headers['x-api-key'];

        // Şimdilik basit olması için şifreyi buraya yazıyoruz.
        // Gerçekte bunu .env dosyasından okuruz.
        const SECRET_KEY = 'TAPONE_SUPER_SECRET_KEY_2025';

        if (apiKey !== SECRET_KEY) {
            throw new UnauthorizedException('Erişim Reddedildi: Yanlış veya Eksik API Key!');
        }

        return true; // Şifre doğru, geçebilirsin.
    }
}