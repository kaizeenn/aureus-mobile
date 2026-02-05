# 📋 Dokumentasi Revisi Aplikasi Finansial v3.0

**Status:** Architecture Refactoring & Optimization  
**Date:** 5 Februari 2026  
**Version:** 3.0 (dari v2.0)  
**Target:** Production-ready, maintainable, scalable

---

## 📌 Executive Summary

Revisi ini fokus pada:
1. **Eliminasi logic duplikat** - Filtering dipindah ke parent level
2. **Clear state ownership** - Satu sumber kebenaran untuk data
3. **Safer UX** - Hapus fitur berbahaya (delete di analytics)
4. **Better performance** - Pagination, useMemo, virtual lists
5. **Maintainability** - Kode lebih mudah dirawat jangka panjang

**Result:** Aplikasi lebih solid, bug lebih sedikit, scaling lebih mudah.

---

## 🔴 PERUBAHAN #1: Filtering & Data Flow Optimization

### Problem (v2.0)
```tsx
// SEBELUM: Child components melakukan filtering sendiri (REDUNDANT)
<StatisticsChart
  transactions={statsTransactions}  // Semua transaksi
  selectedMonth={selectedMonth}
  selectedYear={selectedYear}
/>
// Di dalam StatisticsChart:
// const filtered = transactions.filter(t => {
//   const d = new Date(t.date);
//   return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
// });
```

**Masalah:**
- 3 komponen (StatisticsChart, TransactionByCategory, MonthlyReports) filter data sama
- Logic duplikat = buggy jika perlu ubah filter logic
- Inefficient - filter 1000 transaksi 3x per render

### Solution (v3.0)

#### A. Create Stats Wrapper Component
```tsx
// src/pages/StatsPage.tsx (NEW)
import React, { useState, useMemo } from 'react';
import StatisticsChart from '@/components/StatisticsChart';
import TransactionByCategory from '@/components/TransactionByCategory';
import MonthlyReports from '@/components/MonthlyReports';
import { Transaction, Wallet } from '@/types';

interface StatsPageProps {
  transactions: Transaction[];
  wallets: Wallet[];
  onDeleteTransaction: (id: string) => void;
}

const StatsPage: React.FC<StatsPageProps> = ({
  transactions,
  wallets,
  onDeleteTransaction,
}) => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // ✅ SINGLE FILTERING LOGIC - di parent, computed once
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    });
  }, [transactions, selectedMonth, selectedYear]);

  // Untuk MonthlyReports yang perlu semua transaksi
  const statsTransactions = transactions;

  return (
    <div className="space-y-8">
      {/* Period Selector - Global */}
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Analitik untuk: <span className="text-primary">{months[selectedMonth]} {selectedYear}</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-[130px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-[90px] h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ANALYTICS SECTION */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Analitik & Breakdown
        </h2>

        {/* Pass PRE-FILTERED data, no filtering inside */}
        <StatisticsChart
          transactions={filteredTransactions}  // ✅ Already filtered!
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
        
        <TransactionByCategory 
          transactions={filteredTransactions}  // ✅ Already filtered!
          wallets={wallets}
          onDeleteTransaction={onDeleteTransaction}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </section>

      {/* REPORTS SECTION */}
      <section className="space-y-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Laporan
        </h2>

        {/* MonthlyReports untuk print juga pakai filtered data */}
        <MonthlyReports 
          transactions={filteredTransactions}  // ✅ Already filtered!
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          months={months}
        />
      </section>
    </div>
  );
};

export default StatsPage;
```

