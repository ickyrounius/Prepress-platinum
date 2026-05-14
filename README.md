# 🖨️ Prepress-Platinum

> Sistem kontrol operasional ringan untuk departemen **Design & Prepress** — berbasis SOP aktual, dioptimalkan untuk Firebase Spark Plan.

---

## 📋 Deskripsi

**Prepress-Platinum** adalah sistem MIS/MES internal khusus untuk departemen Design Graphic, Design Technical, Support Design, dan Prepress pada lingkungan produksi percetakan.

Sistem ini **bukan ERP**. Sistem ini dirancang untuk:

- Mengikuti alur SOP yang sudah berjalan di lapangan secara tepat
- Mempercepat visibilitas produksi lintas departemen dan shift
- Meminimalkan human error dalam proses approval dan revisi
- Menjaga keterlacakan dokumen produksi (JOS-D, JOD, JOP, LOG)
- Berjalan ringan dan hemat biaya di atas **Firebase Spark Plan**

---

## 🏢 Struktur Organisasi (R4 2025)

### Design Group — 43 Orang

```
Manager: Yohanes Agung J P (22065193)
│
├── SPV DG EXPORT — Ary Kurniawan (13013745)
│   ├── DG Export: Anastasia, Herlina, Inez, Maharani, Shantu, Arfiansyah
│   └── Admin Export: Dewi Ayu Anggita
│
├── SPV DG JASA — Sriyanti (92070430)
│   ├── DG Jasa: Arief, Chris, Indriawan, Henti, Setyo
│   ├── DS Jasa: Alfin, Ari Wibisono
│   ├── DT Jasa: Subari, Wahyudi
│   └── Admin Jasa: Marsya Jahwa S
│
├── SPV DG LOKAL — Tri Suwarni (HS005978)
│   ├── DG Lokal: Surawan Bayu B, Yonathan, Hartoto, Agnes, Alfaro, Inneke, Michaelia, Nathania
│   ├── DS Lokal/Export: Pinta, Sri Sumarni
│   ├── Checker DG: Muhammad Khumaeri, Dian Woro Yuliana
│   └── Admin Lokal: Firda Arrahmawati
│
└── SPV DT — Sri Rejeki (HS005539)
    ├── D. Specialist: Priyanto RS
    ├── DT Lokal/Export: Aris, Ricky, Arkhanudin
    ├── Checker DT: Galuh Bella, Awi Mulyaning Putri
    ├── OP MS CNC: Galang Rambu Pijar
    ├── OP MS GMG: Laurensius Lenka
    ├── OP MS Blueprint: Toni Zulhendra
    └── Admin Prepress: Tri Soegijarti
```

### Prepress Group — 23 Orang

```
Manager: Yohanes Agung J P
│
└── Supervisor: Dwi Iswahyudi (20014927)
    └── Koordinator: Agus Wibowo (14013894)
        ├── Produksi: Wiwik Sri W
        ├── WIP Plate: Yudhi Yan P
        ├── Koordinator Shift: Uung Dwi Pradipta, Khoirul Umam, Galih Cahyo W.S
        └── Operator Shift A / B / C (5 line mesin)
```

**Mesin Prepress:** CTCP · CTP · Flexo · Etching · Screen

---

## 🔄 Alur SOP yang Diimplementasikan

### SOP 1 — DG Lokal

```
START DG
  └─ Admin DG catat JOS-D → buat JOD
  └─ SPV DG beri rating kesulitan → assign ke DG
        ↓
  Konsep Design / Preview Artwork
  [Opsional: Review Owner/BM → SPV kumpulkan konsep]
        ↓
  Marketing review preview
        ↓
  SELF QC DG/DS → Final Artwork + Checklist Pre-Flight + Approval Form
        ↓
  CHECKER DG — TAHAP 1 (kesesuaian JOD)
  [Tidak sesuai → REVISI → kembali ke DG]
        ↓
  CHECKER DG — FINAL (semua spesifikasi terpenuhi)
  [Tidak sesuai → REVISI → kembali ke DG]
        ↓
  Upload ke SERVER_DESIGN
  Admin DG tutup JOD → kirim ke PPIC
        ↓
  END → PPIC
```

