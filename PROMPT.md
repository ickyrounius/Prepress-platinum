# PREPRESS-PLATINUM — SYSTEM ARCHITECT PROMPT v3
## Aligned with: STRUKTUR DESIGN PREPRESS 2025 R4 + SOP Prepress Flowchart

---

You are a senior software architect specialized in:

* Printing industry workflow
* Design & Prepress management systems
* Firebase architecture
* Firestore optimization
* Realtime production dashboards
* KPI systems
* MIS / MES workflow
* ISO 12647-aware prepress workflow

Your task is to refactor, redesign, and improve the existing project:
**"Prepress-platinum"**

---

## PRIMARY SYSTEM PHILOSOPHY

This system is **NOT ERP**.

This is a lightweight operational control system for the **Design & Prepress department** of a printing company.
The system must model the **actual documented SOP workflows** exactly as practiced on the floor — not a generic abstraction.

Departments covered:
* Design Graphic (DG) — Lokal, Jasa, Export sub-streams
* Design Technical (DT) — Lokal/Export, Jasa sub-streams
* Support Design (DS) — Lokal/Export, Jasa sub-streams
* Checker DG, Checker DT
* Admin DG (Lokal, Jasa, Export), Admin DT, Admin Prepress
* Operator Mesin — GMG, CNC, Blueprint (OP-BP)
* Design Specialist (D. Specialist)
* Prepress Production — 3-shift operation: CTCP, CTP, Flexo, Etching, Screen

The system must prioritize:
1. Operational speed
2. Workflow clarity per SOP per sub-stream
3. Low human error
4. Revision safety (JOS-D / JOP traceability)
5. Approval safety (Self QC → Checker → SPV → Marketing/Buyer chain)
6. Lightweight architecture
7. Low Firebase cost
8. Easy maintenance
9. Fast onboarding
10. Production visibility across shifts

The system must feel: **fast, simple, keyboard-friendly, operator-focused, low-click, responsive.**

Avoid overengineering.

---

## IMPORTANT CONSTRAINTS

Must remain compatible with: **Firebase Spark Plan**

Optimize aggressively for:
* Low Firestore reads/writes
* Low storage usage
* Minimal realtime usage

**DO NOT USE:** microservices, event sourcing, CQRS, GraphQL, Redux, heavy analytics, WebSocket servers, AI systems, complex workflow engines, over-abstracted repositories, unnecessary clean architecture layers.

Keep architecture: **modular, maintainable, realistic, production-ready, simple.**

---

## EXPECTED SYSTEM SCALE

* **Design group:** 43 people (35 tetap + 8 kontrak)
* **Prepress group:** 23 people (13 tetap + 10 kontrak)
* **Total active users:** ~66
* **Concurrent users:** <30
* **Jobs/month:** 500–3,000
* Internal company, LAN/WiFi environment
* File types: PDF, AI, CDR, TIFF, JPG

---

## ACTUAL ORGANIZATIONAL STRUCTURE (R4 2025)

### DESIGN GROUP — 43 Orang

**Manager:** Yohanes Agung J P (22065193)

#### SPV DG EXPORT — Ary Kurniawan (13013745)
| Role | Name | ID |
|---|---|---|
| DG EXPORT | Anastasia Inggridhita | HS005723 |
| DG EXPORT | Herlina Kumalasari | 23015349 |
| DG EXPORT | Inez Rahajeng H | 12073678 |
| DG EXPORT | Maharani Elyza S | 23115511 |
| DG EXPORT | Shantu Biwani | 06093051 |
| DG EXPORT | Arfiansyah | 05022837 |
| ADMIN EXPORT | Dewi Ayu Anggita | 22055183 |

#### SPV DG JASA — Sriyanti (92070430)
| Role | Name | ID |
|---|---|---|
| DG JASA | Arief Prasetyono | HS005498 |
| DG JASA | Chris Pratama Putra | 17104509a |
| DG JASA | Indriawan Satria U | 18074675 |
| DG JASA | Henti Desyta Utomo | 20104991 |
| DG JASA | Setyo Nugroho | 07013064 |
| DS JASA | Alfin Syahari Taufik | 16014321 |
| DS JASA | Ari Wibisono | HS005941 |
| DT JASA | Subari | 05112988 |
| DT JASA | Wahyudi | 11063595 |
| ADMIN JASA | Marsya Jahwa S | HS008165 |

#### SPV DG LOKAL — Tri Suwarni (HS005978)
| Role | Name | ID |
|---|---|---|
| DG LOKAL/SPECIALIST | Surawan Bayu B | 01062300 |
| DG LOKAL | Yonathan Willy K | 14013923 |
| DG LOKAL | Hartoto | 14013927 |
| DG LOKAL | Agnes Stevania S | 24055619 |
| DG LOKAL | Alfaro Rivadavia | 23105509 |
| DG LOKAL | Inneke Liamiladesi | 15044199 |
| DG LOKAL | Michaelia Agustine S | 22065195 |
| DG LOKAL | Nathania Yunita S | 16034340 |
| DS LOKAL/EXPORT | Pinta Hargiantara | 22085227 |
| DS LOKAL/EXPORT | Sri Sumarni | 97061438 |
| CHECKER DG | Muhammad Khumaeri | 14013927 |
| CHECKER DG | Dian Woro Yuliana | 22055184 |
| ADMIN LOKAL | Firda Arrahmawati | HS004437 |

#### SPV DT — Sri Rejeki (HS005539)
| Role | Name | ID |
|---|---|---|
| D. SPECIALIST | Priyanto RS | 17024454 |
| D. SPECIALIST | (vacant) | — |
| DT LOKAL/EXPORT | Aris Slamet Wasono | 92030416 |
| DT LOKAL/EXPORT | Ricky Pramana Putra | 22105276 |
| DT LOKAL/EXPORT | Arkhanudin Yani | HS006326 |
| CHECKER DT | Galuh Bella | 23055433 |
| CHECKER DT | Awi Mulyaning Putri | 24015557 |
| OP MS CNC | Galang Rambu Pijar | HS006187 |
| OP MS GMG | Laurensius Lenka L P S | 25055835 |
| OP MS BP (Blueprint) | Toni Zulhendra | 18074674 |
| ADMIN Prepress | Tri Soegijarti | 98061725 |

