'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { 
  Search, 
  Filter, 
  MonitorPlay,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  ArrowUpDown,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { JopData as WorkflowJop } from '@/features/job/jobTypes';
import { resolveWorkflowStatus } from '@/lib/workflow';

export default function MasterDataPage() {
  const [data, setData] = useState<WorkflowJop[]>([]);
  const [filteredData, setFilteredData] = useState<WorkflowJop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'aktif' | 'closed'>('aktif');
  const [totalAktif, setTotalAktif] = useState(0);
  const [totalClosed, setTotalClosed] = useState(0);
  const [picFilter, setPicFilter] = useState('');

  useEffect(() => {
    const jopRef = collection(db, 'workflows_jop');
    const q = query(jopRef, orderBy('timestamp_input', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allData = snapshot.docs.map(doc => ({
        ID: doc.id,
        ...doc.data()
      })) as unknown as WorkflowJop[];
      
      setData(allData);
      setTotalAktif(allData.filter((item) => resolveWorkflowStatus(item as Record<string, unknown>, 'DT').toUpperCase() !== 'CLOSED').length);
      setTotalClosed(allData.filter((item) => resolveWorkflowStatus(item as Record<string, unknown>, 'DT').toUpperCase() === 'CLOSED').length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const result = data.filter((item) => {
      const status = resolveWorkflowStatus(item as Record<string, unknown>, 'DT').toUpperCase() || 'OPEN';
      const matchesTab = activeTab === 'aktif' ? status !== 'CLOSED' : status === 'CLOSED';
      
      const noJop = item.NO_JOP || item.no_jop || item.ID || '';
      const buyer = item.BUYER || item.buyer || '';
      const product = item.NAMA_JOP || item.produk || item.nama_produk || '';
      
      const matchesSearch = !searchTerm || 
        (String(noJop).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (String(buyer).toLowerCase().includes(searchTerm.toLowerCase())) ||
        (String(product).toLowerCase().includes(searchTerm.toLowerCase()));
        
      const pic = item.PIC_UTAMA || item.pic_utama || '';
      const matchesPIC = !picFilter || pic === picFilter;
      
      return matchesTab && matchesSearch && matchesPIC;
    });
    setFilteredData(result);
  }, [data, activeTab, searchTerm, picFilter]);

  const uniquePICs = Array.from(new Set(data.map(item => item.PIC_UTAMA).filter(Boolean)));

  return (
    <div className="space-y-6 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex justify-center items-center text-white shadow-lg shadow-indigo-100">
            <MonitorPlay size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">Data Monitor</h1>
            <p className="text-sm text-slate-400 font-medium">Real-time status tracking across all departments</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button 
            onClick={() => setActiveTab('aktif')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'aktif' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Aktif ({totalAktif})
          </button>
          <button 
            onClick={() => setActiveTab('closed')}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'closed' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            Closed ({totalClosed})
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Search JOP, Buyer, or Item name..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 appearance-none shadow-sm"
            value={picFilter}
            onChange={(e) => setPicFilter(e.target.value)}
          >
            <option value="">All PIC Utama</option>
            {uniquePICs.map(pic => (
              <option key={pic} value={pic}>{pic}</option>
            ))}
          </select>
        </div>

        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg active:scale-95">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-bottom border-slate-200">
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">JOP Info</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Buyer & Produk</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">PIC</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Target</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin" />
                        <p className="text-sm text-slate-400 font-medium">Synchronizing with database...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <Search size={32} />
                        </div>
                        <p className="text-sm text-slate-400 font-medium">No records found matching your criteria</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, idx) => (
                    <motion.tr 
                      key={item.ID || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <StatusBadge status={resolveWorkflowStatus(item as Record<string, unknown>, 'DT') || 'OPEN'} />
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-slate-800 tracking-tight">{(item.NO_JOP || item.no_jop || item.ID) as string}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{(item.TIPE_JOP || item.tipe_jop) as string}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-700">{(item.BUYER || item.buyer) as string}</span>
                          <span className="text-xs text-slate-400 line-clamp-1">
                            {(item.NAMA_JOP || item.produk || item.nama_produk) as string}
                            {item.TOTAL_KARTON_BOX || item.total_karton_box ? ` - ${item.TOTAL_KARTON_BOX || item.total_karton_box} Box` : ''}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 uppercase">
                            {String(item.PIC_UTAMA || item.pic_utama || '--').substring(0, 2)}
                          </div>
                          <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">{(item.PIC_UTAMA || item.pic_utama || 'Not Assigned') as string}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock size={14} className="text-slate-300" />
                          <span className="text-xs font-medium">{(item.TGL_TARGET || item.tgl_target || item.TGL_TARGET_JOP) as string}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-indigo-600">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string, text: string, icon: React.ElementType }> = {
    'Closed': { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle2 },
    'Blueprint': { bg: 'bg-indigo-50', text: 'text-indigo-600', icon: MonitorPlay },
    'OPEN': { bg: 'bg-blue-50', text: 'text-blue-600', icon: Clock },
    'Assigned': { bg: 'bg-purple-50', text: 'text-purple-600', icon: ArrowUpDown },
    'Hold': { bg: 'bg-amber-50', text: 'text-amber-600', icon: AlertCircle },
  };

  const current = config[status] || config['OPEN'];
  const Icon = current.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${current.bg} ${current.text}`}>
      <Icon size={12} strokeWidth={3} />
      <span className="text-[10px] font-black uppercase tracking-widest">{status}</span>
    </div>
  );
}
