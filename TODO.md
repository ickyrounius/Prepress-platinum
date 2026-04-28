# Prepress App Technical TODO

## Status: COMPLETED - Refactored

### ✅ 1. Standarisasi Penamaan Data (Data Schema Consistency) - HIGH PRIORITY
**Status: DONE**

- Di database-schema.json, koleksi `users` telah diubah menjadi `T_USERS` dengan field `NAMA` dan `KATEGORI`
- Di AuthContext.tsx, kode sudah mengakses koleksi `T_USERS` dengan field `KATEGORI` - SUDAH KONSISTEN
- Semua implementasi di codebase sudah menggunakan `T_USERS` dan `KATEGORI`

### ✅ 2. Refactoring Komponen Besar File - MEDIUM PRIORITY
**Status: DONE**

File `page.tsx` di dashboard telah dipecah menjadi sub-komponen:
- `StatsGrid.tsx` - Untuk menampilkan kartu statistik
- `FilterHeader.tsx` - Untuk bagian filter tanggal dan tipe JOS/JOP
- `DashboardCharts.tsx` - Untuk membungkus Recharts (PieChart, BarChart, LineChart, dan KPI card)

### ✅ 3. Optimasi Data Fetching (Scalability) - MEDIUM PRIORITY
**Status: ACKNOWLEDGED**

Hook `useDashboardData.ts` melakukan onSnapshot ke 8 koleksi berbeda. Untuk scalability di masa depan:
- Gunakan Firestore Aggregation Queries
- Pertimbangkan Cloud Functions untuk menghitung statistik harian
- Skip untuk saat ini karena tidak ada akses langsung ke Firebase backend

### ✅ 4. Penguatan Type Safety - MEDIUM PRIORITY
**Status: DONE**

- Buat file `types/index.ts` untuk menyimpan semua interface utama
- Interface yang di-export: `DashboardItem`, `UserData`, `AuditLogEntry`, `NotificationData`, `DailyStats`, `OperatorWorkload`, `WorkflowStatusCounts`, `ProductivityDataPoint`, `TrendDataPoint`, `JosTypeFilter`, `JopTypeFilter`, `DateRange`
- Type exports dari `useDashboardData` menggunakan interface dari `types/index.ts`

### ✅ 5. Error Handling & Loading States - LOW PRIORITY
**Status: DONE**

- Sistem notifikasi sudah ada di `NotificationContext.tsx`
- `AuthContext` sudah menggunakan `useNotification` untuk menampilkan toast saat gagal fetch role
- Urutan provider di `layout.tsx` sudah disesuaikan: `NotificationProvider` → `AuthProvider` → `ThemeProvider`

---

## Action Plan - COMPLETED

- [x] High Priority: Sinkronisasi nama koleksi dan field antara AuthContext dan database asli
- [x] Medium Priority: Pecah file dashboard utama menjadi komponen-komponen kecil
- [x] Medium Priority: Buat file types/index.ts untuk menyimpan semua interface utama secara terpusat
- [x] Low Priority: Implementasikan sistem toast notification untuk feedback error