### SOP 2 — DG Jasa / Export

```
START MARKETING → serahkan JOS-D + file/spek/sample buyer
  └─ Admin DG catat JOS-D → buat JOD
  └─ SPV DG beri rating → assign ke DG/DS
        ↓
  Preview Artwork → Marketing review
        ↓
  BUYER APPROVE?
  [NO → Revisi preview → kembali review]
        ↓ YES
  Admin DG catat ACC Artworks
        ↓
  SELF QC DG/DS → Final Artwork + Pre-Flight + Approval Form
        ↓
  CHECKER DG — TAHAP 1 → CHECKER DG — FINAL
  [Tidak sesuai → REVISI]
        ↓
  Upload ke SERVER_DESIGN → Admin DG tutup JOD
        ↓
  END → PPIC
```

> Export: reject konsep wajib diupload ke `SERVER_ARCHIVE` oleh SPV DG.

### SOP 3 — Design Teknik (DT)

```
START PPIC → serahkan JOP + Lampiran ke Admin DT
  └─ Admin DT catat LOG JOP Datang
  └─ SPV DT beri rating + prioritas → assign ke DT
        ↓
  OP Mesin Blueprint → Blueprint 1:1 + Log Blueprint
  Admin DG catat → serahkan ke DG
        ↓
  DG Review (konten, visual, final file artworks)
  Marketing pastikan layout sesuai klien
        ↓
  DT Layout (tata letak cetak sesuai JOP)
  Dokumentasi harian + Update Progress JOP
        ↓
  SELF QC DT → Validasi Preflight + Checklist Preflight
  Finalisasi File-B + File-CAD (jika die-cut)
        ↓
  CHECKER DT (kesesuaian dengan JOP)
  [Tidak sesuai → REVISI]
        ↓
  SPV DT review → Upload File-B + CAD ke SERVER_LAYOUT
        ↓
  Admin DT: Log JOP Keluar → Update Master JOP
  Dokumen fisik ke Produksi
        ↓
  END → SERVER_LAYOUT → Produksi
```

### SOP 4 — CTCP Plate Making

```
START CETAK → Tim Cetak buat permintaan plate (No. JOP, No. Plate, Mesin, Bahan)
        ↓
  OP Plate cari file di Lokal Drive + Server
        ↓
  Cek File? → Cek JOP? (No. File, Konten, Jumlah Warna, Color Bar, Revisi Terakhir)
  [Tidak sesuai → PLATE GANTIAN]
        ↓
  Proses RIP → Pecah Warna → .TIFF → Gripper sesuai mesin
        ↓
  Expose CTCP → Transfer Image File to Plate
        ↓
  Developing / Processor (cek chemical)
        ↓
  QC Plate (densiti raster, Checklist Quality)
  [Tidak pass → PLATE GANTIAN → kembali ke RIP]
        ↓
  Labeling Plate (No. Plate, No. JOP, dll.)
  Tim Cetak ambil plate
        ↓
  END
```

---

## 📊 Status Workflow

| Status | Deskripsi |
|---|---|
| `WAITING` | Job terdaftar, belum diambil operator |
| `IN_PROGRESS` | Operator sedang mengerjakan |
| `SELF_QC` | Operator melakukan self-check sebelum submit |
| `CHECKING_1` | Di Checker DG/DT — Tahap 1 |
| `CHECKING_FINAL` | Di Checker DG/DT — Tahap Final |
| `REVISION` | Dikembalikan ke operator untuk perbaikan |
| `BUYER_REVIEW` | Menunggu approve buyer/marketing (Jasa/Export) |
| `SPV_REVIEW` | Menunggu review/approval SPV |
| `APPROVED` | Disetujui, siap ke tahap berikutnya |
| `OUTPUT` | File dikirim ke server / produksi |
| `RIP` | Proses RIP di Prepress |
| `EXPOSE` | Proses expose CTCP/CTP |
| `DEVELOP` | Proses developing plate |
| `QC_PLATE` | QC plate setelah expose |
| `DONE` | Selesai |
| `HOLD` | Ditunda — semua timer berhenti |
| `ARCHIVE` | Konsep reject — disimpan di SERVER_ARCHIVE |