#### B. Child Components HANYA menerima data terfilter
```tsx
// src/components/StatisticsChart.tsx (REVISED v3.0)
interface StatisticsChartProps {
  transactions: Transaction[];  // ✅ SUDAH TERFILTER by period
  selectedMonth: number;        // ✅ Untuk display saja
  selectedYear: number;         // ✅ Untuk display saja
}

const StatisticsChart: React.FC<StatisticsChartProps> = ({
  transactions,
  selectedMonth,
  selectedYear,
}) => {
  // ✅ HANYA visualisasi data yang sudah terfilter
  // TIDAK melakukan filtering lagi
  
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const chartData = Array.from({ length: daysInMonth }, (_, idx) => {
    const day = idx + 1;
    return { label: day.toString(), income: 0, expense: 0 };
  });

  for (const t of transactions) {
    const d = new Date(t.date);
    const day = d.getDate();
    const bucket = chartData[day - 1];
    if (!bucket) continue;

    if (t.type === 'income') bucket.income += t.amount;
    if (t.type === 'expense') bucket.expense += t.amount;
  }

  return (
    <Card>
      {/* Chart visualization */}
      <ChartContainer>
        <BarChart data={chartData}>
          {/* recharts implementation */}
        </BarChart>
      </ChartContainer>
    </Card>
  );
};
```

### Benefits
- ✅ Filtering logic di ONE place (parent)
- ✅ Child components DUMB - hanya visualisasi
- ✅ Performance: filter 1x, not 3x
- ✅ Easier to debug & maintain
- ✅ useMemo mencegah filtering ulang unnecessary

---

## 🔴 PERUBAHAN #2: Hapus `isAllTime` dari Stats Tab

### Problem (v2.0)
```tsx
// State di Index.tsx
const [isAllTime, setIsAllTime] = useState(false);

// Di Stats tab:
{activeTab === 'stats' && (
  <div>
    {/* isAllTime ada atau tidak? confusing! */}
  </div>
)}
```

**Masalah:**
- `isAllTime` buat Home tab (TransactionSummary)
- Tapi juga used di Stats tab filtering
- Confusing: bikin 2 konteks berbeda pakai state sama
- Bug: ubah isAllTime di Home, bisa affect Stats

### Solution (v3.0)

#### A. Remove `isAllTime` dari Stats Tab
```tsx
// Index.tsx - HANYA gunakan di Home tab
const [isAllTime, setIsAllTime] = useState(false);  // ✅ HANYA untuk Home

{activeTab === 'stats' && (
  <StatsPage
    transactions={statsTransactions}
    wallets={wallets}
    onDeleteTransaction={deleteTransaction}
  />
  // ✅ isAllTime NOT passed - Stats ALWAYS period-based
)}
```

#### B. Stats Tab - Always Period-Based
```tsx
// src/pages/StatsPage.tsx
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

// ✅ ALWAYS filter by period, no "all-time" mode
const filteredTransactions = useMemo(() => {
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });
}, [transactions, selectedMonth, selectedYear]);

// If future want all-time analytics:
// Create NEW component <AllTimeAnalyticsPage /> dengan state terpisah
```

#### C. Add Mode State jika dibutuhkan (future)
```tsx
// Option untuk future: all-time analytics mode
type StatsViewMode = 'monthly' | 'yearly' | 'alltime';

const [viewMode, setViewMode] = useState<StatsViewMode>('monthly');

// State terpisah untuk setiap mode
const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

// Selalu jelas konteksnya
```

### Benefits
- ✅ State lebih jelas & dedicated
- ✅ Tidak ada side-effect antara tabs
- ✅ Stats ALWAYS period-based (expected behavior)
- ✅ Easier to add future modes (yearly, quarterly)

---

## 🔴 PERUBAHAN #3: Transaction Deletion Policy (Read-Only Analytics)

### Problem (v2.0)
```tsx
// Delete button ada di TransactionByCategory (Stats tab)
<Button onClick={() => onDeleteTransaction(id)}>
  ❌ Hapus
</Button>

// Masalah:
// - User bisa delete transaksi sambil lagi review stats
// - Bisa terjadi unintended delete (oops, klik salah)
// - Tidak konsisten: Home bisa delete, Stats bisa delete
// - Data berubah saat sedang analisis (confusing)
```

### Solution (v3.0)

