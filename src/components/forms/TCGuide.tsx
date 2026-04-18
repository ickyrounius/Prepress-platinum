import React from 'react';
import { Info } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

export function TCGuide() {
  return (
    <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xs font-black text-slate-800 mb-6 flex items-center gap-2 uppercase tracking-widest">
        <Info weight="bold" className="text-indigo-500" /> Panduan Pengisian TC (KT, RP, BS, CAD, LA)
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-8">
        {[
          { id: 'KT', title: 'Template/Design', color: 'bg-indigo-600', items: ['Ada template', 'Ada template, perlu cek design', 'Cek template dan perlu cek design', 'Buat template', 'Tidak bisa dibuat template'] },
          { id: 'RP', title: 'Finishing', color: 'bg-emerald-600', items: ['Tanpa finishing', 'Finishing 1', 'Finishing 2', 'Finishing 3', 'Finishing >= 4'] },
          { id: 'BS', title: 'Jumlah Design', color: 'bg-amber-600', items: ['Design = 1', 'Design = 2-3', 'Design = 4-5', 'Design = 6-7', 'Design >= 8'] },
          { id: 'CAD', title: 'Diecut', color: 'bg-rose-600', items: ['Sederhana: box/persegi/lingkaran, minim cut+crease', 'Menengah: bentuk gabungan + radius/fillet + notch', 'Kompleks: custom contour, banyak cut+crease, presisi tinggi', 'Sangat Kompleks: pop-up/kurva spline/lubang interior rapat', 'Extreme: detail mikro, nesting, kiss-cut, bentuk 3D flatten'] },
          { id: 'LA', title: 'Loop Approval', color: 'bg-slate-900', items: ['Direct approval: alur satu arah, revisi minor langsung final', 'Standard loop: bertahap, maksimal 2 putaran revisi', 'Cross-department: validasi lintas tim + cek teknis cetak', 'Multi-stage validation: konsep, mock-up, prototype, final', 'High-stake loop: iterasi strategis/teknis sampai zero-error'] },
        ].map((guide) => (
          <div key={guide.id} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-50 pb-2">
              <span className={cn('text-white text-[9px] font-black px-2 py-0.5 rounded shadow-sm', guide.color)}>{guide.id}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{guide.title}</span>
            </div>
            <ul className="space-y-1.5">
              {guide.items.map((item, i) => (
                <li key={item} className="flex gap-2 text-[10px] text-slate-500 font-medium">
                  <b className="text-slate-300 w-4">{i + 1}:</b> <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
