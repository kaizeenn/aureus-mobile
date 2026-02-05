# 📊 Arsitektur Halaman Statistik (Stats Tab) - Versi 2.0

## 🎯 Tujuan Refactoring
1. **Menghilangkan periode selector duplikat** → Gunakan satu selector global
2. **Menyederhanakan data flow** → Filter di parent, pass ke children
3. **Meningkatkan UX clarity** → Pisahkan Analytics dan Reports sections
4. **Menjaga scalability** → Clean architecture untuk fitur masa depan

---

## 📐 Struktur Data Flow

```
Index.tsx (Parent)
│
├─ State Management:
│  ├─ selectedMonth (number)
│  ├─ selectedYear (number)
│  ├─ transactions (Transaction[])  // ALL transactions
│  └─ statsTransactions (Transaction[]) // Alias dari transactions
│
├─ Period Selector (Global)
│  └─ Shared by all components
│
├─ Child Components (Pre-filtered Data):
│  ├─ StatisticsChart
│  │  ├─ Input: statsTransactions, selectedMonth, selectedYear
│  │  └─ Logic: Filter & visualize dalam component
│  │
│  ├─ TransactionByCategory
│  │  ├─ Input: statsTransactions, selectedMonth, selectedYear, wallets
│  │  └─ Logic: Breakdown by category dengan dialog details
│  │
│  └─ MonthlyReports
│     ├─ Input: statsTransactions, selectedMonth, selectedYear, months[]
│     └─ Logic: Summary ringkasan + print functionality
│
└─ Page Layout:
   ├─ Section 1: Analytics (Chart + Category)
   ├─ Divider
   └─ Section 2: Reports (Monthly Report)
```

---

## 🔄 Data Flow Diagram

```
User mengubah Periode (Bulan/Tahun)
           │
           ↓
   selectedMonth & selectedYear state berubah
           │
           ├─→ StatisticsChart re-render
           │   ├─ Terima periode baru
           │   ├─ Filter transaksi sesuai periode
           │   └─ Tampilkan grafik updated
           │
           ├─→ TransactionByCategory re-render
           │   ├─ Terima periode baru
           │   ├─ Filter & breakdown per kategori
           │   └─ List updated
           │
           └─→ MonthlyReports re-render
               ├─ Terima periode baru
               ├─ Hitung summary (income, expense, balance)
               └─ Display updated
```

---

## 📍 Component Details

### 1. Period Selector (Global)
**Location:** `Index.tsx` → Stats Tab Header
**State:** `selectedMonth`, `selectedYear` (parent level)
**Props yang diterima children:**
- `selectedMonth: number` (0-11)
- `selectedYear: number` (YYYY)
- `months: string[]` (nama bulan)

**Design:**
- Single source of truth untuk periode
- Tampil di atas section Analytics
- Label: "Analitik untuk: {Bulan Tahun}"
- Semua komponen otomatis update saat periode berubah

---

### 2. StatisticsChart
**File:** `src/components/StatisticsChart.tsx`
**Purpose:** Visualisasi trend pemasukan vs pengeluaran

**Props:**
```tsx
interface StatisticsChartProps {
  transactions: Transaction[];           // Semua transaksi
  selectedMonth: number;                 // Periode filter (0-11)
  selectedYear: number;                  // Periode filter (YYYY)
  isAllTime?: boolean;                   // Optional: tampilkan all-time trend
}
```

**Logic:**
1. Filter transaksi berdasarkan `selectedMonth` & `selectedYear` di dalam component
2. Group by hari (jika monthly) atau by bulan (jika all-time)
3. Hitung income & expense per group
4. Render bar/line chart dengan recharts

**Output:**
- Bar chart: Income vs Expense per hari/bulan
- Legend & tooltip interaktif
- Responsive design

---

### 3. TransactionByCategory
**File:** `src/components/TransactionByCategory.tsx`
**Purpose:** Breakdown transaksi per kategori dengan pie chart

**Props:**
```tsx
interface TransactionByCategoryProps {
  transactions: Transaction[];           // Semua transaksi
  wallets: Wallet[];                    // Untuk nama wallet
  selectedMonth: number;                // Periode filter
  selectedYear: number;                 // Periode filter
  onDeleteTransaction: (id: string) => void; // Delete handler
}
```

**Features:**
1. **Pie Chart Breakdown**
   - Tampilkan % distribusi kategori
   - Warna berbeda per kategori
   - Hover → tooltip detail

2. **Category Summary List**
   - Per kategori: total nominal + jumlah transaksi
   - Sortable by amount
   - Clickable untuk detail

3. **Transaction Detail Dialog**
   - Klik kategori → tampil detail transaksi
   - Show: tanggal, amount, wallet, description
   - Delete button per transaksi

**Internal Toggle:**
- Income/Expense selector
- Chart & list filter by type
- Sinkron dengan chart

---

### 4. MonthlyReports
**File:** `src/components/MonthlyReports.tsx`
**Purpose:** Ringkasan bulanan + print functionality