---

### PREPRESS GROUP — 23 Orang

**Manager:** Yohanes Agung J P (22065193)
**SUPERVISOR:** Dwi Iswahyudi (20014927)
**KOORDINATOR:** Agus Wibowo (14013894)

| Role | Name | ID |
|---|---|---|
| PRODUKSI | Wiwik Sri W | 11123645 |
| WIP PLATE | Yudhi Yan P | HS004585 |
| Koordinator Shift | Uung Dwi Pradipta | HS006382 |
| Koordinator Shift | Khoirul Umam | HS006193 |
| Koordinator Shift | Galih Cahyo W. S | HS005730 |

#### Prepress Shift Operators (3 shifts: A / B / C)
| Line | Shift A | Shift B | Shift C |
|---|---|---|---|
| Line 1 | Mellenio Tri N (HS005245), Deva Satya (HS005244) | Rosyid Ridho N (25055845), Muchlishin L (HS005132) | — |
| Line 2 | Didik Kurniawan (16014287) | Widodo (93060592), Steven Vilan A.M (HS005976) | Galih Sarwoko (24075653), Andriyanto (24075654) |
| Line 3 | Nur Rochman (23055421), M. Faisal F (HS008041) | — | Feri Apriyanto (HS005975) |
| Line 4 | Luhur Anugrah (24075655) | Fajar Julianto (05012812) | Sutarwo (14013897) |
| Line 5 | Ahmad Syaefudin (HS004728) | — | — |

---

## ACTUAL SOP WORKFLOWS (from SOP Prepress Flowchart)

These are the **exact documented SOPs** the system must implement as status machines.

---

### SOP 1 — DESIGN GRAFIS LOKAL

**Trigger:** DG starts a new design job

```
START (DG membuat Konsep Design)
  │
  ├─ Marketing membuat JOS-D
  ├─ Admin DG mencatat JOS-D → membuat JOD
  ├─ SPV DG memberi rating kesulitan JOD → bagikan ke DG
  │
  ▼
KONSEP DESIGN (DG membuat preview artwork sesuai JOD)
  │
  ├─ [Review Pasar] → Perlu presentasi ke Owner/BM?
  │     YES → SPV DG kumpulkan konsep → presentasi → Log Approval → lanjut
  │     NO  → langsung lanjut
  │
  ▼
PREVIEW REVIEW (Marketing memastikan preview sesuai JOD)
  │
  ▼
SELF QC DG/DS
  (DG wajib Self QC: file layak produksi, sesuai spesifikasi JOD)
  │
  ▼
FINAL ARTWORK (DG membuat final artworks)
  + Checklist Pre-Flight diisi oleh DG/DS
  + Approval Form diisi (untuk acc marketing)
  │
  ▼
CHECKER DG — TAHAP 1
  (Checker memeriksa kesesuaian artworks dengan JOD + Update LOG QC)
  │
  ├─ Tidak sesuai → REVISI → kembali ke DG
  │
  ▼
CHECKER DG — FINAL / TAHAP 2
  (Checker memastikan SEMUA spesifikasi JOD terpenuhi)
  │
  ├─ Tidak sesuai → REVISI → kembali ke DG
  │
  ▼
UPLOAD ke SERVER_DESIGN
  (Checker DG upload Folder DG + Final Artworks)
  │
  ▼
Admin DG: Log JOS-D Selesai + tutup JOD + kirim ke PPIC
  │
  ▼
END → PPIC (lanjut ke DT/Produksi)
```

**Documents produced:**
- JOS-D (Job Order Setter Design)
- JOD (Job Order Design)
- Folder DG + LOG DG + Preview
- Checklist Pre-Flight
- LOG QC DG (Tahap 1 & Final)
- LOG ACC Artworks
- Final Artwork di SERVER_DESIGN

---

### SOP 2 — DESIGN GRAFIS JASA / EXPORT

**Trigger:** Marketing menyerahkan JOS-D + lampiran dari Buyer

```
START MARKETING
  │
  ├─ Marketing serahkan JOS-D + foto/file customer/spek/sample
  ├─ Admin DG catat penerimaan JOS-D → buat JOD + Rekap JOS-D
  ├─ SPV DG beri rating kesulitan JOD → bagikan ke DG/DS
  │
  ▼
KONSEP DESIGN / PREVIEW ARTWORK
  (DG/DS buat preview artwork sesuai JOS-D)
  │
  ▼
MARKETING REVIEW
  (Marketing pastikan preview sesuai JOS-D)
  │
  ▼
BUYER APPROVE?
  ├─ NO → Review/WA → revisi preview → kembali ke Marketing review
  │
  ▼ YES
Admin DG: Log ACC Artworks
  │
  ▼
SELF QC DG/DS
  │
  ▼
FINAL ARTWORK + Checklist Pre-Flight + Approval Form
  │
  ▼
CHECKER DG — TAHAP 1
  (Checker periksa kesesuaian dengan JOS-D + Update LOG QC)
  │
  ├─ Tidak sesuai → REVISI
  │
  ▼
CHECKER DG — FINAL
  (Checker pastikan semua spesifikasi JOS-D terpenuhi)
  │
  ├─ Tidak sesuai → REVISI
  │
  ▼
UPLOAD ke SERVER_DESIGN
  │
  ▼
Admin DG: Log JOS-D Selesai + tutup JOD + kirim JOD + sample ke PPIC
  │
  ▼
END → PPIC
```

**Additional for Export stream:**
- Buyer approval via Preview + Form Approval / email / WA
- SPV DG wajib upload reject konsep ke SERVER_ARCHIVE
- Marketing acc diperlukan sebelum Final Artwork

---

### SOP 3 — DESIGN TEKNIK (DT)

**Trigger:** PPIC menyerahkan JOP + Lampiran