---

## 📄 Dokumen Produksi yang Didigitalisasi

| Kode | Nama Dokumen | Owner |
|---|---|---|
| JOS-D | Job Order Setter Design | Marketing |
| JOD | Job Order Design | Admin DG |
| JOP | Job Order Produksi | PPIC |
| LOG-DG | Log Harian DG | DG/DS |
| LOG-QC-DG | Log QC Checker DG | Checker DG |
| LOG-ACC | Log ACC Artworks | Admin DG |
| LOG-APV-SPV | Log Approval SPV | SPV DG |
| LOG-BP | Log Blueprint | OP-BP |
| LOG-DT | Log Harian DT | DT |
| LOG-REV | Log Revisi | DG/DT |
| LOG-QC-DT | Log QC Checker DT | Checker DT |
| LOG-JOP-IN | Log JOP Datang | Admin DT |
| LOG-JOP-OUT | Log JOP Keluar | Admin DT |
| MASTER-JOP | Master Tracking JOP | Admin DT / SPV DT |
| CPF-DG | Checklist Pre-Flight DG | DG / Checker DG |
| CPF-DT | Checklist Preflight DT | DT / Checker DT |
| APV-FORM | Approval Form | DG/DS |
| REQ-PLATE | Permintaan Plate | Tim Cetak |
| CQ-CTCP | Checklist Quality CTCP | OP Plate |

---

## 🗄️ Arsitektur Sistem

### Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| Styling | TailwindCSS |
| State | Zustand |
| Auth | Firebase Auth |
| Database | Firestore (data transaksi/bisnis) |
| Realtime | Firebase RTDB (presence + counter ringan saja) |
| Storage | Firebase Storage |

### Firestore Collections

```
users/              ← data user + role + stream + shift
jobs/               ← semua job dengan field jobType + stream
job_logs/           ← audit log setiap perubahan penting
revisions/          ← riwayat revisi (tidak pernah ditimpa)
approvals/          ← riwayat approval per level
reports/            ← laporan yang digenerate
daily_kpi/          ← KPI harian per user (pre-calculated)
customers/          ← data customer
departments/        ← konfigurasi departemen
templates/          ← template job
profiles/           ← profil warna, spesifikasi teknis
```

### RTDB Structure (ringan, non-historis)

```
presence/{userId}           ← status online + job aktif
queue/{stream}/counter      ← hitungan antrian per stream
checkerQueue/DG|DT          ← antrian checker
prepress/shifts/{A|B|C}     ← operator shift aktif
prepress/machines/{type}    ← job aktif per mesin
dashboardCounters/          ← counter global dashboard
```

### Firebase Storage Structure

```
/jobs/{jobId}/
  design/preview/           ← preview artwork
  design/artworks/          ← file AI/CDR/PDF (versioned: _R0, _R1, _FINAL)
  design/preflight/         ← checklist preflight
  design/approved/          ← final approved artwork
  technical/file-b/         ← File-B DT
  technical/cad/            ← File-CAD (die-cut)
  technical/blueprint/      ← Blueprint 1:1
  prepress/rip/             ← file .TIFF hasil RIP
  prepress/plate/           ← label plate
  revisions/{revisionId}/   ← file per revisi
```

---

## 🔐 Role & Permission