#### A. HAPUS delete dari Stats Tab
```tsx
// src/components/TransactionByCategory.tsx (v3.0)
interface TransactionByCategoryProps {
  transactions: Transaction[];
  wallets: Wallet[];
  selectedMonth: number;
  selectedYear: number;
  // ✅ REMOVED: onDeleteTransaction
}

// Dalam detail dialog:
<Dialog>
  <DialogContent>
    <div className="space-y-2">
      {filteredTransactions.map(t => (
        <div key={t.id} className="flex justify-between items-center p-3 border rounded">
          <div>
            <p className="font-medium">{t.category}</p>
            <p className="text-sm text-muted-foreground">{t.description}</p>
            <p className="text-xs text-muted-foreground">
              {new Date(t.date).toLocaleDateString('id-ID')}
            </p>
          </div>
          <p className="font-semibold">Rp {t.amount.toLocaleString('id-ID')}</p>
          {/* ✅ NO DELETE BUTTON */}
        </div>
      ))}
    </div>
  </DialogContent>
</Dialog>
```

#### B. Delete HANYA di Home Tab (Buku Besar)
```tsx
// src/components/TransactionTable.tsx (Home Tab only)
{filteredTransactions.map(t => (
  <TableRow key={t.id}>
    <TableCell>{new Date(t.date).toLocaleDateString('id-ID')}</TableCell>
    <TableCell>{t.category}</TableCell>
    <TableCell>Rp {t.amount.toLocaleString('id-ID')}</TableCell>
    <TableCell>
      {/* ✅ DELETE BUTTON - HANYA di Home */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onDeleteTransaction(t.id)}
      >
        ❌ Hapus
      </Button>
    </TableCell>
  </TableRow>
))}
```

#### C. Add UX Warning/Hint
```tsx
// Di atas Stats tab:
<Alert>
  <AlertDescription>
    💡 <strong>Tip:</strong> Stats bersifat read-only (analytics saja).
    Untuk menghapus transaksi, gunakan menu HOME → Buku Besar.
  </AlertDescription>
</Alert>
```

### Benefits
- ✅ Safer UX - prevent unintended delete
- ✅ Clear separation: Home=editable, Stats=read-only
- ✅ Consistent mental model: "Analytics is read-only"
- ✅ Less error-prone

---

## 🔴 PERUBAHAN #4: Wallet Balance Single Source of Truth

### Problem (v2.0)
```tsx
// 2 sumber balance beroperasi paralel (DANGEROUS)

// Sumber 1: wallet.balance (stored)
let wallet = { id: '1', balance: 1000000 };

// Sumber 2: calculate dari transactions
const balance = calculateWalletBalance(walletId, transactions);
// = 1000000 - 50000 + 5000000 = 5950000

// Masalah: Mana yang benar? Bisa inconsistent!
```

### Solution (v3.0)

#### Option A: Wallet.balance = initialBalance ONLY
```tsx
// src/types/index.ts
interface Wallet {
  id: string;
  name: string;
  initialBalance: number;  // ✅ Starting balance saja
  color: string;
  type: 'bank' | 'ewallet' | 'cash';
}

// Calculate current balance saat runtime
function calculateWalletBalance(walletId: string, transactions: Transaction[]): number {
  const wallet = wallets.find(w => w.id === walletId);
  if (!wallet) return 0;
  
  let balance = wallet.initialBalance;  // ✅ Start dari initial
  
  for (const t of transactions) {
    if (t.walletId === walletId) {
      if (t.type === 'income') balance += t.amount;
      if (t.type === 'expense') balance -= t.amount;
    }
    
    if (t.toWalletId === walletId) {
      balance += t.amount;  // Transfer in
    }
    
    if (t.fromWalletId === walletId) {
      balance -= t.amount;  // Transfer out
    }
  }
  
  return balance;
}

// Index.tsx - compute wallets dengan balance
const walletWithBalance = useMemo(() => {
  return wallets.map(wallet => ({
    ...wallet,
    balance: calculateWalletBalance(wallet.id, transactions),
  }));
}, [wallets, transactions]);
```

#### Option B: Store balance but recalculate on every render
```tsx
// TIDAK DISIMPAN di state
// SELALU dihitung dari transactions

// Pro: Single source of truth (transactions)
// Con: Slight performance cost di render

// Use dalam component:
<div>
  <p>Saldo: Rp {calculateWalletBalance(walletId, transactions)}</p>
</div>
```