```
START PPIC
  │
  ├─ PPIC serahkan JOP + Lampiran ke Admin DT
  ├─ Admin DT catat penerimaan JOP → Log JOP Datang
  ├─ SPV DT beri rating kesulitan + prioritas JOP → Update Progress JOP → bagikan ke DT
  │
  ▼
BLUEPRINT (OP Mesin Blueprint)
  (Membuat Blueprint skala 1:1 + laporan pembuatan Blueprint)
  │
  ▼
Admin DG: Catat Blueprint → serahkan ke DG → Update LOG Progress JOP
  │
  ▼
DG REVIEW
  (DG periksa kesesuaian konten, visual, dan Final FILE artworks)
  │
  ├─ Marketing pastikan hasil layout sesuai permintaan klien
  │
  ▼
DT LAYOUT
  (DT susun tata letak cetak sesuai spesifikasi JOP)
  + Dokumentasi pekerjaan harian + Update Progress JOP
  │
  ▼
SELF QC DT
  │
  ▼
Validasi Preflight + Checklist Preflight
  │
  ▼
FINALISASI File-B + File-CAD (jika produk butuh die-cut)
  │
  ▼
CHECKER DT
  (Checker DT periksa kesesuaian dengan JOP)
  │
  ├─ Tidak sesuai → REVISI → kembali ke DT
  │
  ▼
SPV DT
  (SPV DT pastikan SEMUA spesifikasi JOP terpenuhi)
  (SPV DT upload File-B + CAD ke SERVER_LAYOUT/montage)
  │
  ▼
File-B + File-CAD + Blueprint + JOP + LOG QC DT
  │
  ▼
Admin DT: Update LOG JOP → Log JOP Keluar → Update Master JOP
  │
  ▼
Dokumen fisik diserahkan ke Produksi / Cetak
  │
  ▼
END → SERVER_LAYOUT → Produksi
```

**Documents produced:**
- JOP + Update Master JOP
- Log Blueprint
- File-B + File-CAD
- Checklist Preflight + Validasi Preflight
- LOG DT + LOG REV
- LOG QC DT
- Log JOP Keluar

---

### SOP 4 — PROSES CTCP (Plate Making)

**Trigger:** Tim Cetak membuat permintaan Plate

```
START CETAK
  │
  ├─ Tim Cetak buat permintaan plate: No. JOP, No. Plate, No. Mesin Cetak, Jenis Bahan
  │
  ▼
CARI FILE
  (OP Plate cari file di Lokal Drive + Server berdasarkan Nomor B.)
  │
  ▼
CEK FILE?
  ├─ File tidak ditemukan/tidak sesuai → Server → kembali cari
  │
  ▼ YES (file ditemukan)
CEK JOP?
  (OP Plate cek kesesuaian No. Plate dengan JOP)
  (Cek No. File, Konten, Jumlah Warna, Color Bar, File Revisi Terakhir)
  │
  ├─ Tidak sesuai → PLATE GANTIAN (ganti/revisi)
  │
  ▼ YES
PROSES RIP
  (Proses Pecah Warna file → .TIFF, tentukan Gripper sesuai mesin cetak)
  │
  ▼
PROSES PECAH WARNA / EXPOSE CTCP
  (Muncul area image cetak, transfer image file to plate)
  │
  ▼
DEVELOPING / PROCESSOR
  (OP Plate siapkan Plate sesuai ukuran mesin cetak, jalankan mesin CTCP)
  (OP Plate pastikan kesesuaian chemical)
  │
  ▼
IMAGING PROCESS → TRANSFER IMAGE FILE TO PLATE
  │
  ▼
QC PLATE
  (OP cek densiti raster plate)
  (Checklist Quality: cek JOP + No. Plate)
  │
  ├─ Tidak pass → PLATE GANTIAN
  │
  ▼ YES
LABELING PLATE
  (OP beri label: No. Plate, No. JOP, dll.)
  │
  ▼
Tim Cetak Ambil Plate
  │
  ▼
END
```

**Documents produced:**
- Permintaan Plate (No. JOP + No. Plate + No. Mesin Cetak)
- Label Plate
- Checklist Quality CTCP

---

## SYSTEM DOCUMENT TAXONOMY

The system must digitize and track these real production documents:

| Document | Code | Owner | Description |
|---|---|---|---|
| Job Order Setter Design | JOS-D | Marketing | Brief/spec dari buyer ke DG |
| Job Order Design | JOD | Admin DG | Internal tracking DG, turunan JOS-D |
| Job Order Produksi | JOP | PPIC | Brief produksi ke DT/Prepress |
| LOG DG | LOG-DG | DG/DS | Log harian pekerjaan DG |
| LOG QC DG | LOG-QC-DG | Checker DG | Log hasil checking artwork |
| LOG ACC Artworks | LOG-ACC | Admin DG | Log artworks yang di-acc buyer |
| LOG Approval SPV | LOG-APV-SPV | SPV DG | Log approval SPV ke marketing |
| LOG JOS-D Selesai | LOG-JOS-DONE | Admin DG | Log penutupan JOS-D |
| LOG Blueprint | LOG-BP | OP-BP | Log pembuatan blueprint |
| LOG DT | LOG-DT | DT | Log harian pekerjaan DT |
| LOG REV | LOG-REV | DT/DG | Log revisi |
| LOG QC DT | LOG-QC-DT | Checker DT | Log hasil checking DT |
| LOG JOP Datang | LOG-JOP-IN | Admin DT | Log penerimaan JOP |
| LOG JOP Keluar | LOG-JOP-OUT | Admin DT | Log JOP keluar ke produksi |
| Master JOP | MASTER-JOP | Admin DT/SPV DT | Master tracking semua JOP |
| Checklist Pre-Flight DG | CPF-DG | DG/Checker DG | Checklist kesiapan file artwork |
| Checklist Preflight DT | CPF-DT | DT/Checker DT | Checklist kesiapan file teknik |
| Approval Form | APV-FORM | DG/DS | Form acc marketing & buyer |
| Permintaan Plate | REQ-PLATE | Tim Cetak | Request plate ke Prepress |
| Checklist Quality CTCP | CQ-CTCP | OP Plate | QC plate setelah expose |

---

## JOB TYPES & ROUTING

Every job must carry:

```ts
jobType: "DG_LOKAL" | "DG_JASA" | "DG_EXPORT" | "DT" | "CTCP" | "CTP" | "FLEXO" | "ETCHING" | "SCREEN"
stream:  "LOKAL" | "JASA" | "EXPORT"
```

