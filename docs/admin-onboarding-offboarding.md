# SOP Admin Onboarding/Offboarding

## Onboarding Admin Internal
1. Login sebagai admin internal existing.
2. Buka `User Management`.
3. Buat akun baru via flow internal (email korporat, password awal sementara).
4. Set role sesuai least-privilege (hindari role admin jika tidak wajib).
5. Konfirmasi user bisa login dan hanya melihat menu sesuai role.
6. Catat perubahan di `audit_logs` (otomatis) dan konfirmasi entri tercatat.

## Rotasi / Perubahan Role
1. Verifikasi kebutuhan bisnis perubahan role.
2. Update role dari panel `User Management`.
3. Minta user logout/login ulang untuk sinkronisasi context role.
4. Validasi akses route kritikal (`/users`, `/audit-log`, `/panel/admin`).

## Offboarding User
1. Ubah `ACTIVE` menjadi `false`.
2. Jika perlu, downgrade role ke non-privileged sebelum disable permanen.
3. Arsipkan alasan offboarding di tiket internal.
4. Verifikasi user tidak lagi bisa melakukan operasi operasional.

## Kontrol Wajib
- Dilarang berbagi akun admin.
- Dilarang membuat akun via jalur di luar panel internal.
- Seluruh perubahan role/status harus bisa ditelusuri di audit log.

