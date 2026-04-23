'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, query, orderBy, limit } from 'firebase/firestore';
import { UserTable } from '@/components/dashboard/UserTable';
import { exportToPDF } from '@/features/report/exportPDF';
import { useAuth } from '@/features/auth/AuthContext';
import { recordAuditLog } from '@/features/audit-log/auditLogService';
import { isValidUserRole } from '@/lib/userRoles';
import { 
  UsersThree, ShieldCheck, DownloadSimple,
  CircleNotch, WarningCircle 
} from '@phosphor-icons/react';
import { motion } from 'framer-motion';

interface UserItem {
  id: string;
  KATEGORI: string;
  displayName?: string;
  email?: string;
  lastLogin?: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, "T_USERS"), orderBy("displayName", "asc"), limit(100));
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const usersList: UserItem[] = [];
        snapshot.forEach((doc) => {
          usersList.push({ id: doc.id, ...doc.data() } as UserItem);
        });
        setUsers(usersList);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching users:", err);
        setError("Gagal memuat daftar pengguna. Pastikan Anda memiliki hak akses Admin.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleUpdateRole = async (uid: string, newRole: string) => {
    try {
      if (!isValidUserRole(newRole)) {
        alert("Role tidak valid.");
        return;
      }

      const userRef = doc(db, "T_USERS", uid);
      await updateDoc(userRef, {
        KATEGORI: newRole
      });
      if (user?.uid) {
        await recordAuditLog({
          actorUid: user.uid,
          action: "update_role",
          entityType: "users",
          entityId: uid,
          metadata: { newRole },
        });
      }
      // Updated message or toast can be added here
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Gagal memperbarui role. Periksa izin akses Anda.");
    }
  };

  const handleExportUsers = () => {
    const columns = ['UID', 'Display Name', 'Email', 'Role', 'Last Login'];
    const rows = users.map((u) => [u.id, u.displayName || '-', u.email || '-', u.KATEGORI || '-', u.lastLogin || '-']);
    exportToPDF('User Management Report', columns, rows, `users-report-${Date.now()}.pdf`);
    if (user?.uid) {
      void recordAuditLog({
        actorUid: user.uid,
        action: "export_pdf",
        entityType: "users",
        entityId: "users_report",
        metadata: { rows: rows.length },
      });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <CircleNotch className="w-12 h-12 text-indigo-500 animate-spin" weight="bold" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] animate-pulse">Memuat Database User...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-3xl flex items-center justify-center shadow-inner">
          <WarningCircle size={32} weight="bold" />
        </div>
        <div className="space-y-2">
            <h3 className="text-xl font-black text-slate-800">Akses Terbatas</h3>
            <p className="text-sm font-bold text-slate-400 max-w-md">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      {/* Header Panel */}
      <div className="bg-slate-900 p-8 sm:p-12 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full -ml-24 -mb-24 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-500/20 rounded-full border border-indigo-500/30">
                <ShieldCheck className="text-indigo-400" weight="bold" size={14} />
                <span className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Admin Control Center</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight">User Management</h1>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest text-[10px]">Atur Hirarki, Akses Departemen, dan Hak Operasional Seluruh Akun</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-sm">
             <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-900/40">
                <UsersThree size={24} weight="bold" className="text-white" />
             </div>
             <div>
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Database Sync</p>
                <p className="text-sm font-black text-white uppercase">Cloud Firestore Active</p>
             </div>
          </div>
          <button
            onClick={handleExportUsers}
            className="px-5 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg hover:bg-indigo-700 transition-all"
          >
            <DownloadSimple weight="bold" /> Export PDF
          </button>
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <UserTable users={users} onUpdateRole={handleUpdateRole} />
      </motion.div>

      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4">
         <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-indigo-500">
            <ShieldCheck weight="bold" size={20} />
         </div>
         <p className="text-[10px] font-bold text-slate-500 leading-relaxed max-w-2xl uppercase tracking-tighter">
            <b>Catatan Keamanan:</b> Perubahan role user akan berdampak langsung pada navigasi dan hak akses operasional (Sidebar & Panel). Pastikan setiap pic ditempatkan pada departemen yang sesuai dengan tugasnya.
         </p>
      </div>
    </div>
  );
}