**Props:**
```tsx
interface MonthlyReportsProps {
  transactions: Transaction[];           // Semua transaksi (untuk print)
  selectedMonth: number;                // Periode display
  selectedYear: number;                 // Periode display
  months: string[];                     // ["Januari", "Februari", ...]
}
```

**Display:**
```
┌─────────────────────────────────────┐
│ Laporan Bulanan          [Cetak]     │
│ Saldo = Pemasukan − Pengeluaran      │
├─────────────────────────────────────┤
│ ┌─────────┬─────────┬──────────┐    │
│ │Pemasukan│Pengeluaran│ Saldo   │    │
│ │Rp XXX.X │Rp XXX.X │Rp XXX.X │    │
│ └─────────┴─────────┴──────────┘    │
│ 15 transaksi pada Februari 2026      │
└─────────────────────────────────────┘
```

**Print Feature:**
- Klik "Cetak" → window baru dengan laporan formatted
- HTML include: header, summary, tabel detail semua transaksi
- Inline CSS untuk print compatibility
- User bisa print ke PDF atau printer fisik

---

## 🎨 Page Layout Structure

```
STATS TAB
├─ Period Selector Header
│  └─ "Analitik untuk: Februari 2026"
│     [Bulan ▼] [Tahun ▼]
│
├─ ═══════════════════════════════
│   📈 ANALYTICS & BREAKDOWN
│  ═══════════════════════════════
│
├─ [ Statistics Chart ]
│  └─ Bar chart: Income vs Expense per hari
│
├─ [ Transaction by Category ]
│  ├─ Pie chart: breakdown kategori
│  ├─ [Income ▼] [Expense]  (toggle)
│  └─ Category summary list
│
├─ ═══════════════════════════════
│  ⎯⎯⎯⎯⎯⎯⎯⎯ Divider ⎯⎯⎯⎯⎯⎯⎯
│ ═══════════════════════════════
│
├─   📋 REPORTS
│  ═══════════════════════════════
│
└─ [ Monthly Reports ]
   ├─ Ringkasan (Pemasukan, Pengeluaran, Saldo)
   ├─ Explanation: "Saldo = Pemasukan − Pengeluaran"
   ├─ Stats: "15 transaksi pada Februari 2026"
   └─ [Cetak] Button
```

---

## 💡 Key Design Decisions

### 1. Single Period Selector
- **Alasan:** Hindari kebingungan user dengan multiple selectors
- **Benefit:** Data consistency, simplified state management
- **Implementation:** Parent state, passed as props to children

### 2. Filter in Component, not Parent
- **Alasan:** Flexibility untuk different display logic per component
- **Benefit:** Chart bisa group by hari, Reports bisa by bulan
- **Note:** Future optimization: bisa move ke parent jika performa issue

### 3. Two Section Layout
- **Analytics:** Focus pada visualisasi & insight (Chart, Category breakdown)
- **Reports:** Focus pada ringkasan & export (Summary, Print)
- **Benefit:** Clear separation of concerns, better UX organization

### 4. Pre-calculated Summaries
- MonthlyReports tidak perlu internal state
- Semua kalkulasi stateless, pure dari props
- Print functionality extract transaksi sesuai periode

---

## 🔧 Development Guidelines

### Adding New Analytics Component
```tsx
// 1. Create component menerima filtered props
interface NewAnalyticsProps {
  transactions: Transaction[];
  selectedMonth: number;
  selectedYear: number;
  // Additional props as needed
}

// 2. Handle filtering internal
const filtered = transactions.filter(t => {
  const d = new Date(t.date);
  return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
});

// 3. Add to Index.tsx Stats section
<NewAnalyticsComponent
  transactions={statsTransactions}
  selectedMonth={selectedMonth}
  selectedYear={selectedYear}
/>
```

### Modifying Period Selector
- Only change in `Index.tsx` (Stats Tab Header)
- All children automatically receive updated props
- No need to update individual components

---

## ⚡ Performance Considerations

1. **useMemo for calculations** di components jika data besar
2. **Avoid re-filtering** dalam child components jika possible
3. **Lazy load** chart libraries jika needed
4. **Monitor print dialog** saat data sangat banyak

---

## ✅ Testing Checklist

- [ ] Period selector mengubah bulan → semua komponen update
- [ ] Period selector mengubah tahun → semua komponen update
- [ ] Statistics Chart tampil dengan data correct
- [ ] Transaction by Category breakdown accurate
- [ ] Income/Expense toggle di category working
- [ ] Klik kategori → detail dialog muncul
- [ ] Print button generate laporan lengkap
- [ ] Print preview tampil correct
- [ ] Delete transaksi dari dialog working
- [ ] Responsive design di mobile

---

## 📝 Future Enhancements

1. **Export CSV/PDF** from Monthly Reports
2. **Budget comparison** section (budget vs actual)
3. **Year-over-year** trend analysis
4. **Custom date range** selector (beyond month/year)
5. **Forecast** prediction based on historical data
6. **Drill-down** analytics (bulan → minggu → hari)

---

**Version:** 2.0
**Last Updated:** Feb 5, 2026
**Status:** Refactored ✅