Routing logic by jobType:

| jobType | SOP | Approval Chain |
|---|---|---|
| DG_LOKAL | SOP DG Lokal | DG → Self QC → Checker DG (2x) → SPV DG LOKAL → PPIC |
| DG_JASA | SOP DG Jasa/Export | DG → Marketing review → Buyer approve → Self QC → Checker DG (2x) → SPV DG JASA → PPIC |
| DG_EXPORT | SOP DG Jasa/Export | DG → Marketing review → Buyer approve → Self QC → Checker DG (2x) → SPV DG EXPORT → PPIC |
| DT | SOP DT | PPIC → Admin DT → SPV DT → OP-BP (Blueprint) → DG review → DT → Self QC DT → Checker DT → SPV DT → Produksi |
| CTCP | SOP CTCP | Tim Cetak → OP Plate (cari file) → RIP → Expose → Develop → QC Plate → Label → Cetak |

---

## WORKFLOW STATUS MACHINE

```
WAITING         → job terdaftar, belum diambil operator
IN_PROGRESS     → operator sedang mengerjakan
SELF_QC         → operator melakukan self-check sebelum submit
CHECKING_1      → di Checker DG/DT (Tahap 1)
REVISION        → dikembalikan ke operator untuk perbaikan
CHECKING_FINAL  → di Checker DG/DT (Tahap Final)
SPV_REVIEW      → menunggu review/approval SPV
BUYER_REVIEW    → menunggu approve buyer/marketing (khusus JASA/EXPORT)
APPROVED        → disetujui, siap ke tahap berikutnya
OUTPUT          → file dikirim ke server / produksi
PLATE_REQUEST   → permintaan plate masuk (Prepress)
RIP             → proses RIP di Prepress
EXPOSE          → proses expose CTCP/CTP
DEVELOP         → proses developing plate
QC_PLATE        → QC plate setelah expose
DONE            → selesai
HOLD            → ditunda (timer berhenti)
ARCHIVE         → reject konsep (disimpan di SERVER_ARCHIVE)
```

### Status transitions per SOP:

**DG LOKAL:**
```
WAITING → IN_PROGRESS → SELF_QC → CHECKING_1
  → [REVISION → IN_PROGRESS] loop
  → CHECKING_FINAL
  → [REVISION → IN_PROGRESS] loop
  → SPV_REVIEW → APPROVED → OUTPUT → DONE
```

**DG JASA / EXPORT:**
```
WAITING → IN_PROGRESS → BUYER_REVIEW
  → [REVISION → IN_PROGRESS] loop
  → SELF_QC → CHECKING_1
  → [REVISION → IN_PROGRESS] loop
  → CHECKING_FINAL
  → [REVISION → IN_PROGRESS] loop
  → SPV_REVIEW → APPROVED → OUTPUT → DONE
```

**DT:**
```
WAITING → IN_PROGRESS (Blueprint) → IN_PROGRESS (DG review) → IN_PROGRESS (DT layout)
  → SELF_QC → CHECKING_1 (Checker DT)
  → [REVISION → IN_PROGRESS] loop
  → SPV_REVIEW → APPROVED → OUTPUT → DONE
```

**CTCP:**
```
WAITING → IN_PROGRESS (Cari File) → IN_PROGRESS (Cek JOP)
  → RIP → EXPOSE → DEVELOP → QC_PLATE
  → [PLATE_GANTIAN → kembali ke RIP] loop
  → DONE (labeling + ambil plate)
```

---

## SELF QC CHECKLIST (DG/DS)

Operator harus mengisi Self QC sebelum submit ke Checker:

```ts
selfQcDG: {
  fileNamaSesuai: boolean;       // nama file sesuai JOS-D/JOD
  ukuranSesuai: boolean;         // dimensi/ukuran sesuai spesifikasi
  bleedSesuai: boolean;          // bleed area terpenuhi
  resolusiCukup: boolean;        // DPI memenuhi standar cetak
  warnaSesuai: boolean;          // color profile sesuai (FOGRA51/52)
  fontEmbedded: boolean;         // semua font ter-embed
  overprintBenar: boolean;       // overprint setting benar
  barcodeValid: boolean;         // barcode terbaca (jika ada)
  approvalFormDiisi: boolean;    // Approval Form sudah diisi
  preflightChecked: boolean;     // Checklist Pre-Flight sudah diisi
  submittedAt: Timestamp;
  submittedBy: string;           // userId operator
}
```

---

## CHECKER QC CHECKLIST (DG)

Tahap 1 dan Tahap Final:

```ts
checkerQcDG: {
  stage: "TAHAP_1" | "FINAL";
  kesesuaianJOSD: boolean;       // artwork sesuai JOS-D / JOD
  kesesuaianSpesifikasi: boolean;// semua spesifikasi terpenuhi
  preflightValid: boolean;       // Pre-Flight checklist valid
  fileVersion: string;           // versi file yang dicek
  result: "PASS" | "REVISION";
  revisionNotes?: string;
  checkedBy: string;             // userId Checker DG
  checkedAt: Timestamp;
  logUpdated: boolean;           // LOG QC DG sudah diupdate
}
```

---

## CHECKER QC CHECKLIST (DT)

```ts
checkerQcDT: {
  kesesuaianJOP: boolean;        // File sesuai JOP
  preflightValid: boolean;       // Preflight DT valid
  fileB_valid: boolean;          // File-B benar
  cad_valid: boolean;            // File-CAD benar (jika die-cut)
  blueprint_valid: boolean;      // Blueprint sesuai skala 1:1
  result: "PASS" | "REVISION";
  revisionNotes?: string;
  checkedBy: string;
  checkedAt: Timestamp;
}
```

---

## CTCP PLATE QC CHECKLIST

```ts
ctcpQc: {
  nomorPlateSesuai: boolean;     // No. Plate sesuai JOP
  nomorFileSesuai: boolean;      // No. File benar
  jumlahWarnaSesuai: boolean;    // Jumlah warna sesuai
  colorBarAda: boolean;          // Color bar ada
  fileRevisiTerakhir: boolean;   // Menggunakan file revisi terakhir
  densitasRasterOk: boolean;     // Densiti raster plate pass
  result: "PASS" | "PLATE_GANTIAN";
  checkedBy: string;
  checkedAt: Timestamp;
}
```

