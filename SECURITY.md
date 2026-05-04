# Security Guide

## Scope
Dokumen ini menjelaskan baseline keamanan untuk deployment Firebase Spark pada proyek Prepress Platinum.

## Security Baseline (Wajib)
- Registrasi publik tidak digunakan untuk provisioning normal; pembuatan akun dilakukan oleh admin internal.
- Semua akses data sensitif mengandalkan kombinasi auth + role di `firestore.rules` dan `database.rules.json`.
- Operasi privileged di sisi client wajib punya guard UI dan guard service.
- Hanya role internal admin (`ADMIN`, `DEVELOPER`, `MANAGER`) yang boleh melakukan provisioning akun dan perubahan role.

## User Provisioning (Spark-Compatible)
- Provisioning akun dilakukan dari halaman internal admin.
- Service membuat akun Auth melalui secondary Firebase app agar sesi admin utama tidak terganti.
- Setelah Auth user dibuat, dokumen `T_USERS/{uid}` ditulis dengan metadata role/status.
- Jika tulis profile gagal, service melakukan best-effort rollback untuk menghapus user Auth yang baru dibuat.

## Role & Access Control
- Sumber role operasional adalah field `KATEGORI` pada `T_USERS`.
- Client tidak boleh dipercaya untuk role assignment; validasi akhir tetap di rules.
- User biasa tidak boleh mengubah field keamanan profile (`KATEGORI`, `ACTIVE`, `EMAIL`, `UID`).

## Locking Integrity (RTDB)
- Lock job menggunakan pola transaksi atomik untuk mencegah takeover.
- Rules RTDB mengizinkan write lock hanya saat create/unlock oleh owner lock.

## Incident Response (Minimum)
- Jika terdeteksi role escalation/akses anomali:
  1. nonaktifkan user (`ACTIVE: false`) dari panel admin,
  2. cek `audit_logs`,
  3. rotate kredensial akun admin terkait,
  4. review rules sebelum re-enable akses.

## Deployment Safety
- Jalankan `npm run lint` dan `npm run build` sebelum deploy.
- Deploy Spark:
  - `firebase deploy --project prepress-platinum --only hosting,firestore:rules,database`