**Rekomendasi:** Gunakan **Option A** - calculated balance saat runtime

### Implementation
```tsx
// Index.tsx
const [wallets, setWallets] = useState<Wallet[]>(DEFAULT_WALLETS);
const [transactions, setTransactions] = useState<Transaction[]>([]);

// ✅ Computed value, NOT state
const walletsWithBalance = useMemo(() => {
  return wallets.map(wallet => ({
    ...wallet,
    balance: calculateWalletBalance(wallet.id, transactions),
  }));
}, [wallets, transactions]);

// Pass ke komponen:
<AccountManager
  wallets={walletsWithBalance}  // ✅ Balance sudah calculated
  {...props}
/>

// NEVER update wallet.balance directly!
// ONLY update wallet.initialBalance jika correction
```

### Benefits
- ✅ Single source of truth: transactions
- ✅ No risk of inconsistent state
- ✅ Balance always correct
- ✅ Easier to debug

---

## 🔴 PERUBAHAN #5: Home Transaction Table Optimization

### Problem (v2.0)
```tsx
// Render ALL transactions by default (isAllTime=true)
<TransactionTable 
  transactions={filteredTransactions}
  isAllTime={true}  // ✅ SHOW ALL!
/>

// Masalah:
// - 1000+ transaksi = slow render
// - User scroll forever
// - UX: overwhelming
```

### Solution (v3.0)

#### A. Default: Current Month Only
```tsx
// src/pages/Index.tsx (Home Tab)
const [showAllTransactions, setShowAllTransactions] = useState(false);

// Filter logic
const homeTransactions = useMemo(() => {
  if (showAllTransactions) {
    return filteredTransactions;  // All from selected wallet
  } else {
    // ✅ Default: current month only
    const now = new Date();
    return filteredTransactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  }
}, [filteredTransactions, showAllTransactions]);

return (
  <div className="space-y-6">
    {/* Summary */}
    <TransactionSummary {...props} />
    
    {/* Buku Besar */}
    <TransactionTable 
      transactions={homeTransactions}
      onDeleteTransaction={deleteTransaction}
    />
    
    {/* ✅ Explicit button */}
    {!showAllTransactions && (
      <Button
        variant="outline"
        onClick={() => setShowAllTransactions(true)}
        className="w-full"
      >
        📋 Lihat Semua Transaksi
      </Button>
    )}
    
    {showAllTransactions && (
      <Button
        variant="outline"
        onClick={() => setShowAllTransactions(false)}
        className="w-full"
      >
        ⬆️ Tampilkan Bulan Ini Saja
      </Button>
    )}
  </div>
);
```

#### B. Virtual List jika data banyak
```tsx
// Use react-window untuk 1000+ items
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={homeTransactions.length}
  itemSize={80}
  width="100%"
>
  {({ index, style }) => (
    <div style={style} className="p-3 border-b">
      {/* Render transaction item */}
      {homeTransactions[index]}
    </div>
  )}
</FixedSizeList>
```

#### C. Pagination Alternative
```tsx
const itemsPerPage = 20;
const [currentPage, setCurrentPage] = useState(1);

const paginatedTransactions = useMemo(() => {
  const start = (currentPage - 1) * itemsPerPage;
  return homeTransactions.slice(start, start + itemsPerPage);
}, [homeTransactions, currentPage]);

const totalPages = Math.ceil(homeTransactions.length / itemsPerPage);

return (
  <>
    <TransactionTable transactions={paginatedTransactions} />
    
    <div className="flex justify-center gap-2 mt-4">
      {Array.from({ length: totalPages }, (_, i) => (
        <Button
          key={i + 1}
          variant={currentPage === i + 1 ? 'default' : 'outline'}
          onClick={() => setCurrentPage(i + 1)}
        >
          {i + 1}
        </Button>
      ))}
    </div>
  </>
);
```

### Benefits
- ✅ Faster initial load (current month only)
- ✅ Better UX (not overwhelming)
- ✅ Explicit user intent (click to see more)
- ✅ Scalable to 10000+ transactions

