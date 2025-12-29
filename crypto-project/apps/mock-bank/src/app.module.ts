import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service'; // <-- Bu satır olmalı

@Module({
    imports: [],
    controllers: [AppController],
    providers: [AppService], // <-- Bu satır olmalı
})
export class AppModule { }