# Fitur Baru - Aureus Mobile

## Ringkasan
Aureus v2.0 menambahkan manajemen akun, transfer antar akun, backup/restore JSON, dan kategori custom dalam satu tab Pengaturan yang terpusat.

## Fitur Utama
1. Sistem Multi-Akun dan Dompet Digital
- Kelola beberapa akun/dompet (bank, digital, dan tunai)
- Pilih akun aktif untuk mencatat transaksi
- Saldo akun dihitung otomatis

2. Transfer Antar Akun
- Pindah dana antar akun
- Validasi saldo sebelum transfer
- Transaksi transfer tercatat

3. Backup dan Restore Data
- Ekspor semua data ke JSON
- Impor dari file JSON atau clipboard
- Konfirmasi sebelum overwrite

4. Manajemen Kategori Custom
- Tambah kategori pemasukan/pengeluaran
- Kelola dan hapus kategori custom

5. Pengaturan Tema
- Light/Dark mode untuk seluruh aplikasi

## File Dimodifikasi
- src/pages/Index.tsx
- src/components/BottomNav.tsx
- src/components/TransactionForm.tsx
- src/components/VoiceInput.tsx

## Local Storage Keys
- wallets
- transactions
- categories

## Versi
v2.0.0