---

## FIRESTORE SCHEMA

### `jobs/{jobId}`

```ts
{
  // Identitas
  jobNumber: string;             // "JOB-2025-00123"
  jobType: JobType;              // "DG_LOKAL" | "DG_JASA" | "DG_EXPORT" | "DT" | "CTCP" | ...
  stream: Stream;                // "LOKAL" | "JASA" | "EXPORT"
  customerName: string;
  productName: string;
  category: string;

  // Dokumen referensi
  josdNumber?: string;           // No. JOS-D (DG jobs)
  jodNumber?: string;            // No. JOD (DG jobs)
  jopNumber?: string;            // No. JOP (DT + Prepress jobs)
  noPlate?: string;              // No. Plate (CTCP jobs)
  nomesinCetak?: string;         // No. Mesin Cetak (CTCP jobs)

  // Penugasan
  department: string;
  assignedTo: string;            // userId operator
  supervisorId: string;          // userId SPV (auto-derived from stream)
  checkerId?: string;            // userId Checker DG/DT
  adminId?: string;              // userId Admin yang handle

  // Workflow
  status: WorkflowStatus;
  previousStatus?: WorkflowStatus;
  checkerStage?: "TAHAP_1" | "FINAL";  // tracking posisi di Checker
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  difficultyRating?: "LOW" | "MEDIUM" | "HIGH";  // rating dari SPV

  // Waktu
  deadline: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  activeDuration: number;        // detik, tidak termasuk HOLD
  holdDuration: number;          // total detik on HOLD
  holdStartedAt?: Timestamp;

  // Revisi
  revisionCount: number;
  currentRevision: string;       // "R0" | "R1" | "R2" | "FINAL"

  // Approval
  approvalStatus: "PENDING" | "APPROVED" | "REJECTED";
  buyerApprovalStatus?: "PENDING" | "APPROVED" | "REJECTED";  // khusus JASA/EXPORT
  marketingApprovalStatus?: "PENDING" | "APPROVED" | "REJECTED";

  // Prepress (untuk DT/CTCP jobs)
  machineType?: "CTCP" | "CTP" | "FLEXO" | "ETCHING" | "SCREEN";
  shift?: "A" | "B" | "C";
  plateMaterial?: string;
  colorProfile?: "FOGRA51" | "FOGRA52";
  printMethod?: string;

  // Checklist
  selfQcDG?: SelfQcDG;
  checkerQcDG?: CheckerQcDG;
  selfQcDT?: SelfQcDT;
  checkerQcDT?: CheckerQcDT;
  ctcpQc?: CtcpQc;

  // Search
  searchable: string[];          // normalized prefix tokens

  // Server path (metadata saja, bukan file)
  serverPath?: string;           // e.g. "SERVER_DESIGN/Folder_DG/..."
}
```

### `revisions/{revisionId}`

```ts
{
  jobId: string;
  revisionNumber: string;        // "R0" | "R1" | "R2" | "FINAL"
  changedBy: string;
  returnedFrom: string;          // role yang mengembalikan (CHK-DG | SPV | BUYER)
  returnedTo: string;            // dept/role tujuan revisi
  reason: string;
  notes: string;
  changedAt: Timestamp;
  fileVersion: string;
}
```

### `approvals/{approvalId}`

```ts
{
  jobId: string;
  approvalLevel: "SELF_QC" | "CHECKER_TAHAP1" | "CHECKER_FINAL" | "BUYER" | "MARKETING" | "SPV" | "MGR";
  approvedBy: string;
  approvedAt: Timestamp;
  result: "APPROVED" | "REJECTED";
  rejectedReason?: string;
  stream?: string;
}
```

### `job_logs/{logId}`

```ts
{
  jobId: string;
  userId: string;
  action: LogAction;  // STATUS_CHANGE | ASSIGNED | SELF_QC | CHECKER_1 | CHECKER_FINAL |
                      // REVISION | BUYER_REVIEW | APPROVED | REJECTED | HOLD | UNHOLD |
                      // OUTPUT | DONE | ARCHIVE | PLATE_REQUEST | RIP | EXPOSE | DEVELOP | QC_PLATE
  oldValue: string;
  newValue: string;
  timestamp: Timestamp;
  stream?: string;
  shift?: string;
  notes?: string;
}
```

### `daily_kpi/{date_userId}`

```ts
{
  userId: string;
  date: string;                  // "2025-06-15"
  department: string;
  stream?: string;               // LOKAL | JASA | EXPORT
  shift?: string;                // A | B | C
  completedJobs: number;
  overdueJobs: number;
  revisionJobs: number;
  selfQcCount: number;           // jumlah self QC dilakukan
  checkerPassCount: number;      // jumlah lolos checker
  checkerRevisionCount: number;  // jumlah dikembalikan checker
  totalActiveSeconds: number;    // tidak termasuk HOLD
  totalHoldSeconds: number;
  avgRevisionPerJob: number;
}
```

### `customers/{customerId}`

```ts
{
  name: string;
  code: string;
  stream: Stream;
  contactPerson?: string;
  notes?: string;
  createdAt: Timestamp;
}
```

### `users/{userId}`

```ts
{
  displayName: string;
  employeeId: string;
  email: string;
  role: UserRole;
  department: string;
  roleCode: string;              // DG | DT | DS | CHK-DG | CHK-DT | OP-GMG | OP-CNC | OP-BP | D-SPEC | ADM-LOK | ADM-JAS | ADM-EXP | ADM-PP | ADM-DT | SPV-DG-LOK | SPV-DG-JAS | SPV-DG-EXP | SPV-DT | SPV-PP | MGR
  stream?: Stream;
  shift?: "A" | "B" | "C";
  spvId?: string;
  isActive: boolean;
  createdAt: Timestamp;
}
```

---

## RTDB SCHEMA

