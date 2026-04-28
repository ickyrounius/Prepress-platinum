'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  CaretUpDown, MagnifyingGlass, UserCircle, 
  Envelope, IdentificationBadge, ShieldCheck,
  Trash, CheckCircle, MinusCircle, UserCirclePlus,
  ChartLineUp
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { ROLE_SELECT_GROUPS } from '@/lib/userRoles';
import { motion, AnimatePresence } from 'framer-motion';

interface UserData {
  id: string;
  KATEGORI: string;
  displayName?: string;
  email?: string;
  lastLogin?: string;
  ACTIVE?: boolean;
}

interface UserTableProps {
  users: UserData[];
  onUpdateRole: (uid: string, newRole: string) => void;
  onDelete: (uid: string, name: string) => void;
  onToggleStatus: (uid: string, currentStatus: boolean) => void;
}

export const UserTable = ({ users, onUpdateRole, onDelete, onToggleStatus }: UserTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof UserData>('KATEGORI');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredUsers = users
    .filter(u => 
      (u.displayName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.KATEGORI?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const valA = String(a[sortKey] || '');
      const valB = String(b[sortKey] || '');
      return sortDir === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });

  const toggleSort = (key: keyof UserData) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const getRoleStyle = (role: string) => {
    const r = role.toUpperCase();
    if (['ADMIN', 'DEVELOPER'].includes(r)) return 'bg-slate-900 shadow-slate-200 text-white';
    if (['MANAGER', 'ADMIN DT', 'ADMIN DG', 'ADMIN PREPRESS'].includes(r)) return 'bg-amber-500 shadow-amber-100 text-white';
    if (['DT', 'CAD', 'SPV DT'].includes(r)) return 'bg-blue-600 shadow-blue-100 text-white';
    if (['DG', 'DS', 'SPV DG'].includes(r)) return 'bg-purple-600 shadow-purple-100 text-white';
    if (['PRODUCTION', 'SPV PREPRESS', 'KOORDINATOR', 'OP CTP', 'OP CTCP', 'OP FLEXO', 'OP SCREEN', 'OP ETCHING'].includes(r)) return 'bg-emerald-600 shadow-emerald-100 text-white';
    if (['KOORDINATOR', 'MANAGER'].includes(r)) return 'bg-amber-500 shadow-amber-100 text-white';
    return 'bg-slate-100 text-slate-500 border border-slate-200';
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm">
        <div className="relative flex-1 w-full">
          <MagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" weight="bold" />
          <input 
            type="text" 
            placeholder="Cari nama, email, atau departemen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>
        <div className="px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center gap-2">
           <IdentificationBadge className="text-indigo-500" weight="bold" />
           <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Total Users: {filteredUsers.length}</span>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="overflow-visible">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer group" onClick={() => toggleSort('displayName')}>
                    <div className="flex items-center gap-2">
                        USER INFO
                        <CaretUpDown className="group-hover:text-indigo-500" />
                    </div>
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] cursor-pointer group" onClick={() => toggleSort('KATEGORI')}>
                    <div className="flex items-center gap-2">
                        DEPARTEMEN / ROLE
                        <CaretUpDown className="group-hover:text-indigo-500" />
                    </div>
                </th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">STATUS</th>
                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">LOGIN TERAKHIR</th>
                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => (
                  <motion.tr 
                    key={user.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hover:bg-slate-50 group transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-200">
                          <UserCircle size={24} weight="bold" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800">{user.displayName || 'No Name'}</p>
                          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Envelope weight="bold" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                        getRoleStyle(user.KATEGORI)
                      )}>
                        <ShieldCheck weight="bold" className="w-3 h-3" />
                        {user.KATEGORI}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => onToggleStatus(user.id, user.ACTIVE ?? true)}
                        className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                          (user.ACTIVE ?? true) 
                            ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" 
                            : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        )}
                      >
                        {(user.ACTIVE ?? true) ? (
                          <><CheckCircle weight="bold" /> ACTIVE</>
                        ) : (
                          <><MinusCircle weight="bold" /> INACTIVE</>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                         <span className={cn(
                           "w-2 h-2 rounded-full",
                           (user.ACTIVE ?? true) ? "bg-emerald-500" : "bg-slate-300"
                         )}></span>
                         {user.lastLogin || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link 
                          href={`/users/performance?id=${user.id}`}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all group/perf"
                          title="Lihat Performa"
                        >
                          <ChartLineUp size={18} weight="bold" className="group-hover/perf:scale-110 transition-transform" />
                        </Link>
                        <RoleSelector 
                          currentRole={user.KATEGORI} 
                          onUpdate={(newRole) => onUpdateRole(user.id, newRole)} 
                        />
                        <button 
                          onClick={() => onDelete(user.id, user.displayName || 'User')}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all group/del"
                          title="Hapus User"
                        >
                          <Trash size={18} weight="bold" className="group-hover/del:scale-110 transition-transform" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

function RoleSelector({ currentRole, onUpdate }: { currentRole: string, onUpdate: (role: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-indigo-300 hover:bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <span>ROLE</span>
          <CaretUpDown weight="bold" className="text-slate-400" />
        </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 z-50 overflow-hidden"
            >
              <div className="max-h-80 overflow-y-auto py-2">
                {ROLE_SELECT_GROUPS.map((group, gIdx) => (
                  <div key={group.label} className={cn(gIdx !== 0 && "mt-2 pt-2 border-t border-slate-50")}>
                    <p className="px-4 py-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50">
                      {group.label}
                    </p>
                    {group.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          onUpdate(option);
                          setIsOpen(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wide flex items-center justify-between group/btn transition-colors",
                          currentRole === option 
                            ? "bg-indigo-50 text-indigo-600" 
                            : "text-slate-600 hover:bg-slate-50 hover:text-indigo-500"
                        )}
                      >
                        {option}
                        {currentRole === option && <ShieldCheck weight="fill" className="text-indigo-500" />}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