---

## 🔴 PERUBAHAN #6: Smart Insights Optimization

### Problem (v2.0)
```tsx
// Show quote setiap render
<SmartInsights transactions={filteredTransactions} />

// Masalah:
// - Quote random setiap kali tab switch (jarring)
// - Tidak essential feature
// - Bisa di-skip untuk performance
```

### Solution (v3.0)

#### A. Show 1x per day only
```tsx
// src/components/SmartInsights.tsx (v3.0)
const SmartInsights: React.FC<SmartInsightsProps> = () => {
  const [quote, setQuote] = useState("");
  const [lastShownDate, setLastShownDate] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = localStorage.getItem('smartInsightsDate');
    
    // ✅ Show new quote hanya 1x per hari
    if (savedDate !== today) {
      const randomQuote = MONEY_QUOTES[
        Math.floor(Math.random() * MONEY_QUOTES.length)
      ];
      setQuote(randomQuote);
      localStorage.setItem('smartInsightsDate', today);
    } else {
      // Load quote dari kemarin
      const savedQuote = localStorage.getItem('smartInsightsQuote');
      if (savedQuote) setQuote(savedQuote);
    }
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kata Bijak Hari Ini</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="italic text-center">"{quote}"</p>
      </CardContent>
    </Card>
  );
};
```

#### B. Alternative: Make it Optional
```tsx
// Add toggle di More tab
const [enableSmartInsights, setEnableSmartInsights] = useState(true);

// Then conditionally render:
{enableSmartInsights && <SmartInsights />}

// Save preference:
useEffect(() => {
  localStorage.setItem('enableSmartInsights', JSON.stringify(enableSmartInsights));
}, [enableSmartInsights]);
```

#### C. Lazy Load
```tsx
// Don't load immediately
const SmartInsightsLazy = lazy(() => import('@/components/SmartInsights'));

<Suspense fallback={<div />}>
  <SmartInsightsLazy />
</Suspense>
```

### Benefits
- ✅ Non-jarring (same quote all day)
- ✅ Optional feature
- ✅ Better performance
- ✅ User preference respected

---

## 🔴 PERUBAHAN #7: Subscription Auto-Renewal Safety

### Problem (v2.0)
```tsx
// Setiap subscription yang renewal = 1 toast
// Jika ada 3 subscription renewal:
// ✅ Netflix diperpanjang
// ✅ Spotify diperpanjang
// ✅ Rumah Pintar diperpanjang

// Masalah: Spam notifications
// App lama tidak dibuka → semua renewal langsung di-batch
```

### Solution (v3.0)

#### A. Batch Renewal dengan Single Toast
```tsx
// src/components/SubscriptionManager.tsx (v3.0)
const checkRenewals = useCallback(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const renewedSubscriptions: Subscription[] = [];
  const newSubscriptions = subscriptions.map(sub => {
    let nextDate = new Date(sub.nextPaymentDate);
    nextDate.setHours(0, 0, 0, 0);

    if (today >= nextDate) {
      // ✅ Collect renewed subs
      renewedSubscriptions.push(sub);
      
      // Create transaction
      onAddTransaction({
        type: 'expense',
        amount: sub.amount,
        category: 'Langganan',
        description: `Perpanjangan: ${sub.name}`,
        date: new Date().toISOString(),
      });

      // Calculate next date
      const nextNextDate = new Date(nextDate);
      nextNextDate.setDate(nextNextDate.getDate() + sub.cycleDays);
      
      return { ...sub, nextPaymentDate: nextNextDate.toISOString() };
    }
    return sub;
  });

  // ✅ SINGLE toast for all renewals
  if (renewedSubscriptions.length > 0) {
    const names = renewedSubscriptions.map(s => s.name).join(', ');
    toast({
      title: `✅ ${renewedSubscriptions.length} Langganan Diperpanjang`,
      description: `${names} telah dicatat otomatis.`,
      duration: 5000,  // Show 5 seconds only
    });

    setSubscriptions(newSubscriptions);
  }
}, [subscriptions, onAddTransaction]);
```

