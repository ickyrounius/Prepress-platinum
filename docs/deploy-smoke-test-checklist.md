# Deploy Smoke Test Checklist

## Pre-Deploy
- `npm run lint`
- `npm run build`
- Pastikan `git status` bersih.

## Deploy (Spark)
- `firebase deploy --project prepress-platinum --only hosting,firestore:rules,database`

## Post-Deploy Functional Checks
- Login sebagai admin internal berhasil.
- Buka `/register`:
  - dari akun non-admin harus ditolak,
  - dari admin internal harus bisa create akun baru.
- Dari `User Management`:
  - ubah role user target berhasil,
  - toggle ACTIVE berhasil.
- Route otorisasi:
  - non-admin tidak bisa akses `/users` dan `/audit-log`,
  - admin bisa akses keduanya.
- Locking:
  - buka item job dari dua akun berbeda,
  - akun kedua tidak bisa takeover lock aktif.

## Performance Checks (Dataset Besar)
- Halaman `/users/performance` termuat tanpa freeze berat.
- Waktu load awal tetap stabil pada user aktif dengan ribuan item.
- Tidak ada error query di browser console.

## Rollback Minimum
- Jika regresi UI: redeploy commit terakhir yang stabil.
- Jika regresi akses: redeploy rules terakhir yang stabil.