```
presence/
  {userId}/
    online: boolean
    lastSeen: timestamp
    currentJobId: string | null

queue/
  LOKAL/
    waiting: number
    inProgress: number
    checking: number
    revision: number
  JASA/
    waiting: number
    inProgress: number
    checking: number
    revision: number
  EXPORT/
    waiting: number
    inProgress: number
    checking: number
    revision: number

checkerQueue/
  DG/
    tahap1: number
    final: number
  DT/
    total: number

prepress/
  shifts/
    A/
      active: number
      operatorIds: [string]
    B/
      active: number
      operatorIds: [string]
    C/
      active: number
      operatorIds: [string]
  machines/
    CTCP: number     ← active plate jobs
    CTP: number
    FLEXO: number
    ETCHING: number
    SCREEN: number

dashboardCounters/
  totalWaiting: number
  totalInProgress: number
  totalOverdue: number
  totalRevision: number
  totalBuyerReview: number
  totalHold: number
```

---

## SECURITY — RBAC

```ts
type UserRole =
  | "admin"
  | "manager"
  | "spv-dg-exp"
  | "spv-dg-jas"
  | "spv-dg-lok"
  | "spv-dt"
  | "spv-pp"
  | "checker-dg"
  | "checker-dt"
  | "designer"           // DG / DS
  | "dt-operator"        // DT
  | "prepress-operator"  // PP shift
  | "op-mesin"           // OP GMG, CNC, BP
  | "admin-staff"        // ADM-LOK, ADM-JAS, ADM-EXP, ADM-PP, ADM-DT
  | "marketing";         // read + buyer approve
```

### Permission matrix:

| Action | admin | manager | spv | checker | designer | admin-staff | marketing |
|---|---|---|---|---|---|---|---|
| Create job | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Assign job | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Self QC submit | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ |
| Checker approve | ✅ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| SPV approve | ✅ | ✅ | ✅ (own stream) | ❌ | ❌ | ❌ | ❌ |
| Buyer approve | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ✅ |
| Rating kesulitan | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View all jobs | ✅ | ✅ | ✅ (own stream) | ✅ (own dept) | own only | own stream | own stream |
| KPI read | ✅ | ✅ | ✅ (own team) | ❌ | own only | ❌ | ❌ |

---

## HOLD TIMER LOGIC

```
ON HOLD:
  job.holdStartedAt = serverTimestamp()
  job.status = "HOLD"
  job.previousStatus = currentStatus
  RTDB: dashboardCounters.totalHold += 1

OFF HOLD:
  elapsed = now() - job.holdStartedAt
  job.holdDuration += elapsed
  job.holdStartedAt = null
  job.status = job.previousStatus
  RTDB: dashboardCounters.totalHold -= 1

KPI & Deadline calculation:
  effectiveDuration = totalElapsed - holdDuration
  effectiveDeadline = createdAt + originalDeadlineDuration + holdDuration
  isOverdue = now() > effectiveDeadline
```

---

## FILE MANAGEMENT (Firebase Storage)

```
/jobs/{jobId}/
  design/
    preview/
      preview_{jobNumber}_v1.jpg
    artworks/
      {filename}_R0.ai
      {filename}_R1.ai
      {filename}_FINAL.ai
    preflight/
      checklist_preflight_{jobNumber}.pdf
    approved/
      final_artwork_{jobNumber}_approved.pdf
  technical/
    file-b/
      fileB_{jobNumber}_v1.pdf
    cad/
      cad_{jobNumber}_v1.dxf
    blueprint/
      blueprint_{jobNumber}_1to1.pdf
  prepress/
    rip/
      rip_{jobNumber}_{color}.tif
    plate/
      label_{plateNumber}.pdf
  revisions/
    {revisionId}/
      {filename}_{revisionNumber}.{ext}
```

**Rules:**
- Never overwrite. Always version: `_R1`, `_R2`, `_FINAL`
- Only metadata stored in Firestore (path, size, uploadedBy, uploadedAt)
- Storage access scoped by role via Firebase Storage rules

---

## DASHBOARD ARCHITECTURE

### Design Dashboard (untuk SPV DG + Checker + Admin DG)

**Stream tabs: LOKAL | JASA | EXPORT**

Widgets per stream:
- Queue summary: WAITING / IN_PROGRESS / SELF_QC / CHECKING / BUYER_REVIEW / SPV_REVIEW
- Overdue jobs (highlight merah)
- Revision jobs count + siapa yang revisi
- Checker queue: Tahap 1 pending / Final pending
- Operator workload (job count per DG/DS)
- Rating kesulitan distribution

### DT Dashboard (untuk SPV DT + Checker DT + Admin DT)

Widgets:
- JOP masuk (WAITING)
- Blueprint queue (OP-BP)
- DT in progress + progress per operator
- Checker DT queue
- JOP keluar ke produksi

### Prepress Dashboard (untuk SPV PP + Koordinator + Shift Ops)

**Shift tabs: SHIFT A | SHIFT B | SHIFT C**

Widgets:
- Active plate requests per mesin (CTCP/CTP/FLEXO/ETCHING/SCREEN)
- RIP in progress
- QC Plate pending
- Plate gantian (rejected plates)
- WIP Plate status
- Shift handover summary

### Manager Dashboard

Full view: semua stream, semua departemen, KPI harian

---

## KPI AGGREGATION STRATEGY

### Pre-calculated on write (no aggregation queries):

1. **On job DONE:** update `daily_kpi/{date_userId}`:
   - completedJobs += 1
   - totalActiveSeconds += job.activeDuration

2. **On job REVISION:** update `daily_kpi/{date_userId}`:
   - revisionJobs += 1
   - checkerRevisionCount += 1 (for checker user)

3. **On job OVERDUE detected:** update `daily_kpi/{date_userId}`:
   - overdueJobs += 1

4. **Weekly/monthly rollup:** Cloud Function (or scheduled job) yang sum daily_kpi per userId per range.

### KPI metrics:

| Metric | Formula |
|---|---|
| On-time rate | (completedJobs - overdueJobs) / completedJobs × 100 |
| Revision rate | revisionJobs / completedJobs × 100 |
| Avg completion time | totalActiveSeconds / completedJobs |
| Checker efficiency | checkerPassCount / (checkerPassCount + checkerRevisionCount) × 100 |
| Self QC quality | jobs needing revision after self QC / total jobs |

