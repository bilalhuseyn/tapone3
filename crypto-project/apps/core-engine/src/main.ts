// Dosya: apps/core-engine/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 🔓 CORS Kilidini Açıyoruz
  // Bu komut, Widget'ın (3004) Backend'e (3000) erişmesine izin verir.
  app.enableCors();

  await app.listen(3000);
  console.log(`🚀 Core Engine is running on: http://localhost:3000`);
}
bootstrap();