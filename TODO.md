# Prepress App Technical TODO

1. Standarisasi Penamaan Data (Data Schema Consistency) Ditemukan inkonsistensi penamaan antara dokumentasi schema, database, dan implementasi di kode:

- Di database-schema.json , field disebut role dalam koleksi users .
- Di AuthContext.tsx , kode mengakses koleksi T_USERS dengan field KATEGORI .
- Saran : Lakukan sinkronisasi total pada penamaan field. Gunakan satu standar (disarankan camelCase untuk JavaScript/TypeScript dan snake_case atau UPPER_CASE untuk database legacy) agar tidak membingungkan saat pengembangan fitur baru.
2. Refactoring Komponen Besar File seperti page.tsx di dashboard memiliki logika UI yang sangat panjang (lebih dari 250 baris).

- Saran : Pecah komponen tersebut menjadi sub-komponen yang lebih kecil di folder components/dashboard/ , misalnya:
  - StatsGrid.tsx : Untuk menampilkan kartu statistik.
  - FilterHeader.tsx : Untuk bagian filter tanggal dan tipe JOS/JOP.
  - DashboardCharts.tsx : Untuk membungkus Recharts.
    Ini akan mempermudah maintenance dan unit testing di masa depan.
3. Optimasi Data Fetching (Scalability) Hook useDashboardData.ts saat ini melakukan onSnapshot ke 8 koleksi berbeda dan menggabungkannya di sisi client.

- Masalah : Jika data di tiap koleksi mencapai ribuan, browser akan menjadi lambat karena harus memproses filter dan kalkulasi statistik setiap kali ada perubahan data kecil.
- Saran :
  - Gunakan Firestore Aggregation Queries (count, sum) jika hanya butuh angka statistik.
  - Pertimbangkan Cloud Functions untuk menghitung statistik harian secara otomatis dan menyimpannya di koleksi reporting_indexes (seperti yang sudah direncanakan di database-schema.json ).
4. Penguatan Type Safety Banyak interface yang masih menggunakan any atau Record<string, any> , seperti pada DashboardItem .

- Saran : Definisikan tipe data yang ketat untuk setiap entitas (JOS, JOP, User, Log). Ini akan mencegah error runtime yang sulit dilacak dan memberikan pengalaman IntelliSense yang lebih baik di IDE.
5. Error Handling & Loading States Meskipun sudah ada loading spinner, penanganan error pada operasi Firebase (seperti saat gagal fetch role) hanya menggunakan console.error .

- Saran : Implementasikan sistem notifikasi (seperti sonner atau react-hot-toast ) untuk memberikan feedback visual kepada pengguna jika terjadi kegagalan jaringan atau otorisasi.
Rangkuman Rekomendasi (Action Plan)

- High Priority : Sinkronisasi nama koleksi dan field antara AuthContext dan database asli.
- Medium Priority : Pecah file dashboard utama menjadi komponen-komponen kecil.
- Medium Priority : Buat file types/index.ts untuk menyimpan semua interface utama secara terpusat.
- Low Priority : Implementasikan sistem toast notification untuk feedback error.