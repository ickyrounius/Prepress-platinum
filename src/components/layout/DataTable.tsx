"use client";

import { Printer, CaretUpDown, Lightning, Warning, Circle } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { resolveWorkflowStatus } from "@/lib/workflow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
      "LAYOUT": "bg-blue-100/10 text-blue-600 border-blue-200/30 dark:text-blue-400",
      "ASSIGNED": "bg-indigo-100/10 text-indigo-600 border-indigo-200/30 dark:text-indigo-400",
      "BLUEPRINT": "bg-cyan-100/10 text-cyan-600 border-cyan-200/30 dark:text-cyan-400",
      "DONE": "bg-emerald-100/10 text-emerald-600 border-emerald-200/30 dark:text-emerald-400",
      "HOLD": "bg-amber-100/10 text-amber-600 border-amber-200/30 dark:text-amber-400",
      "CANCELLED": "bg-rose-100/10 text-rose-600 border-rose-200/30 dark:text-rose-400",
    };
    
    return (
      <Badge className={cn("text-[10px]", colors[s] || "bg-muted text-muted-foreground border-border")}>
        {s}
      </Badge>
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
        <span className="text-lg font-black text-foreground leading-none">{val || 0}</span>
        <span className={cn("text-[9px] font-bold uppercase tracking-widest mt-0.5", colorClass)}>{l}</span>
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-2xl shadow-xl shadow-slate-200/10 dark:shadow-black/20 overflow-hidden text-card-foreground font-sans">
      {/* Header / Toolbar */}
      <div className="p-4 sm:p-5 border-b border-border bg-card no-print">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
          
          <div className="flex bg-muted p-1.5 rounded-2xl w-full xl:w-fit shadow-inner">
            <button 
              onClick={() => setActiveTab("aktif")} 
              className={cn(
                "whitespace-nowrap flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-200",
                activeTab === "aktif" ? "bg-card text-primary shadow-lg dark:shadow-indigo-500/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              AKTIF
            </button>
            <button 
              onClick={() => setActiveTab("closed")} 
              className={cn(
                "whitespace-nowrap flex-1 lg:flex-none px-6 py-2.5 rounded-xl text-xs font-black transition-all duration-200",
                activeTab === "closed" ? "bg-card text-primary shadow-lg dark:shadow-indigo-500/10" : "text-muted-foreground hover:text-foreground"
              )}
            >
              CLOSED
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-row items-stretch md:items-center gap-4 w-full xl:w-auto">
            {/* Counter Badge */}
            <div className="flex items-center justify-center gap-3 bg-muted px-4 py-2 rounded-2xl border border-border shadow-sm sm:order-last md:order-none">
              <div className="flex flex-col items-center px-2">
                <span className="text-[8px] font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-tighter mb-0.5">Aktif</span>
                <span className="text-sm font-black text-primary leading-none">{totalAktif}</span>
              </div>
              <div className="h-6 w-px bg-border opacity-50"></div>
              <div className="flex flex-col items-center px-2">
                <span className="text-[8px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-tighter mb-0.5">Closed</span>
                <span className="text-sm font-black text-emerald-600 leading-none">{totalClosed}</span>
              </div>
            </div>
            
            <select 
              title="Filter PIC" 
              value={picFilter}
              onChange={(e) => setPicFilter(e.target.value)}
              className="p-3 border border-border rounded-2xl outline-none text-xs font-bold bg-muted focus:ring-4 focus:ring-primary/10 transition-all font-sans"
            >
              <option value="">Semua PIC</option>
              <option value="STB">STB - Satbi</option>
              <option value="RK">RK - Riki</option>
              <option value="ARK">ARK - Arik</option>
              <option value="MER">MER - Mer</option>
            </select>
            
            <Input
              type="text" 
              placeholder="Cari JOP/Buyer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 h-auto p-3 pl-4 rounded-2xl text-xs font-medium focus:ring-4 focus:ring-primary/10 bg-muted transition-all shadow-inner border-none"
            />

            <div className="flex gap-2 sm:col-span-2 md:col-span-1">
              <Button
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
                variant="secondary"
                className="flex-1 h-auto bg-primary/10 text-primary px-4 py-3 rounded-2xl text-[10px] sm:text-xs font-black border border-primary/20 hover:bg-primary/20"
              >
                EXPORT CSV
              </Button>
              
              <Button onClick={() => window.print()} className="flex-1 h-auto bg-foreground text-background px-4 py-3 rounded-2xl text-[10px] sm:text-xs font-black hover:opacity-90 shadow-lg dark:shadow-indigo-500/10">
                <Printer weight="bold" size={16} className="hidden sm:inline" /> PRINT
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar relative">
        <table className="w-full text-left min-w-[1000px] border-separate border-spacing-0">
          <thead className="bg-muted/50 backdrop-blur-md sticky top-0 z-20">
            <tr>
              {columns.map((col) => (
                <th 
                   key={col.key} 
                  onClick={() => onSort && onSort(col.key)}
                  className="px-6 py-5 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{col.label}</span>
                    <CaretUpDown weight="bold" size={12} className="text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-20 text-center text-muted-foreground italic font-medium bg-card">
                  Belum ada data pengerjaan...
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="hover:bg-primary/5 transition-colors group bg-card">
                  {columns.map((col) => {
                    const val = row[col.key];
                    
                    if (col.key === 'id_jop') return (
                      <td key={col.key} className="px-6 py-4 border-b border-border align-middle">
                        <span className="text-primary font-bold hover:underline cursor-pointer transition-all">{val}</span>
                      </td>
                    );

                    if (col.key === 'informasi_jop') return (
                      <td key={col.key} className="px-6 py-4 border-b border-border">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-black text-foreground tracking-tight">{row.NO_JOP}</span>
                          <span className="text-[10px] text-muted-foreground font-medium whitespace-nowrap">JOS: {row.NO_JOS || "-"}</span>
                          <span className="text-[9px] text-muted-foreground/70 font-bold uppercase mt-0.5">Masuk: {row.TGL_MASUK || "-"}</span>
                        </div>
                      </td>
                    );

                    if (col.key === 'buyer_nama') return (
                      <td key={col.key} className="px-6 py-4 border-b border-border">
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-foreground/90 uppercase tracking-tight">{row.BUYER || "-"}</span>
                          <span className="text-[10px] text-muted-foreground line-clamp-1">{row.NAMA_JOP || "-"}</span>
                        </div>
                      </td>
                    );

                    if (col.key === 'target_tipe') return (
                      <td key={col.key} className="px-6 py-4 border-b border-border">
                        <div className="flex flex-col gap-1">
                          {/* Urgent Logic */}
                          {row.DP >= 5 && (
                            <div className="flex items-center gap-1 text-rose-500 animate-pulse">
                              <Lightning weight="fill" size={10} />
                              <span className="text-[9px] font-black uppercase">URGENT</span>
                            </div>
                          )}
                          {/* Overdue Logic */}
                          {row.ST_PRO_JOP !== 'Done' && row.TGL_TARGET && new Date(row.TGL_TARGET) < new Date() && (
                            <div className="flex items-center gap-1 text-orange-500">
                              <Warning weight="fill" size={10} />
                              <span className="text-[9px] font-black uppercase tracking-tighter">OVERDUE</span>
                            </div>
                          )}
                          <span className={cn("text-xs font-black", row.DP >= 5 ? "text-rose-600" : "text-foreground")}>{row.TGL_TARGET || "-"}</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{row.TIPE_JOP || "LOKAL"}</span>
                        </div>
                      </td>
                    );

                    if (col.key === 'pic_progress') return (
                      <td key={col.key} className="px-6 py-4 border-b border-border">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                             <Circle weight="fill" size={8} className={cn(row.ST_PRO_JOP === 'On Process' ? "text-primary animate-pulse" : "text-muted-foreground/30")} />
                             <span className="font-black text-foreground/80">{row.PIC_UTAMA || "STB"}</span>
                          </div>
                          <span className="text-[9px] font-bold uppercase text-muted-foreground tracking-tight">{row.ST_PRO_JOP || "Not Started"}</span>
                        </div>
                      </td>
                    );

                    if (col.key === 'tc_level') return (
                      <td key={col.key} className="px-6 py-4 border-b border-border text-center">
                        {getTCLevel(row.TOTAL_TC, row.LEVEL_TC)}
                      </td>
                    );

                    if (col.key === 'status') return (
                      <td key={col.key} className="px-6 py-4 border-b border-border align-middle">
                        {getStatusBadge(resolveWorkflowStatus(row as Record<string, unknown>, "DT"))}
                      </td>
                    );

                    return (
                      <td key={col.key} className="px-6 py-4 border-b border-border align-top">
                        <span className="text-xs font-medium text-muted-foreground">{val || "-"}</span>
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
