// Dosya: apps/core-engine/src/exchange/exchange.interface.ts

// Emir Tipleri
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

// Emrin Sonucu
export interface OrderResult {
  id: string;          // Borsa tarafındaki Emir ID (Kanıt)
  filledAmount: number; // Gerçekleşen Miktar
  filledPrice: number;  // Gerçekleşen Fiyat
  status: 'FILLED' | 'PARTIAL' | 'FAILED';
}

// ADAPTÖR SÖZLEŞMESİ (Tüm borsalar buna uymak zorunda)
export interface IExchangeAdapter {
  // 1. Fiyat Sorgula
  getPrice(symbol: string): Promise<number>;

  // 2. Emir Gönder (Al/Sat)
  createOrder(symbol: string, side: OrderSide, amount: number): Promise<OrderResult>;

  // 3. Borsa Bakiyesini Kontrol Et (Bizim paramız var mı?)
  getBalance(currency: string): Promise<number>;
}

// Dependency Injection için Token (NestJS'e "Bana Borsa Ver" demek için bunu kullanacağız)
export const EXCHANGE_PROVIDER = 'EXCHANGE_PROVIDER';