#### B. Defer Renewal untuk Overdue Subs
```tsx
// Jika app tidak dibuka 30 hari:
// Don't renewal semua langsung, tapi queue them

const [pendingRenewals, setPendingRenewals] = useState<string[]>([]);

const processRenewal = useCallback((subscriptionIds: string[]) => {
  // Process max 3 per 5 detik (prevent spam)
  const batch = subscriptionIds.slice(0, 3);
  const remaining = subscriptionIds.slice(3);

  // Process batch
  batch.forEach(id => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      onAddTransaction({...});
    }
  });

  // Queue remaining
  if (remaining.length > 0) {
    setTimeout(() => processRenewal(remaining), 5000);
  }
}, [subscriptions, onAddTransaction]);
```

#### C. Show Renewal Summary
```tsx
// Show preview sebelum process
<Alert>
  <AlertDescription>
    📋 Ditemukan 5 langganan yang akan diperpanjang:
    <ul className="mt-2 ml-4">
      <li>✓ Netflix - Rp 149.000</li>
      <li>✓ Spotify - Rp 54.900</li>
      <li>✓ Rumah Pintar - Rp 199.000</li>
      <li>✓ Gym - Rp 100.000</li>
      <li>✓ Cloud Storage - Rp 79.000</li>
    </ul>
    <Button className="mt-3" onClick={handleRenewAll}>
      Proses Semua Sekarang
    </Button>
  </AlertDescription>
</Alert>
```

### Benefits
- ✅ No notification spam
- ✅ Clear summary
- ✅ Batch processing
- ✅ Better UX (user control)

---

## 🔴 PERUBAHAN #8: Documentation Update

### A. State Management (Updated)

#### Before (v2.0)
```
Index.tsx (Global State)
├─ wallets: Wallet[]
├─ transactions: Transaction[]
├─ categories: Category[]
├─ selectedWalletId
├─ isAllTime (CONFUSING)
├─ selectedMonth, selectedYear
└─ ... 8+ more states
```

#### After (v3.0) - Clear Ownership
```
INDEX.TSX (Global State)
├─ Core Data:
│  ├─ wallets: Wallet[] ✅
│  ├─ transactions: Transaction[] ✅ (SOURCE OF TRUTH)
│  ├─ categories: Category[] ✅
│  └─ subscriptions: Subscription[] ✅
│
├─ Home Tab State:
│  ├─ selectedWalletId ✅
│  └─ isAllTime ✅ (Home only)
│
├─ Stats Tab State: (Moved to StatsPage)
│  ├─ selectedMonth ✅
│  └─ selectedYear ✅
│
├─ UI State:
│  ├─ activeTab ✅
│  ├─ showForm, showVoiceInput ✅
│  └─ currentPage ✅
└─ Modal State:
   └─ showBackupRestore ✅

COMPUTED VALUES (useMemo):
├─ filteredTransactions (by wallet)
├─ statsTransactions (all)
├─ walletsWithBalance (calculated)
└─ homeTransactions (current month + toggle)
```

### B. Stats Tab Data Flow (Updated)

#### Before (v2.0)
```
Index.tsx
├─ Pass: transactions, selectedMonth, selectedYear
└─ StatisticsChart (filter sendiri)
└─ TransactionByCategory (filter sendiri)
└─ MonthlyReports (filter sendiri)
```

#### After (v3.0) - Single Filtering
```
StatsPage.tsx (New wrapper)
├─ useMemo: filteredTransactions ✅
├─ selectedMonth, selectedYear state
└─ Pass PRE-FILTERED data:
   ├─ StatisticsChart (visualize)
   ├─ TransactionByCategory (visualize, read-only)
   └─ MonthlyReports (summarize, read-only)
```

### C. Performance Best Practices

