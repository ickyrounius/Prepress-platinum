'use client';

import React, { useState, useEffect, useRef } from 'react';
import { db, rtdb } from '@/lib/firebase';
import { collection, query, getDocs, limit, orderBy, startAt, endAt } from 'firebase/firestore';
import { ref, get } from 'firebase/database';
import { Search, Loader2, X, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

type SearchItem = {
  id: string;
  is_rtdb?: boolean;
  buyer?: string;
  customer?: string;
  produk?: string;
  nama_job?: string;
  status?: string;
  status_workflow?: string;
  status_dg?: string;
  status_dt?: string;
  status_qc?: string;
  status_cad?: string;
  tahapan_prepress?: string;
  [key: string]: unknown;
};

interface JOPSearchProps {
  type: 'JOP' | 'JOS';
  onSelect: (id: string, data: SearchItem | null) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  required?: boolean;
}

export function JOPSearch({
  type,
  onSelect,
  placeholder,
  className,
  label,
  required = false
}: JOPSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SearchItem | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const colName = type === 'JOP' ? 'workflows_jop' : 'workflows_jos';
        
        // 1. Search Active Jobs in RTDB
        const activeRef = ref(rtdb, `active_jobs/${colName}`);
        const activeSnapshot = await get(activeRef);
        const activeItems: SearchItem[] = [];
        
        if (activeSnapshot.exists()) {
          const data = activeSnapshot.val() as Record<string, Record<string, unknown>>;
          Object.keys(data).forEach(key => {
            const item = { id: key, ...data[key], is_rtdb: true };
            if (key.toUpperCase().includes(searchTerm.toUpperCase())) {
              activeItems.push(item);
            }
          });
        }

        // 2. Search Archived Jobs in Firestore
        const q = query(
          collection(db, colName),
          orderBy('id'),
          startAt(searchTerm.toUpperCase()),
          endAt(searchTerm.toUpperCase() + '\uf8ff'),
          limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        const firestoreItems: SearchItem[] = [];
        querySnapshot.forEach((doc) => {
          // Avoid duplicates if already in RTDB
          if (!activeItems.find(a => a.id === doc.id)) {
            firestoreItems.push({ id: doc.id, ...doc.data() });
          }
        });

        setResults([...activeItems, ...firestoreItems].slice(0, 15));
        setIsOpen(true);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, type]);

  const handleSelect = (item: SearchItem) => {
    setSelectedItem(item);
    setSearchTerm(item.id);
    setIsOpen(false);
    onSelect(item.id, item);
  };

  const clearSelection = () => {
    setSelectedItem(null);
    setSearchTerm('');
    onSelect('', null);
  };

  return (
    <div className={cn("relative space-y-1 w-full", className)} ref={dropdownRef}>
      {label && <label className="text-[10px] font-bold text-slate-400 uppercase">{label}</label>}
      
      <div className="relative group">
        <div className={cn(
          "absolute left-3 top-1/2 -translate-y-1/2 transition-colors",
          isSearching ? "text-indigo-500" : "text-slate-400 group-focus-within:text-indigo-500"
        )}>
          {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </div>
        
        <input
          type="text"
          value={searchTerm}
          required={required && !selectedItem}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder={placeholder || `Cari ${type}...`}
          className={cn(
            "w-full pl-10 pr-10 py-3 border rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all",
            selectedItem ? "border-emerald-200 bg-emerald-50/30 font-bold text-emerald-900" : "border-slate-200"
          )}
        />

        {(searchTerm || selectedItem) && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {results.map((item) => {
              const getStatusLabel = () => {
                if (item.is_rtdb) return 'Active (Realtime)';
                const s = item.status || item.status_workflow || item.status_dg || item.status_dt || item.status_qc || item.status_cad || item.tahapan_prepress;
                return s || 'Archived';
              };

              const isFinished = () => {
                const s = (item.status || item.status_workflow || item.status_dg || item.status_dt || item.status_qc || item.status_cad || item.tahapan_prepress || '').toUpperCase();
                return ['SELESAI', 'CLOSED', 'DONE', 'APPROVED', 'LUNAS'].includes(s);
              };

              const isHold = () => {
                const s = (item.status || item.status_workflow || item.status_dg || item.status_dt || '').toUpperCase();
                return s.includes('HOLD') || s.includes('REVISI');
              };

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 flex flex-col transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-900">{item.id}</span>
                    <span className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1",
                      item.is_rtdb ? "bg-indigo-100 text-indigo-700 shadow-sm" :
                      isFinished() ? "bg-emerald-100 text-emerald-700" :
                      isHold() ? "bg-amber-100 text-amber-700" :
                      "bg-blue-100 text-blue-700"
                    )}>
                      {item.is_rtdb && <Zap className="w-2.5 h-2.5 fill-current" />}
                      {getStatusLabel()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 mt-0.5">
                    <span className="truncate max-w-[150px]">{item.buyer || item.customer || 'No Buyer'}</span>
                    <span className="text-[10px] text-slate-400 italic">{item.produk || item.nama_job || ''}</span>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="p-2 bg-slate-50 border-t border-slate-100 text-[10px] text-center text-slate-400 font-medium">
            Ditemukan {results.length} hasil untuk &quot;{searchTerm}&quot;
          </div>
        </div>
      )}

      {isOpen && searchTerm.length >= 2 && results.length === 0 && !isSearching && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl p-4 text-center">
          <p className="text-sm text-slate-500">Tidak ditemukan {type} dengan ID &quot;{searchTerm}&quot;</p>
          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Coba periksa kembali nomor {type} Anda</p>
        </div>
      )}
    </div>
  );
}