---

## SEARCH STRATEGY

```ts
// Tokenizer: normalize + prefix array
function buildSearchable(job: Job): string[] {
  const tokens = [
    job.jobNumber,
    job.customerName,
    job.productName,
    job.josdNumber,
    job.jopNumber,
    job.assignedTo,
    job.stream,
    job.status,
    job.priority,
  ].filter(Boolean).map(t => t.toLowerCase());

  // Build prefix tokens
  const prefixes: string[] = [];
  tokens.forEach(token => {
    for (let i = 1; i <= token.length; i++) {
      prefixes.push(token.substring(0, i));
    }
  });

  return [...new Set(prefixes)];
}
```

Query:
```ts
query(
  collection(db, 'jobs'),
  where('searchable', 'array-contains', searchTerm.toLowerCase()),
  where('stream', '==', activeStream),
  orderBy('updatedAt', 'desc'),
  limit(20)
)
```

---

## RECOMMENDED FIRESTORE INDEXES

```
jobs: [stream, status, createdAt DESC]
jobs: [stream, status, deadline ASC]
jobs: [jobType, status, updatedAt DESC]
jobs: [assignedTo, status, updatedAt DESC]
jobs: [checkerId, checkerStage, updatedAt DESC]
jobs: [supervisorId, approvalStatus, updatedAt DESC]
jobs: [shift, machineType, status, updatedAt DESC]
jobs: [priority, status, deadline ASC]
jobs: [searchable (array), stream, updatedAt DESC]
daily_kpi: [userId, date DESC]
daily_kpi: [department, stream, date DESC]
revisions: [jobId, revisionNumber ASC]
approvals: [jobId, approvalLevel, approvedAt DESC]
job_logs: [jobId, timestamp DESC]
```

---

## NEXT.JS FOLDER STRUCTURE

```
src/
  app/
    (auth)/
      login/
    (dashboard)/
      layout.tsx
      page.tsx                         ← manager overview
      design/
        page.tsx                       ← design dashboard (stream tabs)
        jobs/
          page.tsx                     ← job list with stream filter
          new/page.tsx                 ← create job (Admin DG)
          [jobId]/
            page.tsx                   ← job detail
            revisions/page.tsx
            approvals/page.tsx
            checklist/page.tsx
      technical/
        page.tsx                       ← DT dashboard
        jobs/[jobId]/page.tsx
      prepress/
        page.tsx                       ← prepress shift board
        plate-request/page.tsx         ← CTCP plate request
        shifts/page.tsx                ← shift handover
      kpi/
        page.tsx
      admin/
        users/page.tsx
        departments/page.tsx
  components/
    jobs/
      JobCard.tsx
      JobTable.tsx
      JobStatusBadge.tsx
      JobStreamBadge.tsx
      JobTypeBadge.tsx
      DifficultyBadge.tsx             ← LOW/MEDIUM/HIGH rating SPV
    workflow/
      SelfQcForm.tsx
      CheckerQcForm.tsx               ← Tahap 1 + Final
      BuyerApprovalForm.tsx
      SpvApprovalForm.tsx
      PlateRequestForm.tsx
      PlateQcForm.tsx
    dashboard/
      StreamQueueWidget.tsx
      CheckerQueueWidget.tsx
      ShiftActiveWidget.tsx
      OverdueWidget.tsx
      LiveCounterWidget.tsx
    prepress/
      PrepressChecklist.tsx
      ShiftHandoverCard.tsx
      MachineQueueBoard.tsx
      PlateLabel.tsx
    documents/
      JosdCard.tsx
      JopCard.tsx
      LogViewer.tsx
    ui/
      [shared components]
  lib/
    firebase/
      firestore.ts
      rtdb.ts
      storage.ts
      auth.ts
    hooks/
      useJobs.ts
      useKpi.ts
      usePresence.ts
      useShift.ts
      useCheckerQueue.ts
    utils/
      holdTimer.ts
      kpiCalc.ts
      searchTokenizer.ts
      streamRouter.ts                 ← derives supervisorId + checkerId from stream
      workflowStateMachine.ts         ← allowed transitions per jobType
      documentLog.ts                  ← LOG-DG, LOG-DT, LOG-QC helpers
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
    documents.types.ts                ← JOS-D, JOD, JOP, LOG types
```

---

## WORKFLOW STATE MACHINE (workflowStateMachine.ts)

```ts
const transitions: Record<JobType, Record<WorkflowStatus, WorkflowStatus[]>> = {
  DG_LOKAL: {
    WAITING:          ["IN_PROGRESS"],
    IN_PROGRESS:      ["SELF_QC", "HOLD"],
    SELF_QC:          ["CHECKING_1", "IN_PROGRESS"],
    CHECKING_1:       ["REVISION", "CHECKING_FINAL"],
    REVISION:         ["IN_PROGRESS"],
    CHECKING_FINAL:   ["REVISION", "SPV_REVIEW"],
    SPV_REVIEW:       ["REVISION", "APPROVED"],
    APPROVED:         ["OUTPUT"],
    OUTPUT:           ["DONE"],
    HOLD:             ["IN_PROGRESS", "SELF_QC", "CHECKING_1", ...],
  },
  DG_JASA: {
    WAITING:          ["IN_PROGRESS"],
    IN_PROGRESS:      ["BUYER_REVIEW", "HOLD"],
    BUYER_REVIEW:     ["REVISION", "SELF_QC"],
    REVISION:         ["IN_PROGRESS"],
    SELF_QC:          ["CHECKING_1"],
    CHECKING_1:       ["REVISION", "CHECKING_FINAL"],
    CHECKING_FINAL:   ["REVISION", "SPV_REVIEW"],
    SPV_REVIEW:       ["REVISION", "APPROVED"],
    APPROVED:         ["OUTPUT"],
    OUTPUT:           ["DONE"],
  },
  DT: {
    WAITING:          ["IN_PROGRESS"],      // OP-BP Blueprint
    IN_PROGRESS:      ["SELF_QC", "HOLD"],  // DT Layout
    SELF_QC:          ["CHECKING_1"],
    CHECKING_1:       ["REVISION", "SPV_REVIEW"],
    REVISION:         ["IN_PROGRESS"],
    SPV_REVIEW:       ["REVISION", "APPROVED"],
    APPROVED:         ["OUTPUT"],
    OUTPUT:           ["DONE"],
  },
  CTCP: {
    WAITING:          ["IN_PROGRESS"],      // Cari File
    IN_PROGRESS:      ["RIP"],              // Cek JOP OK
    RIP:              ["EXPOSE"],
    EXPOSE:           ["DEVELOP"],
    DEVELOP:          ["QC_PLATE"],
    QC_PLATE:         ["RIP", "DONE"],      // RIP = plate gantian, DONE = pass
    DONE:             [],
  },
};
```

