import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // Port 3003 as specified
    await app.listen(3003);
}
bootstrap();
