'use client';

import React, { useState } from 'react';
import { 
  CaretUpDown, MagnifyingGlass, UserCircle, 
  Envelope, IdentificationBadge, ShieldCheck 
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
}

interface UserTableProps {
  users: UserData[];
  onUpdateRole: (uid: string, newRole: string) => void;
}

export const UserTable = ({ users, onUpdateRole }: UserTableProps) => {
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
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
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
                      <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                         {user.lastLogin || 'N/A'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select 
                        value={user.KATEGORI}
                        onChange={(e) => onUpdateRole(user.id, e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-600 focus:border-indigo-500 outline-none cursor-pointer transition-all hover:border-indigo-300"
                      >
                        {ROLE_SELECT_GROUPS.map((group) => (
                          <optgroup key={group.label} label={group.label}>
                            {group.options.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
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
