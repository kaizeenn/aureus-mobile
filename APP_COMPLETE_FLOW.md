# 🏠 Dokumentasi Lengkap Alur Fitur Aplikasi Finansial

**Version:** 2.0  
**Last Updated:** Feb 5, 2026  
**Platform:** React + TypeScript + Capacitor

---

## 📋 Daftar Isi
1. [Struktur Aplikasi](#struktur-aplikasi)
2. [Home Tab](#-home-tab)
3. [Stats Tab](#-stats-tab)
4. [Subs Tab](#-subs-tab)
5. [Settings Tab](#-settings-tab)
6. [More Tab](#-more-tab)
7. [Data Persistence](#-data-persistence)
8. [User Workflows](#-user-workflows)

---

## 🏗️ Struktur Aplikasi

### Navigation Structure
```
┌─────────────────────────────────────────┐
│            Header & Title               │
├─────────────────────────────────────────┤
│                                         │
│      Tab Content (Dynamic)              │
│                                         │
├─────────────────────────────────────────┤
│  📱 | 📊 | 🎫 | ⚙️  | ⋯                  │
│ Home  Stats  Subs  Settings  More       │
└─────────────────────────────────────────┘

Bottom Navigation (5 tabs):
├─ Home    → Ringkasan & Buku Besar
├─ Stats   → Analitik & Laporan
├─ Subs    → Manajemen Langganan
├─ Settings→ Akun & Transfer
└─ More    → Kategori & Backup
```

### State Management (Index.tsx)
```tsx
// Core State
- wallets: Wallet[]                     // Daftar akun/wallet
- transactions: Transaction[]           // Semua transaksi
- categories: Category[]                // Kategori custom user
- selectedWalletId: string              // Wallet yang dipilih

// UI State
- activeTab: NavTab                     // Tab aktif (home|stats|subs|settings|more)
- selectedMonth: number                 // Periode analitik (0-11)
- selectedYear: number                  // Tahun analitik
- isAllTime: boolean                    // Toggle all-time view
- currentPage: 'main' | 'categories'    // Page routing

// Modal State
- showForm: boolean                     // Tampil form transaksi
- showVoiceInput: boolean               // Tampil voice input
- showBackupRestore: boolean            // Tampil backup dialog
```

---

## 📱 HOME TAB

**Purpose:** Pusat aktivitas harian - cepat catat transaksi & lihat riwayat

### Struktur
```
HOME TAB
├─ Action Buttons (Top)
│  ├─ [+ Catat Transaksi] → Buka TransactionForm
│  └─ [🎤 Suara] → Buka VoiceInput
│
├─ 1️⃣ Transaction Summary
│  ├─ Ringkasan hari ini / bulan ini / semua waktu
│  ├─ Total Income, Expense, Balance
│  └─ Toggle: "Hari Ini" / "Bulan Ini" / "Semua Waktu"
│
├─ 2️⃣ Transaction Table (Buku Besar)
│  ├─ Daftar semua transaksi (newest first)
│  ├─ Toggle: Income / Expense
│  ├─ Info per transaksi: tanggal, kategori, amount, wallet
│  ├─ Delete button per transaksi
│  └─ Total kalkulasi per filter
│
└─ 3️⃣ Smart Insights (Kata Bijak)
   └─ Random motivasi finansial (refresh per visit)
```

### Data Flow

#### A. Catat Transaksi (Form)
```
User klik [+ Catat Transaksi]
    ↓
TransactionForm modal tampil
    ↓
User input:
├─ Tipe: Income / Expense
├─ Kategori (dari list)
├─ Amount (Rp)
├─ Wallet/Akun tujuan
├─ Tanggal
└─ Deskripsi (optional)
    ↓
User klik "Simpan"
    ↓
addTransaction() di Index.tsx
    ↓
Buat ID unik: `${Date.now()}-${random}`
Tambah ke transactions[] array
    ↓
localStorage.setItem('transactions')
    ↓
wallet balance auto-update via calculateWalletBalance()
    ↓
Modal tutup, Tab tetap di Home
```

#### B. Voice Input (Voice to Transaction)
```
User klik [🎤 Suara]
    ↓
VoiceInput modal tampil
(Browser API: Web Speech Recognition)
    ↓
User speak: "Makan siang Rp 50 ribu"
    ↓
Component parse speech:
├─ Ekstrak amount: 50000
├─ Ekstrak kategori: "Makan"
├─ Type: default 'expense'
└─ Generate deskripsi dari speech
    ↓
Create transaction dengan parsed data
    ↓
Modal close, transaction added
```

#### C. Transaction Summary Toggle
```
State: isAllTime = false (default: month view)

User klik toggle button
    ↓
setIsAllTime(!isAllTime)
    ↓
TransactionSummary re-render dengan logic:
├─ If isAllTime = true:
│  └─ Calculate sum semua transaksi (all time)
└─ If isAllTime = false:
   ├─ Filter by selectedMonth & selectedYear
   └─ Calculate sum periode tersebut
    ↓
Display updated: Hari Ini / Bulan Ini / Semua Waktu
```

#### D. Transaction Table (Buku Besar)
```
Props: transactions[], isAllTime=true

Render all transactions (no period filter di Home)
    ↓
User toggle: [Income ▼] [Expense]
    ↓
Filter transactions by type
    ↓
Calculate & display TOTAL
    ↓
User klik ❌ delete icon
    ↓
deleteTransaction(id)
    ↓
Update transactions[] (filter out id)
    ↓
Render updated table
```

#### E. Smart Insights
```
On component mount:
    ↓
Select random quote dari MONEY_QUOTES array
    ↓
setQuote(randomQuote)
    ↓
Display dalam card dengan italic styling
    ↓
User refresh page → new quote loaded
```

### Key Components
- **TransactionForm**: Modal form input transaksi
- **VoiceInput**: Speech recognition wrapper
- **TransactionTable**: Buku Besar table view
- **TransactionSummary**: Ringkasan income/expense
- **SmartInsights**: Random financial quotes

---

## 📊 STATS TAB

**Purpose:** Analisa mendalam & laporan finansial bulanan

### Struktur
```
STATS TAB
├─ Period Selector (Global)
│  ├─ Label: "Analitik untuk: Februari 2026"
│  ├─ [Bulan ▼] [Tahun ▼]
│  └─ All components use this period
│
├─ ═══════════════════════════════════
│   📈 ANALYTICS & BREAKDOWN
│  ═══════════════════════════════════
│
├─ 1️⃣ Statistics Chart
│  ├─ Bar/Line chart: Income vs Expense
│  ├─ X-axis: Hari (1-31) atau Bulan
│  ├─ Y-axis: Amount (Rp)
│  ├─ Legend & tooltip interaktif
│  └─ Data: statsTransactions filtered by selectedMonth/Year
│
├─ 2️⃣ Transaction by Category
│  ├─ Pie chart: breakdown kategori (%)
│  ├─ Toggle: [Income ▼] [Expense]
│  ├─ Category summary list:
│  │  └─ Setiap kategori: Total + Count transaksi
│  ├─ Klik kategori → Detail dialog
│  │  └─ Show: tanggal, amount, wallet, description
│  └─ Delete button per transaksi
│
├─ ═══════════════════════════════════
│  ⎯⎯⎯⎯⎯⎯⎯ Visual Divider ⎯⎯⎯⎯⎯⎯⎯
│ ═══════════════════════════════════
│
├─   📋 REPORTS
│  ═══════════════════════════════════
│
└─ 3️⃣ Monthly Reports
   ├─ Summary Cards:
   │  ├─ Pemasukan (Rp)
   │  ├─ Pengeluaran (Rp)
   │  └─ Saldo Bersih (Rp) [bisa minus]
   ├─ Penjelasan: "Saldo = Pemasukan − Pengeluaran"
   ├─ Stat: "X transaksi pada Bulan Tahun"
   └─ [Cetak] Button → Print laporan lengkap
```

### Data Flow

#### A. Period Selection
```
User ubah Bulan / Tahun di selector
    ↓
setSelectedMonth() atau setSelectedYear()
    ↓
All child components trigger re-render dengan:
├─ StatisticsChart(transactions, selectedMonth, selectedYear)
├─ TransactionByCategory(transactions, selectedMonth, selectedYear)
└─ MonthlyReports(transactions, selectedMonth, selectedYear)
    ↓
Setiap component filter transaksi sesuai periode
    ↓
Chart/List/Summary update dengan data baru
```

#### B. Statistics Chart
```
Props: transactions[], selectedMonth, selectedYear

Logic di component:
    ↓
if isAllTime:
  ├─ Group transactions by Month-Year
  ├─ X-axis: Jan 24, Feb 24, ... (truncated view)
  └─ Chart show trend across months
else:
  ├─ Get daysInMonth(selectedMonth, selectedYear)
  ├─ Create array [day1, day2, ..., day31]
  ├─ Populate income/expense per day
  └─ X-axis: 1, 2, 3, ..., 31
    ↓
Render bar chart dengan recharts library
    ↓
Hover tooltip show detail (date, income, expense)
```

#### C. Transaction by Category
```
Props: transactions[], selectedMonth, selectedYear, wallets[]

Filter transaksi by period:
    ↓
const filtered = transactions.filter(t => {
  const d = new Date(t.date);
  return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
});
    ↓
Group by kategori:
├─ Hitung total amount per kategori
├─ Hitung count transaksi per kategori
└─ Create pie chart data
    ↓
Render:
├─ Pie chart (Visual breakdown)
├─ Toggle Income/Expense
├─ Category summary list (clickable)
└─ Total amount per kategori
    ↓
User klik kategori
    ↓
setDetailTransaction(selectedCategory)
    ↓
Dialog modal tampil dengan detail transaksi:
├─ List transaksi untuk kategori tersebut
├─ Per transaksi: tanggal, amount, wallet, deskripsi
└─ Delete button per transaksi
    ↓
User klik delete
    ↓
onDeleteTransaction(id)
    ↓
Update transactions[], dialog close
```

#### D. Monthly Reports
```
Props: transactions[], selectedMonth, selectedYear, months[]

Filter transaksi:
    ↓
const reportTransactions = transactions.filter(t => {
  const d = new Date(t.date);
  return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
});
    ↓
Calculate:
├─ income = sum(transaksi dengan type='income')
├─ expense = sum(transaksi dengan type='expense')
└─ net = income - expense
    ↓
Render summary cards:
├─ Pemasukan: Rp {income}
├─ Pengeluaran: Rp {expense}
└─ Saldo Bersih: Rp {Math.abs(net)} [color: net >= 0 ? green : red]
    ↓
Display stat: "15 transaksi pada Februari 2026"
    ↓
User klik [Cetak] button
    ↓
handlePrint() generate HTML:
├─ Header: "Laporan Bulanan February 2026"
├─ Summary cards (styled)
├─ Detail transaction table:
│  ├─ Tanggal | Jenis | Jumlah | Kategori | Keterangan
│  └─ Setiap row = 1 transaksi
└─ Inline CSS untuk print compatibility
    ↓
window.open() → new window dengan HTML
    ↓
window.print() → browser print dialog
    ↓
User bisa:
├─ Print ke printer fisik
├─ Save as PDF
└─ Cancel print
```

### Key Components
- **StatisticsChart**: Bar/Line chart income vs expense
- **TransactionByCategory**: Pie chart + category breakdown
- **MonthlyReports**: Summary + print functionality

---

## 🎫 SUBS TAB

**Purpose:** Manajemen langganan otomatis (Netflix, Spotify, dll)

### Struktur
```
SUBS TAB
├─ [+ Tambah Langganan] Button
│
├─ 1️⃣ Langganan Aktif (Grid)
│  ├─ Per subscription card:
│  │  ├─ Nama: "Netflix"
│  │  ├─ Nominal: "Rp 149.000"
│  │  ├─ Siklus: "30 hari"
│  │  ├─ Status: "Akan diperpanjang: 15 Feb"
│  │  ├─ Color badge (dari COLORS array)
│  │  └─ [Hapus ❌] button
│  │
│  └─ Repeat untuk setiap langganan
│
└─ 2️⃣ Add/Edit Form
   ├─ Nama Langganan (text input)
   ├─ Nominal (Rp, auto-format)
   ├─ Tanggal Mulai (date picker)
   ├─ Siklus (hari, default 30)
   ├─ ☑️ Buat transaksi sekarang
   └─ [Simpan] [Batal] buttons
```

### Data Flow

#### A. Add Subscription
```
User klik [+ Tambah Langganan]
    ↓
setIsAdding(true)
    ↓
Form input tampil dengan default:
├─ cycleDays: "30"
├─ startDate: today's date
├─ createTransactionNow: true
└─ Amount placeholder: "Rp ___"
    ↓
User input form data
    ↓
User klik [Simpan]
    ↓
Calculate nextPaymentDate:
├─ nextPaymentDate = startDate + cycleDays
└─ Example: 5 Feb + 30 hari = 7 Mar
    ↓
Create subscription object:
{
  id: generate unique ID,
  name: "Netflix",
  amount: 149000,
  startDate: "2026-02-05",
  cycleDays: 30,
  nextPaymentDate: "2026-03-07",
  color: random dari COLORS array
}
    ↓
if createTransactionNow === true:
  ├─ Buat expense transaction:
  │  {
  │    type: 'expense',
  │    amount: 149000,
  │    category: 'Langganan',
  │    description: 'Netflix (Langganan Baru)',
  │    date: today,
  │    walletId: 'default wallet'
  │  }
  └─ onAddTransaction() → add ke transactions
    ↓
setSubscriptions([...subs, newSubscription])
    ↓
localStorage.setItem('subscriptions')
    ↓
setIsAdding(false)
    ↓
Form clear, card ditampilkan di daftar
```

#### B. Auto-Renewal Check (Background)
```
On component mount & whenever subscriptions change:
    ↓
checkRenewals() function runs
    ↓
Get today's date (00:00:00)
    ↓
Loop setiap subscription:
    ├─ Jika today >= nextPaymentDate:
    │  ├─ Create expense transaction:
    │  │  {
    │  │    type: 'expense',
    │  │    amount: sub.amount,
    │  │    category: 'Langganan',
    │  │    description: 'Perpanjangan: Netflix',
    │  │    date: today
    │  │  }
    │  ├─ onAddTransaction()
    │  ├─ Show toast: "Netflix diperpanjang"
    │  ├─ Calculate nextPaymentDate:
    │  │  nextNextDate = nextDate + cycleDays
    │  │  (keep schedule, don't shift)
    │  └─ Update subscription
    └─ Jika belum waktunya: skip
    ↓
setSubscriptions(updated)
    ↓
localStorage.setItem('subscriptions')
```

#### C. Delete Subscription
```
User klik [❌ Hapus] pada subscription card
    ↓
Confirmation dialog: "Hapus Netflix?"
    ↓
If confirm:
  ├─ Remove dari subscriptions[]
  ├─ localStorage.setItem('subscriptions')
  └─ Component re-render
Else: cancel, stay on page
```

### Key Features
- **Auto-renewal**: Background check daily
- **Flexible cycle**: Support any number of days (30, 7, 365, etc)
- **Color coding**: Visual distinction per subscription
- **Transaction integration**: Auto-create expense saat renewal
- **Toast notification**: User notifikasi perpanjangan

### Key Component
- **SubscriptionManager**: CRUD subscriptions + auto-renewal logic

---

## ⚙️ SETTINGS TAB

**Purpose:** Manajemen wallet/akun & transfer antar akun

### Struktur
```
SETTINGS TAB
├─ 📋 Akun (Account Manager)
│  ├─ [+ Tambah Akun] Button
│  │
│  ├─ Setiap Wallet Card:
│  │  ├─ Header (background color = wallet.color)
│  │  │  ├─ Nama: "Blue (Dana)"
│  │  │  ├─ Saldo: "Rp 1.500.000"
│  │  │  └─ [Edit] [Hapus]
│  │  │
│  │  ├─ Collapsible: Aktivitas Terakhir
│  │  │  └─ List 5 transaksi terbaru:
│  │  │     ├─ Tanggal
│  │  │     ├─ Kategori
│  │  │     └─ Amount (+ income, - expense)
│  │  │
│  │  └─ Edit Mode (klik [Edit]):
│  │     ├─ Nama (text input)
│  │     ├─ Saldo awal (number input)
│  │     ├─ Tipe: Bank / E-wallet / Cash
│  │     ├─ Pilih warna (color picker, show checkmark)
│  │     └─ [Simpan] [Batal]
│  │
│  └─ Repeat untuk setiap wallet
│
├─ 💸 Transfer Antar Akun
│  ├─ [Dari Akun ▼] Select wallet source
│  ├─ [Ke Akun ▼] Select wallet destination
│  ├─ [Nominal] Input amount
│  ├─ Deskripsi (optional)
│  └─ [Transfer] Button
│
└─ Help text: "Transfer tidak mengurangi / menambah total"
```

### Data Flow

#### A. Add Wallet
```
User klik [+ Tambah Akun]
    ↓
Form input tampil:
├─ Nama wallet (input)
├─ Saldo awal (number)
├─ Tipe: "Bank" / "E-wallet" / "Cash"
└─ Warna (color picker)
    ↓
Default color: #3b82f6 (blue)
    ↓
User input semua field
    ↓
User klik [Simpan]
    ↓
Create wallet object:
{
  id: generate unique ID,
  name: "Blue Wallet",
  balance: 1000000,
  color: "#3b82f6",
  type: "E-wallet"
}
    ↓
addWallet(wallet)
    ↓
setWallets([...wallets, newWallet])
    ↓
localStorage.setItem('wallets')
    ↓
setSelectedWalletId(wallet.id)
    ↓
Form clear, card tampil di list
```

#### B. Edit Wallet
```
User klik [Edit] pada wallet card
    ↓
setEditingId(wallet.id)
    ↓
Form tampil dengan current values:
├─ name: "Blue Wallet"
├─ balance: 1000000
├─ type: "E-wallet"
└─ color: "#3b82f6"
    ↓
User ubah field (nama, saldo, warna)
    ↓
Color picker: klik warna
    ├─ Show checkmark pada selected color
    └─ Preview di card header
    ↓
User klik [Simpan]
    ↓
Update wallet di wallets[] array
    ↓
localStorage.setItem('wallets')
    ↓
setEditingId(null) → form close
```

#### C. Delete Wallet
```
User klik [Hapus] pada wallet
    ↓
Confirmation: "Hapus Blue Wallet? (Transaksi tidak terhapus)"
    ↓
If confirm:
  ├─ Remove dari wallets[]
  ├─ If this wallet was selectedWalletId:
  │  └─ setSelectedWalletId(wallets[0].id) → switch ke wallet lain
  ├─ localStorage.setItem('wallets')
  └─ Component re-render
Else: cancel
```

#### D. Transfer Between Accounts
```
User di TransferBetweenAccounts section
    ↓
Form input:
├─ [Dari Akun ▼] = source wallet
├─ [Ke Akun ▼] = destination wallet
├─ Nominal
└─ Deskripsi
    ↓
User klik [Transfer]
    ↓
Validation:
├─ source !== destination
├─ nominal > 0
├─ source.balance >= nominal
└─ If invalid: show error toast
    ↓
Create 2 linked transactions (transfer):
Transaction 1 (source):
{
  id: unique ID,
  type: 'expense',
  walletId: sourceId,
  toWalletId: destinationId,
  amount: nominal,
  category: 'Transfer',
  description: 'Transfer ke [Destination]',
  date: today
}

Transaction 2 (destination):
{
  id: unique ID,
  type: 'income',
  walletId: destinationId,
  fromWalletId: sourceId,
  amount: nominal,
  category: 'Transfer',
  description: 'Transfer dari [Source]',
  date: today
}
    ↓
addTransfer() → add kedua transaksi ke transactions[]
    ↓
Wallet balances auto-update via calculateWalletBalance()
    ↓
Show success toast: "Transfer berhasil"
    ↓
Form clear
```

### Wallet Balance Calculation
```
calculateWalletBalance(walletId, transactions):
    ↓
Let balance = wallet.balance (initial balance)
    ↓
For each transaction:
  ├─ If transaction.walletId === walletId:
  │  ├─ If type === 'income': balance += amount
  │  └─ If type === 'expense': balance -= amount
  │
  ├─ If transaction.toWalletId === walletId:
  │  └─ If type === 'expense' (transfer): balance += amount
  │
  └─ If transaction.fromWalletId === walletId:
     └─ If type === 'income' (transfer): balance -= amount
    ↓
Return final balance
```

### Key Components
- **AccountManager**: Create, edit, delete wallets + show transaction history
- **TransferBetweenAccounts**: Transfer logic dengan validation

---

## ⋯ MORE TAB

**Purpose:** Utility & settings - kategori & backup

### Struktur
```
MORE TAB
├─ [Kelola Kategori →]
│  └─ Navigate ke CategoriesPage (full page)
│
└─ [Backup & Restore →]
   └─ Dialog: Data export/import
```

### Data Flow

#### A. Manage Categories
```
User klik [Kelola Kategori →]
    ↓
setCurrentPage('categories')
    ↓
Render CategoriesPage (full-screen):
├─ Header dengan [← Kembali] button
├─ CategoryManager component
└─ Kategori dibagi: Expense / Income
    ↓
CategoryManager provides:
├─ List existing categories
├─ [+ Tambah Kategori] button
└─ Delete button per kategori
    ↓
Add Category:
  ├─ User input: nama kategori, tipe (expense/income)
  ├─ Optional: emoji/icon
  ├─ Create Category object: { id, name, type, icon }
  ├─ addCategory() → setCategories([...cats, newCat])
  └─ localStorage.setItem('categories')
    ↓
Delete Category:
  ├─ Confirmation dialog
  ├─ deleteCategory(id) → filter out
  ├─ localStorage.setItem('categories')
  └─ Re-render list
    ↓
User klik [← Kembali]
    ↓
setCurrentPage('main')
    ↓
Kembali ke More Tab view
```

#### B. Backup & Restore
```
User klik [Backup & Restore →]
    ↓
setShowBackupRestore(true)
    ↓
Dialog modal tampil dengan 2 sections:

SECTION 1: EXPORT (Backup)
  ├─ [Unduh Backup] button
  ├─ Generate JSON export:
  │  {
  │    wallets: [...],
  │    transactions: [...],
  │    categories: [...]
  │  }
  ├─ Download sebagai file: "backup-YYYYMMDD.json"
  └─ User simpan file aman (cloud, email, etc)

SECTION 2: IMPORT (Restore)
  ├─ [Pilih File Backup] input
  ├─ User select .json file
  ├─ Parse & validate JSON
  ├─ Confirmation: "Restore akan overwrite semua data"
  ├─ If confirm:
  │  ├─ Clear localStorage
  │  ├─ Import wallets, transactions, categories
  │  ├─ setWallets(), setTransactions(), setCategories()
  │  ├─ localStorage.setItem() all data
  │  └─ Show success toast
  └─ Dialog close
```

### Key Components
- **CategoriesPage**: Full-page category management
- **CategoryManager**: CRUD categories
- **BackupRestoreComponent**: Export/Import JSON data

---

## 💾 DATA PERSISTENCE

### Storage Structure (localStorage)
```
localStorage:
├─ appVersion: "2.0.0"
│  └─ Version control, clear old data saat upgrade
│
├─ wallets: JSON stringified Wallet[]
│  └─ Format: [{id, name, balance, color, type}]
│
├─ transactions: JSON stringified Transaction[]
│  └─ Format: [{id, type, amount, category, date, walletId, description, ...}]
│
├─ categories: JSON stringified Category[]
│  └─ Format: [{id, name, type, icon?}]
│
└─ subscriptions: JSON stringified Subscription[]
   └─ Format: [{id, name, amount, startDate, cycleDays, nextPaymentDate, color}]
```

### Data Sync Diagram
```
User Action
    ↓
State Update (React setState)
    ↓
useEffect trigger (dependency: [state])
    ↓
localStorage.setItem(key, JSON.stringify(state))
    ↓
Data persisted in browser

---

Page Refresh / App Restart
    ↓
useEffect on mount
    ↓
localStorage.getItem(key)
    ↓
JSON.parse() → restore state
    ↓
setWallets(), setTransactions(), etc
    ↓
App fully hydrated, data ready
```

### Data Recovery
```
If localStorage corrupted:
    ↓
try-catch block:
├─ If JSON.parse() fails:
│  └─ Use DEFAULT_WALLETS / DEFAULT_CATEGORIES
├─ If missing key:
│  └─ Use default values
└─ localStorage.setItem() dengan default
    ↓
App continues with fresh data
```

---

## 🔄 USER WORKFLOWS

### Workflow 1: Catat Pengeluaran Harian
```
1. User buka app → Home tab
2. Klik [+ Catat Transaksi]
3. Input:
   ├─ Tipe: Expense
   ├─ Kategori: "Makan"
   ├─ Amount: Rp 50.000
   ├─ Wallet: "Blue (Dana)"
   └─ Deskripsi: "Makan siang"
4. Klik [Simpan]
5. Transaction added, Home updated
6. TransactionSummary & Table refresh
7. Wallet balance updated (Blue: -50.000)
```

### Workflow 2: Analisis Pengeluaran Bulan Ini
```
1. User buka app → Stats tab
2. Period selector default: "Analitik untuk: Februari 2026"
3. View:
   ├─ Statistics Chart: Trend pengeluaran per hari
   ├─ Transaction by Category: Breakdown "Makan" 45%, "Transport" 30%, etc
   ├─ Klik kategori "Makan" → Dialog detail transaksi
   └─ Monthly Report: Total income Rp X, expense Rp Y, balance Rp Z
4. Klik [Cetak] → Print laporan PDF
```

### Workflow 3: Setup Langganan Netflix
```
1. User buka app → Subs tab
2. Klik [+ Tambah Langganan]
3. Input:
   ├─ Nama: "Netflix"
   ├─ Nominal: Rp 149.000
   ├─ Tanggal Mulai: 5 Feb 2026
   ├─ Siklus: 30 hari
   └─ ☑️ Buat transaksi sekarang
4. Klik [Simpan]
5. Langganan card tampil dengan status "Akan diperpanjang: 7 Maret"
6. Sistem akan auto-create expense 7 Maret
7. Status auto-update ke "Akan diperpanjang: 7 April"
```

### Workflow 4: Transfer Uang Antar Wallet
```
1. User buka app → Settings tab
2. Scroll ke "Transfer Antar Akun"
3. Input:
   ├─ Dari Akun: "Blue (Dana)" [Saldo: Rp 1.500.000]
   ├─ Ke Akun: "Saving (BCA)" [Saldo: Rp 5.000.000]
   ├─ Nominal: Rp 500.000
   └─ Deskripsi: "Transfer saving"
4. Klik [Transfer]
5. System creates 2 transactions:
   ├─ Blue: -500.000 (expense, category: Transfer)
   └─ Saving: +500.000 (income, category: Transfer)
6. Balances updated:
   ├─ Blue: Rp 1.000.000
   └─ Saving: Rp 5.500.000
7. Success toast: "Transfer berhasil"
```

### Workflow 5: Backup Data
```
1. User buka app → More tab
2. Klik [Backup & Restore →]
3. Dialog: "Unduh Backup"
4. Klik [Unduh Backup]
5. Browser download: "backup-20260205.json"
6. File contains:
   {
     "wallets": [...],
     "transactions": [...],
     "categories": [...]
   }
7. User simpan di cloud (Google Drive, Dropbox, etc)
```

### Workflow 6: Restore Data
```
1. User switch device / clear app data
2. Open app → More tab
3. Klik [Backup & Restore →]
4. Dialog: "Pilih File Backup"
5. Klik [Pilih File], select backup.json
6. Confirmation: "Restore akan overwrite semua data"
7. Klik [Restore]
8. All data restored:
   ├─ Wallets, transactions, categories
   └─ App fully sync dengan backup file
9. Success toast: "Data restored"
```

---

## 🔐 Security & Best Practices

### Data Security
- ✅ All data stored locally (localStorage)
- ✅ No server/cloud transmission
- ✅ User responsible untuk backup
- ✅ No password/authentication (local-only)

### Input Validation
- Amount: must be > 0
- Date: must be valid ISO format
- Transfer: source !== destination, sufficient balance
- Subscription: cycleDays > 0

### Error Handling
- Try-catch untuk JSON parse
- Toast notification untuk user feedback
- Graceful fallback to defaults
- Console logging untuk debugging

### Performance
- useMemo untuk expensive calculations
- Avoid unnecessary re-renders
- Filter at component level (not parent)
- Lazy load heavy components

---

## 📱 Responsive Design

### Breakpoints
- Mobile: < 640px (full width)
- Tablet: 640px - 1024px (adjusted padding)
- Desktop: > 1024px (centered container)

### Navigation
- Bottom tab bar: persistent di semua screen size
- Drawer/Modal: stacked di mobile, side-by-side di desktop
- Form: full-width di mobile, max-width di desktop

---

## 🚀 Future Enhancements

1. **Cloud Sync**: Backup otomatis ke cloud
2. **Multi-user**: Support multiple users
3. **Budgeting**: Set budget per kategori
4. **Forecasting**: Predict expense trend
5. **Receipt Scanner**: OCR untuk upload invoice
6. **Multi-currency**: Support multiple currency
7. **Investment Tracking**: Stock/crypto portfolio
8. **Bill Reminders**: Notifikasi tagihan mendatang
9. **Expense Reports**: Email laporan mingguan
10. **API Integration**: Sync dengan bank/payment provider

---

**End of Documentation**