| Role | Deskripsi |
|---|---|
| `admin` | Full access |
| `manager` | Read all, approve all, override |
| `spv-dg-exp` | Manage stream Export |
| `spv-dg-jas` | Manage stream Jasa |
| `spv-dg-lok` | Manage stream Lokal |
| `spv-dt` | Manage semua job DT |
| `spv-pp` | Manage Prepress |
| `checker-dg` | Approve/reject di Checker DG |
| `checker-dt` | Approve/reject di Checker DT |
| `designer` | Operator DG/DS |
| `dt-operator` | Operator DT |
| `prepress-operator` | Operator Prepress (shift-based) |
| `op-mesin` | OP GMG, CNC, Blueprint |
| `admin-staff` | Admin DG/DT/Prepress (buat job, log) |
| `marketing` | Read + buyer approve |

---

## 📈 KPI System

KPI dihitung **pre-calculated on write** — tidak ada query agregasi besar.

### Metrik per user:

| Metrik | Formula |
|---|---|
| On-time rate | `(completedJobs - overdueJobs) / completedJobs × 100` |
| Revision rate | `revisionJobs / completedJobs × 100` |
| Avg completion time | `totalActiveSeconds / completedJobs` |
| Checker efficiency | `checkerPassCount / (passCount + revisionCount) × 100` |
| Self QC quality | Jobs yang revisi setelah Self QC / total jobs |

### Dimensi KPI:
- Per **user**
- Per **stream** (Lokal / Jasa / Export)
- Per **shift** (A / B / C — khusus Prepress)
- Periode: **harian / mingguan / bulanan**

> ⚠️ Durasi **HOLD tidak dihitung** dalam KPI maupun deadline tracking.

---

## ⏱️ HOLD Timer Logic

```
ON HOLD:
  job.holdStartedAt = now()
  job.status = "HOLD"
  job.previousStatus = currentStatus

OFF HOLD:
  elapsed = now() - holdStartedAt
  job.holdDuration += elapsed
  job.holdStartedAt = null
  job.status = previousStatus

Deadline efektif:
  effectiveDeadline = createdAt + originalDeadline + holdDuration
  isOverdue = now() > effectiveDeadline
```

---

## 🔍 Search System

- Prefix search berbasis array `searchable[]` di setiap job document
- Filter: customer · operator · status · priority · deadline · stream · shift · jenis revisi
- Tidak ada full collection scan
- Tidak ada external search engine
- Debounced 300ms di UI

---

## 📁 Struktur Folder Next.js

```
src/
  app/
    (auth)/login/
    (dashboard)/
      page.tsx                    ← Manager overview
      design/                     ← Design dashboard (tab stream)
        jobs/[jobId]/
          revisions/
          approvals/
          checklist/
      technical/                  ← DT dashboard
      prepress/                   ← Prepress shift board
        plate-request/
        shifts/
      kpi/
      admin/
        users/
        departments/
  components/
    jobs/                         ← JobCard, JobTable, badge-badge
    workflow/                     ← Form Self QC, Checker QC, Approval, Plate QC
    dashboard/                    ← Widget stream, checker queue, shift, counter
    prepress/                     ← Checklist, ShiftHandover, MachineBoard
    documents/                    ← JosdCard, JopCard, LogViewer
  lib/
    firebase/                     ← firestore, rtdb, storage, auth
    hooks/                        ← useJobs, useKpi, useShift, useCheckerQueue
    utils/
      holdTimer.ts
      kpiCalc.ts
      searchTokenizer.ts
      streamRouter.ts             ← auto-resolve supervisorId + checkerId
      workflowStateMachine.ts     ← allowed transitions per jobType
      documentLog.ts              ← helper LOG-DG, LOG-DT, LOG-QC
  stores/
    jobStore.ts
    userStore.ts
    dashboardStore.ts
    shiftStore.ts
    checkerStore.ts
  types/
    job.types.ts
    user.types.ts
    kpi.types.ts
    prepress.types.ts
    documents.types.ts
```

---

## 🎨 Color System

### Stream
| Stream | Warna |
|---|---|
| LOKAL | `blue-600` |
| JASA | `green-600` |
| EXPORT | `orange-600` |

