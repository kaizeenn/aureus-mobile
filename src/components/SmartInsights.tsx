import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Quote } from 'lucide-react';
import { Transaction } from '@/pages/Index';

interface SmartInsightsProps {
  transactions: Transaction[];
}

const MONEY_QUOTES = [
  "Uang tidak bisa membeli kebahagiaan, tapi lebih enak menangis di dalam Mercedes daripada di atas sepeda.",
  "Hemat pangkal kaya, tapi kalau pelit pangkal dijauhi teman.",
  "Jangan menabung apa yang tersisa setelah belanja, tapi belanjalah apa yang tersisa setelah menabung.",
  "Aturan No.1: Jangan pernah rugi. Aturan No.2: Jangan lupa Aturan No.1.",
  "Terlalu banyak orang menghabiskan uang yang tidak mereka miliki, untuk membeli barang yang tidak mereka butuhkan, demi membuat kagum orang yang tidak mereka sukai.",
  "Investasi dalam pengetahuan selalu membayar bunga terbaik.",
  "Bukan seberapa banyak uang yang kamu hasilkan, tapi seberapa banyak yang kamu simpan.",
  "Uang adalah hamba yang baik, tapi tuan yang buruk.",
  "Orang kaya punya TV kecil dan perpustakaan besar. Orang miskin punya TV besar dan tidak punya perpustakaan.",
  "Hati-hati dengan pengeluaran kecil; kebocoran kecil bisa menenggelamkan kapal besar.",
  "Saya suka uang saya berada di tempat yang bisa saya lihat: tergantung di lemari pakaian saya. (Carrie Bradshaw)",
  "Satu-satunya cara untuk tidak memikirkan uang adalah dengan memiliki banyak uang.",
  "Waktu adalah uang. Kalau kamu buang-buang waktu, kamu buang-buang uang.",
  "Gaji itu seperti menstruasi, datang sebulan sekali, tapi nyerinya bisa seminggu.",
  "Jika Anda berutang $100 pada bank, itu masalah Anda. Jika Anda berutang $100 juta, itu masalah bank."
];

const SmartInsights: React.FC<SmartInsightsProps> = () => {
  const [quote, setQuote] = useState("");

  useEffect(() => {
    // Pick a random quote on mount
    const randomQuote = MONEY_QUOTES[Math.floor(Math.random() * MONEY_QUOTES.length)];
    setQuote(randomQuote);
  }, []);

  return (
    <Card className="border-2 border-primary/20 shadow-[4px_4px_0px_0px_rgba(var(--primary),0.2)] hover:shadow-[6px_6px_0px_0px_rgba(var(--primary),0.4)] transition-all duration-300">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-display">
          <Quote className="h-5 w-5 text-primary rotate-180" />
          Kata Bijak (Mungkin)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative p-6 bg-primary/5 rounded-lg border border-dashed border-primary/30">
          <Quote className="absolute top-2 left-2 h-8 w-8 text-primary/10 -scale-x-100" />
          <p className="text-lg font-medium text-center italic text-foreground/80 font-serif leading-relaxed">
            "{quote}"
          </p>
          <Quote className="absolute bottom-2 right-2 h-8 w-8 text-primary/10" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SmartInsights;