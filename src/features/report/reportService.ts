import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { exportToPDF } from './exportPDF';
import { format } from 'date-fns';

type ProductionType = 'CTP' | 'CTCP' | 'FLEXO' | 'ETCHING' | 'SCREEN';

const fieldMaps: Record<ProductionType, Record<string, string>> = {
  CTP: {
    DATE: 'Tanggal',
    NO_JOP: 'No JOP',
    NAMA_JOP: 'Nama Pekerjaan',
    UKURAN_PLATE: 'Ukuran',
    MESIN_EXPOSE: 'Mesin',
    PLATE_BARU: 'Baru',
    PLATE_BAIK: 'Baik',
    PLATE_RUSAK: 'Rusak',
    PLATE_GANTI: 'Ganti',
    NAMA_OP: 'Operator'
  },
  CTCP: {
    DATE: 'Tanggal',
    NO_JOP: 'No JOP',
    NAMA_JOP: 'Nama Pekerjaan',
    UKURAN_PLATE: 'Ukuran',
    MESIN_EXPOSE: 'Mesin',
    PLATE_BARU: 'Baru',
    PLATE_BAIK: 'Baik',
    PLATE_RUSAK: 'Rusak',
    PLATE_GANTI: 'Ganti',
    NAMA_OP: 'Operator'
  },
  FLEXO: {
    DATE: 'Tanggal',
    NO_JOP: 'No JOP',
    NO_B: 'No B',
    LPI: 'LPI',
    TEBAL_FLEXO: 'Tebal',
    LUASAN_FLEXO: 'Luasan',
    KELUAR_BARU: 'Keluar',
    GANTI: 'Ganti',
    SISA: 'Sisa',
    NAMA_OP: 'Operator'
  },
  ETCHING: {
    DATE: 'Tanggal',
    NO_JOP: 'No JOP',
    NO_B: 'No B',
    TIPE: 'Tipe',
    STATUS: 'Status',
    PLATE_BAIK: 'Baik',
    PLATE_RUSAK: 'Rusak',
    PLATE_GANTI: 'Ganti',
    NAMA_OP: 'Operator'
  },
  SCREEN: {
    ID: 'ID',
    DATE: 'Tanggal',
    NO_JOP: 'No JOP',
    NO_B: 'No B',
    MESH_SCREEN: 'Mesh',
    Jumlah_Screen_Bagus: 'Bagus',
    Jumlah_Screen_Rusak: 'Rusak',
    Jumlah_Screen_Ganti: 'Ganti',
    NAMA_OP: 'Operator'
  }
};

export async function generateProductionReport(type: ProductionType, dateRange?: { start: Date, end: Date }) {
  const collectionName = `FS_DB_${type}`;
  const collRef = collection(db, collectionName);
  
  let q = query(collRef, orderBy('DATE', 'desc'));

  if (dateRange) {
    const startStr = format(dateRange.start, 'yyyy-MM-dd');
    const endStr = format(dateRange.end, 'yyyy-MM-dd');
    q = query(collRef, where('DATE', '>=', startStr), where('DATE', '<=', endStr), orderBy('DATE', 'desc'));
  }

  const snapshot = await getDocs(q);
  const rawData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  if (rawData.length === 0) {
    throw new Error('Tidak ada data untuk periode ini.');
  }

  const map = fieldMaps[type];
  const columns = Object.values(map);
  const keys = Object.keys(map);

  const tableData = rawData.map((item: Record<string, unknown>) => {
    return keys.map(key => {
      const val = item[key];
      // Handle special formatting
      if (key === 'DATE' && val instanceof Timestamp) {
        return format(val.toDate(), 'dd/MM/yyyy');
      }
      return val ?? '-';
    });
  });

  exportToPDF(
    `Laporan Produksi ${type}`,
    columns,
    tableData as any[][],
    `Log_${type}_${format(new Date(), 'yyyyMMdd_HHmm')}.pdf`
  );
}
