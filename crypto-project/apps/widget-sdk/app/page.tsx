// Dosya: apps/widget-sdk/app/page.tsx
"use client";

import { useState } from "react";

interface TxResult {
  txId: string;
  sent: string;
  received: string;
  rate: number;
  message: string;
}

export default function Home() {
  const BALANCE = 1250.00; // 🏦 Kullanıcının Sabit Bakiyesi (Şimdilik)

  const [status, setStatus] = useState<'input' | 'loading' | 'success' | 'error'>('input');
  const [amount, setAmount] = useState<string>("100");
  const [result, setResult] = useState<TxResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>(""); // Hata mesajı için

  // 🛡️ GÜVENLİK GÖREVLİSİ (Validasyon)
  const validateAndBuy = async () => {
    setErrorMsg(""); // Önceki hataları temizle
    const val = parseFloat(amount);

    // KURAL 1: Boş olamaz
    if (!amount || isNaN(val)) {
      setErrorMsg("Lütfen geçerli bir miktar girin.");
      return;
    }

    // KURAL 2: Sıfır veya Eksi olamaz
    if (val <= 0) {
      setErrorMsg("Miktar 0'dan büyük olmalıdır.");
      return;
    }

    // KURAL 3: Bakiye Yetersiz
    if (val > BALANCE) {
      setErrorMsg(`Yetersiz Bakiye! (Max: ${BALANCE} AZN)`);
      return;
    }

    // Her şey temizse işleme başla
    handleBuyClick();
  };

  const handleBuyClick = async () => {
    setStatus('loading');

    try {
      const response = await fetch("http://localhost:3000/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data.data);
        setStatus('success');
      } else {
        setErrorMsg(data.message || "Bilinmeyen bir hata oluştu."); // Backend'den gelen hatayı göster
        setStatus('input'); // Hata mesajını göstermek için input ekranında kal
      }

    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  };

  const resetFlow = () => {
    setStatus('input');
    setAmount("100");
    setResult(null);
    setErrorMsg("");
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-slate-900 font-sans">
      <div className="w-full max-w-sm bg-white dark:bg-slate-800 shadow-2xl border border-gray-200 dark:border-slate-700 rounded-3xl overflow-hidden">

        {/* INPUT EKRANI */}
        {status === 'input' || status === 'loading' ? (
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Kripto Al</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
              Bakiyeniz: <span className="text-gray-800 dark:text-white font-bold">{BALANCE.toFixed(2)} AZN</span>
            </p>

            <div className="space-y-6">
              {/* Input Alanı */}
              <div className={`bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border transition-all 
                ${errorMsg ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-transparent focus-within:border-primary'}`}>

                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Ödeyeceğiniz</label>
                <div className="flex justify-between items-center mt-1">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setErrorMsg(""); // Yazmaya başlayınca hatayı sil
                    }}
                    // 🚫 'e' ve '-' harflerini klavyeden engelle
                    onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                    className="w-full bg-transparent text-3xl font-extrabold text-gray-800 dark:text-white outline-none placeholder-gray-300"
                    placeholder="0"
                  />
                  <span className="text-sm font-bold text-gray-500 bg-gray-200 dark:bg-slate-700 dark:text-white px-3 py-1 rounded-full">AZN</span>
                </div>
              </div>

              {/* Hata Mesajı (Varsa Gözükür) */}
              {errorMsg && (
                <div className="text-red-500 text-sm font-medium flex items-center gap-2 animate-pulse">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Ok */}
              <div className="flex justify-center -my-4 relative z-10">
                <div className="bg-white dark:bg-slate-800 p-2 rounded-full shadow-md border dark:border-slate-600">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path></svg>
                </div>
              </div>

              {/* Output */}
              <div className="bg-gray-50 dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-700">
                <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Alacağınız</label>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-3xl font-extrabold text-gray-800 dark:text-white">
                    {amount && parseFloat(amount) > 0 ? (parseFloat(amount) / 1.7).toFixed(2) : "0.00"}
                  </span>
                  <span className="text-sm font-bold text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-full">USDT</span>
                </div>
              </div>
            </div>

            <button
              onClick={validateAndBuy}
              disabled={status === 'loading'}
              className="w-full mt-8 py-4 bg-primary hover:bg-opacity-90 text-white font-bold text-lg rounded-2xl transition-all shadow-lg flex justify-center items-center gap-2"
            >
              {status === 'loading' ? "Kontrol Ediliyor..." : "Satın Al"}
            </button>
          </div>
        ) : null}

        {/* BAŞARI VE HATA EKRANLARI AYNI KALDI (Kod tasarrufu için burayı kısalttım, önceki kodun aynısı çalışır) */}
        {status === 'success' && result ? (
          <div className="p-8 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">İşlem Başarılı!</h2>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-6 mb-8 text-left space-y-3 mt-6">
              <div className="flex justify-between text-sm"><span className="text-gray-400">İşlem No</span><span className="font-mono text-gray-800 dark:text-gray-200">{result.txId}</span></div>
              <div className="flex justify-between text-lg font-bold"><span className="text-gray-800 dark:text-white">Alınan</span><span className="text-green-600 dark:text-green-400">{result.received}</span></div>
            </div>
            <button onClick={resetFlow} className="w-full py-4 bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-white font-bold rounded-2xl">Yeni İşlem Yap</button>
          </div>
        ) : null}

        {status === 'error' ? (
          <div className="p-8 text-center animate-in shake duration-300">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Bağlantı Hatası</h2>
            <button onClick={resetFlow} className="w-full py-4 bg-red-500 text-white font-bold rounded-2xl mt-4">Tekrar Dene</button>
          </div>
        ) : null}

      </div>
    </main>
  );
}