#### New Section in Docs
```markdown
## Performance Optimization

### 1. Data Filtering
- Filter ONCE at parent level (useMemo)
- Child components receive pre-filtered data
- No duplicate filtering logic

### 2. Wallet Balance
- Calculate ONCE per transaction change
- Use useMemo to prevent recalculation
- Single source of truth: transactions array

### 3. Home Transaction List
- Default: current month only
- Pagination or virtual list for large datasets
- Explicit "Show All" button

### 4. Smart Insights
- Show 1x per day only
- Optional feature toggle
- Lazy load if not enabled

### 5. Subscription Renewals
- Batch process renewals
- Single notification for multiple renewals
- Queue overdue renewals

### 6. useMemo Strategy
```tsx
// Recompute when dependencies change
const filteredTransactions = useMemo(() => {
  return transactions.filter(...)
}, [transactions, selectedMonth, selectedYear]);

// Use in multiple places without re-filtering
```

### D. Single Source of Truth Pattern

```markdown
## Single Source of Truth (SSOT)

### Current Implementation
1. **Transactions** = main SSOT
   - All user actions → update transactions
   - Balance calculated FROM transactions
   - Analytics computed FROM transactions

2. **Wallets** = store initialBalance only
   - Current balance = initialBalance + transactions
   - NEVER update balance directly

3. **Subscriptions** = independent
   - Store subscription config
   - On renewal: create transaction (update transactions)

4. **Categories** = list of available categories
   - User can add/remove categories
   - References in transactions

### Data Integrity Rules
- ✅ Always calculate wallet balance from transactions
- ✅ Never have parallel balance tracking
- ✅ All mutations go through transactions array
- ✅ Derived values use useMemo
```

### E. Read-Only Analytics Principle

```markdown
## Read-Only Analytics Principle

### Home Tab (Editable)
- User CAN add transactions
- User CAN edit/delete transactions
- User CAN transfer between wallets
- State: mutable

### Stats Tab (Read-Only)
- User can ONLY view analytics
- User CANNOT delete transactions
- User CANNOT modify data
- Purpose: Analysis & Insight
- State: derived/computed only

### Benefits
- Safer UX (prevent accidental delete)
- Clear mental model
- Consistent behavior
- Easier to reason about

### Enforcement
- Remove `onDeleteTransaction` prop from Stats components
- Add warnings/hints in UI
- Use `readonly` TypeScript when possible
```

---

## 📊 Summary of Changes

| Aspek | v2.0 (Before) | v3.0 (After) | Benefit |
|-------|---|---|---|
| **Filtering Logic** | Child components | Parent (useMemo) | Single source, better perf |
| **isAllTime State** | Global (confusing) | Home-only | Clear ownership |
| **Delete Feature** | Everywhere | Home only | Safer UX |
| **Wallet Balance** | Multiple sources | Calculated once | No conflicts |
| **Home Table** | All transactions | Current month + toggle | Better UX |
| **Smart Insights** | Every render | 1x per day | Less jarring |
| **Subscription Renewal** | Multiple toasts | Batch notification | No spam |
| **Documentation** | Basic | Detailed with patterns | Better maintenance |

---

## 🔧 Implementation Roadmap

### Phase 1 (Week 1)
- [ ] Update StatsPage wrapper component
- [ ] Refactor filtering logic (useMemo)
- [ ] Remove delete from Stats components
- [ ] Remove isAllTime from Stats

### Phase 2 (Week 2)
- [ ] Implement wallet balance calculation
- [ ] Optimize Home transaction table (pagination)
- [ ] Add "Show All" button

### Phase 3 (Week 3)
- [ ] Smart Insights daily quota
- [ ] Batch renewal processing
- [ ] Subscription renewal safety

### Phase 4 (Week 4)
- [ ] Documentation updates
- [ ] Code cleanup & testing
- [ ] Performance profiling

---

## ✅ Validation Checklist

- [ ] No duplicate filtering logic
- [ ] Stats Tab fully read-only
- [ ] Wallet balance single source of truth
- [ ] Home table default: current month
- [ ] Smart Insights 1x per day
- [ ] Subscription renewals batched
- [ ] Documentation updated
- [ ] Code reviewed & tested
- [ ] Performance improved
- [ ] No breaking changes

---

**Version:** 3.0  
**Status:** Ready for Implementation  
**Next Step:** Phase 1 Development