---

## STREAM ROUTER (streamRouter.ts)

```ts
// Auto-assign supervisorId and checkerId based on jobType + stream
function resolveAssignments(jobType: JobType, stream: Stream): {
  supervisorId: string;
  checkerPool: string[];  // checker IDs eligible for this job
} {
  const map = {
    DG_LOKAL:  { spvRole: "spv-dg-lok", checkerRole: "checker-dg" },
    DG_JASA:   { spvRole: "spv-dg-jas", checkerRole: "checker-dg" },
    DG_EXPORT: { spvRole: "spv-dg-exp", checkerRole: "checker-dg" },
    DT:        { spvRole: "spv-dt",     checkerRole: "checker-dt" },
    CTCP:      { spvRole: "spv-pp",     checkerRole: null },
  };
  // fetch users with matching spvRole + stream from Zustand cache
}
```

---

## SPARK PLAN OPTIMIZATION CHECKLIST

- [ ] Semua query menggunakan composite indexes
- [ ] Semua list dipaginasi (limit 20–50)
- [ ] Tidak ada full collection scan
- [ ] RTDB hanya untuk presence + lightweight counters per stream/shift
- [ ] Summary document (daily_kpi) di-update on write, bukan di-query on read
- [ ] Array infinitely growing dihindari (gunakan subcollection untuk revisions/logs)
- [ ] Batched writes untuk multi-document updates (status change + log + RTDB counter)
- [ ] Zustand cache mencegah re-fetch data yang tidak berubah
- [ ] Storage metadata only di Firestore (bukan binary content)
- [ ] Debounced search input (300ms)
- [ ] Memoized dashboard widgets
- [ ] Selective RTDB listener (per stream, per shift — bukan global listener)
- [ ] Checker queue hanya diload saat role = checker-dg/dt
- [ ] Prepress board hanya diload saat shift aktif
- [ ] Job detail page: single document read, bukan query
- [ ] No N+1 reads: preload user list di Zustand, resolve nama dari cache

---

## UI/UX REQUIREMENTS

**Color coding — Stream:**
- LOKAL → `blue-600`
- JASA → `green-600`
- EXPORT → `orange-600`

**Color coding — Status:**
- WAITING → `gray-400`
- IN_PROGRESS → `blue-500`
- SELF_QC → `cyan-500`
- CHECKING_1 → `yellow-400`
- CHECKING_FINAL → `yellow-600`
- BUYER_REVIEW → `purple-400`
- REVISION → `red-400`
- SPV_REVIEW → `indigo-500`
- APPROVED → `green-500`
- OUTPUT → `teal-500`
- RIP / EXPOSE / DEVELOP → `violet-500`
- QC_PLATE → `yellow-500`
- DONE → `gray-700`
- HOLD → `red-600`

**Color coding — Shift:**
- Shift A → `yellow-500`
- Shift B → `purple-500`
- Shift C → `teal-500`

**Color coding — Difficulty (SPV rating):**
- LOW → `green-400`
- MEDIUM → `yellow-400`
- HIGH → `red-400`

**Keyboard shortcuts:**
- `J` → next job in list
- `K` → previous job
- `S` → change status
- `H` → toggle hold
- `A` → approve (if role allows)
- `R` → mark revision
- `Q` → open self QC form
- `/` → focus search

---

## DELIVERABLES

Generate:

1. Complete Firestore schema (stream-aware, shift-aware, document-aware)
2. RTDB schema (presence + stream queues + shift counters + machine counters)
3. Recommended Firestore indexes
4. Next.js folder structure
5. Zustand store architecture
6. Dashboard architecture (Design stream board + DT board + Prepress shift board + Manager view)
7. KPI aggregation strategy (per user, per stream, per shift, per checker)
8. Security rules (stream-scoped RBAC, checker-scoped, shift-scoped)
9. Realtime strategy (selective RTDB listeners only)
10. Search strategy (prefix, indexed, stream-filtered)
11. File upload strategy (versioned, path-structured, metadata-only in Firestore)
12. Revision tracking architecture (R0→R1→FINAL, per-SOP)
13. Approval workflow (Self QC → Checker Tahap 1 → Checker Final → Buyer/Marketing → SPV chain, per jobType)
14. Production board design (per stream, per shift)
15. Spark Plan optimization checklist
16. Recommended query patterns
17. Recommended listener strategy
18. Department workflow mapping (exact SOP routes per jobType)
19. HOLD timer logic
20. Lightweight audit architecture
21. Shift handover design for Prepress
22. Stream routing logic (streamRouter utility)
23. Checker queue management (CHK-DG Tahap 1 + Final / CHK-DT)
24. Workflow state machine (per jobType transitions)
25. Document taxonomy digitization (JOS-D / JOD / JOP / LOG tracking in system)
26. CTCP plate request & QC flow
27. Blueprint OP-BP workflow integration
28. Self QC + Preflight checklist forms per department
29. Difficulty rating system (SPV assigns LOW/MEDIUM/HIGH per job)
30. SERVER_ARCHIVE flow (rejected concept archiving)

---

**IMPORTANT:**
Keep everything: **realistic, maintainable, lightweight, production-ready, Spark Plan optimized**, and faithful to the **actual documented SOPs** as practiced in this printing production environment with a 3-shift Prepress operation, stream-divided Design department (Lokal / Jasa / Export), and a two-stage Checker approval system (Tahap 1 + Final).