### Shift
| Shift | Warna |
|---|---|
| Shift A | `yellow-500` |
| Shift B | `purple-500` |
| Shift C | `teal-500` |

### Status
| Status | Warna |
|---|---|
| WAITING | `gray-400` |
| IN_PROGRESS | `blue-500` |
| SELF_QC | `cyan-500` |
| CHECKING_1 | `yellow-400` |
| CHECKING_FINAL | `yellow-600` |
| BUYER_REVIEW | `purple-400` |
| REVISION | `red-400` |
| SPV_REVIEW | `indigo-500` |
| APPROVED | `green-500` |
| OUTPUT | `teal-500` |
| RIP / EXPOSE / DEVELOP | `violet-500` |
| QC_PLATE | `yellow-500` |
| DONE | `gray-700` |
| HOLD | `red-600` |

### Difficulty Rating (SPV)
| Rating | Warna |
|---|---|
| LOW | `green-400` |
| MEDIUM | `yellow-400` |
| HIGH | `red-400` |

---

## ⌨️ Keyboard Shortcuts

| Key | Aksi |
|---|---|
| `J` | Job berikutnya |
| `K` | Job sebelumnya |
| `S` | Ubah status |
| `H` | Toggle HOLD |
| `A` | Approve (jika role mengizinkan) |
| `R` | Tandai revisi |
| `Q` | Buka form Self QC |
| `/` | Fokus ke search |

---

## ✅ Spark Plan Optimization Checklist

- [x] Semua query menggunakan composite index
- [x] Semua list dipaginasi (limit 20–50)
- [x] Tidak ada full collection scan
- [x] RTDB hanya untuk presence + counter ringan per stream/shift
- [x] `daily_kpi` di-update on write, tidak di-query on read
- [x] Array tidak tumbuh tanpa batas (gunakan subcollection untuk revisi & log)
- [x] Batched writes untuk update multi-dokumen
- [x] Zustand cache mencegah re-fetch data yang tidak berubah
- [x] Storage: hanya metadata di Firestore (path, size, uploadedBy, uploadedAt)
- [x] Debounced search input 300ms
- [x] Memoized dashboard widgets
- [x] Selective RTDB listener per stream dan per shift
- [x] Checker queue hanya dimuat untuk role `checker-dg` / `checker-dt`
- [x] Prepress board hanya dimuat saat shift aktif
- [x] Job detail: single document read, bukan query
- [x] Nama user di-resolve dari Zustand cache, bukan N+1 read

---

## 🗺️ Roadmap

- [ ] Auth & RBAC setup (Firebase Auth + Firestore rules)
- [ ] Job management — CRUD + stream routing
- [ ] Workflow state machine per jobType
- [ ] Self QC & Checker form (Tahap 1 + Final)
- [ ] Buyer/Marketing approval flow (Jasa/Export)
- [ ] DT workflow — Blueprint + DG review + DT layout
- [ ] CTCP plate request & plate QC flow
- [ ] HOLD timer implementation
- [ ] KPI dashboard (per user, per stream, per shift)
- [ ] Prepress shift board + handover view
- [ ] Document log viewer (LOG-DG, LOG-QC, LOG-JOP)
- [ ] Search & filter system
- [ ] Admin panel (user management, departments)
- [ ] Notification system (RTDB-based, ringan)

---

## 📌 Referensi Internal

| Dokumen | Keterangan |
|---|---|
| `STRUKTUR_DESIGN_PREPRESS_2025_R4.pdf` | Struktur organisasi resmi |
| `SOP_Prepress_Flowchart.pdf` | Flowchart SOP DG Lokal, DG Jasa/Export, DT, CTCP |
| `prepress-platinum-prompt-v3.md` | System architect prompt lengkap untuk AI-assisted development |

---

> **Versi:** 3.0.0 · **Tanggal:** 2025 · **Lingkungan:** Internal perusahaan percetakan · **Platform:** Firebase Spark Plan
