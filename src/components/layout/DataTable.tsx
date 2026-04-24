"use client";

import { Printer, CaretUpDown, Lightning, Warning, Circle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// eslint-disable-next-line
type DataRow = Record<string, any>;

interface DataTableProps<T extends DataRow = DataRow> {
  data: T[];
  columns: { key: string; label: string }[];
  onSort?: (key: string) => void;
  activeTab: "aktif" | "closed";
  setActiveTab: (tab: "aktif" | "closed") => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  picFilter: string;
  setPicFilter: (pic: string) => void;
  totalAktif: number;
  totalClosed: number;
}

export default function DataTable<T extends DataRow = DataRow>({ 
  data, columns, onSort, 
  activeTab, setActiveTab, 
  searchTerm, setSearchTerm,
  picFilter, setPicFilter,
  totalAktif, totalClosed
}: DataTableProps<T>) {

  // Helper for Status Badge Styling
  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase() || "PENDING";
    const colors: Record<string, string> = {
      "LAYOUT": "bg-blue-100 text-blue-700 border-blue-200",
      "ASSIGNED": "bg-indigo-100 text-indigo-700 border-indigo-200",
      "BLUEPRINT": "bg-cyan-100 text-cyan-700 border-cyan-200",
      "DONE": "bg-emerald-100 text-emerald-700 border-emerald-200",
      "HOLD": "bg-amber-100 text-amber-700 border-amber-200",
      "CANCELLED": "bg-rose-100 text-rose-700 border-rose-200",
    };
    
    return (
      <span className={cn(
        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
        colors[s] || "bg-slate-100 text-slate-600 border-slate-200"
      )}>
        {s}
      </span>
    );
  };

  // Helper for TC Level Styling
  const getTCLevel = (val: number, level: string) => {
    const l = level?.toUpperCase() || "RINGAN";
    const colorClass = {
      "CRITICAL": "text-rose-600",
      "COMPLEX": "text-orange-600",
      "ADVANCED": "text-indigo-600",
      "STANDARD": "text-blue-600",
      "RINGAN": "text-emerald-600",
    }[l] || "text-slate-600";

    return (
      <div className="flex flex-col items-center">
        <span className="text-lg font-black text-slate-800 leading-none">{val || 0}</span>
        <span className={cn("text-[9px] font-bold uppercase tracking-widest mt-0.5", colorClass)}>{l}</span>
      </div>
    );
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden text-slate-700 font-sans">
      {/* Header / Toolbar */}
      <div className="p-4 sm:p-5 border-b bg-white no-print">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          
          <div className="flex bg-slate-100 p-1.5 rounded-2xl w-full xl:w-fit shadow-inner">
            <button 
              onClick={() => setActiveTab("aktif")} 
              className={cn(
                "whitespace-nowrap flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-200",
                activeTab === "aktif" ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              AKTIF
            </button>
            <button 
              onClick={() => setActiveTab("closed")} 
              className={cn(
                "whitespace-nowrap flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-200",
                activeTab === "closed" ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100" : "text-slate-400 hover:text-slate-600"
              )}
            >
              CLOSED
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
            {/* Counter Badge */}
            <div className="flex items-center justify-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/60 shadow-sm sm:order-last md:order-none">
              <div className="flex flex-col items-center px-2">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter mb-0.5">Aktif</span>
                <span className="text-sm font-black text-indigo-600 leading-none">{totalAktif}</span>
              </div>
              <div className="h-6 w-px bg-slate-300 opacity-50"></div>
              <div className="flex flex-col items-center px-2">
                <span className="text-[8px] font-black text-emerald-400 uppercase tracking-tighter mb-0.5">Closed</span>
                <span className="text-sm font-black text-emerald-600 leading-none">{totalClosed}</span>
              </div>
            </div>
            
            <select 
              title="Filter PIC" 
              value={picFilter}
              onChange={(e) => setPicFilter(e.target.value)}
              className="p-3 border border-slate-200 rounded-2xl outline-none text-xs font-bold bg-slate-50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans"
            >
              <option value="">Semua PIC</option>
              <option value="STB">STB - Satbi</option>
              <option value="RK">RK - Riki</option>
              <option value="ARK">ARK - Arik</option>
              <option value="MER">MER - Mer</option>
            </select>
            
            <input 
              type="text" 
              placeholder="Cari JOP/Buyer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 p-3 pl-4 border border-slate-200 rounded-2xl outline-none text-xs font-medium focus:ring-4 focus:ring-indigo-500/10 bg-slate-50 transition-all shadow-inner"
            />

            <div className="flex gap-2 sm:col-span-2 md:col-span-1">
              <button 
                onClick={() => {
                  const csvData = data.map(item => columns.map(col => `"${item[col.key] || ''}"`).join(',')).join('\n');
                  const header = columns.map(col => `"${col.label}"`).join(',');
                  const blob = new Blob([`${header}\n${csvData}`], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `Prepress_Data_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                className="flex-1 bg-indigo-50 text-indigo-600 px-4 py-3 rounded-2xl text-[10px] sm:text-xs font-black flex items-center justify-center gap-2 transition hover:bg-indigo-100 active:scale-95 border border-indigo-100"
              >
                EXPORT CSV
              </button>
              
              <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white px-4 py-3 rounded-2xl text-[10px] sm:text-xs font-black flex items-center justify-center gap-2 transition hover:bg-slate-800 active:scale-95 shadow-lg shadow-slate-200">
                <Printer weight="bold" size={16} className="hidden sm:inline" /> PRINT
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar relative">
        <table className="w-full text-left min-w-[1000px] border-separate border-spacing-0">
          <thead className="bg-slate-50/50 backdrop-blur-md sticky top-0 z-20">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  onClick={() => onSort && onSort(col.key)}
                  className="px-6 py-5 border-b border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{col.label}</span>
                    <CaretUpDown weight="bold" size={12} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center text-slate-300 italic font-medium bg-white">
                  Belum ada data pengerjaan...
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-indigo-50/30 transition-colors group bg-white">
                  {columns.map((col) => {
                    const val = row[col.key];
                    
                    if (col.key === 'id_jop') return (
                      <td key={col.key} className="px-6 py-4 border-b border-slate-50 align-middle">
                        <span className="text-indigo-600 font-bold hover:underline cursor-pointer transition-all">{val}</span>
                      </td>
                    );

                    if (col.key === 'informasi_jop') return (
                      <td key={col.key} className="px-6 py-4 border-b border-slate-50">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-black text-slate-800 tracking-tight">{row.NO_JOP}</span>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">JOS: {row.NO_JOS || "-"}</span>
                          <span className="text-[9px] text-slate-300 font-bold uppercase mt-0.5">Masuk: {row.TGL_MASUK || "-"}</span>
                        </div>
                      </td>
                    );

                    if (col.key === 'buyer_nama') return (
                      <td key={col.key} className="px-6 py-4 border-b border-slate-50">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{row.BUYER || "-"}</span>
                          <span className="text-[10px] text-slate-400 line-clamp-1">{row.NAMA_JOP || "-"}</span>
                        </div>
                      </td>
                    );

                    if (col.key === 'target_tipe') return (
                      <td key={col.key} className="px-6 py-4 border-b border-slate-50">
                        <div className="flex flex-col gap-1">
                          {/* Urgent Logic */}
                          {row.DP >= 5 && (
                            <div className="flex items-center gap-1 text-rose-600 animate-pulse">
                              <Lightning weight="fill" size={10} />
                              <span className="text-[9px] font-black uppercase">URGENT</span>
                            </div>
                          )}
                          {/* Overdue Logic */}
                          {row.ST_PRO_JOP !== 'Done' && row.TGL_TARGET && new Date(row.TGL_TARGET) < new Date() && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <Warning weight="fill" size={10} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">OVERDUE</span>
                            </div>
                          )}
                          <span className={cn("text-xs font-black", row.DP >= 5 ? "text-rose-700" : "text-slate-700")}>{row.TGL_TARGET || "-"}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{row.TIPE_JOP || "LOKAL"}</span>
                        </div>
                      </td>
                    );

                    if (col.key === 'pic_progress') return (
                      <td key={col.key} className="px-6 py-4 border-b border-slate-50">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <Circle weight="fill" size={8} className={cn(row.ST_PRO_JOP === 'On Process' ? "text-indigo-500 animate-pulse" : "text-slate-300")} />
                             <span className="font-black text-slate-700">{row.PIC_UTAMA || "STB"}</span>
                          </div>
                          <span className="text-[9px] font-bold uppercase text-slate-400 tracking-tight">{row.ST_PRO_JOP || "Not Started"}</span>
                        </div>
                      </td>
                    );

                    if (col.key === 'tc_level') return (
                      <td key={col.key} className="px-6 py-4 border-b border-slate-50 text-center">
                        {getTCLevel(row.TOTAL_TC, row.LEVEL_TC)}
                      </td>
                    );

                    if (col.key === 'status') return (
                      <td key={col.key} className="px-6 py-4 border-b border-slate-50 align-middle">
                        {getStatusBadge(row.ST_WORKFLOW)}
                      </td>
                    );

                    return (
                      <td key={col.key} className="px-6 py-4 border-b border-slate-50 align-top">
                        <span className="text-xs font-medium text-slate-500">{val || "-"}</span>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
