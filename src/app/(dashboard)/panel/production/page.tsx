'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Printer, 
  Selection, 
  BoundingBox, 
  Circuitry, 
  MonitorPlay 
} from '@phosphor-icons/react';

const departments = [
  { name: 'CTCP', href: '/panel/production/ctcp', icon: Printer, color: 'indigo' },
  { name: 'CTP', href: '/panel/production/ctp', icon: Selection, color: 'emerald' },
  { name: 'FLEXO', href: '/panel/production/flexo', icon: BoundingBox, color: 'amber' },
  { name: 'ETCHING', href: '/panel/production/etching', icon: Circuitry, color: 'rose' },
  { name: 'SCREEN', href: '/panel/production/screen', icon: MonitorPlay, color: 'sky' },
];

export default function ProductionPanelPage() {
  return (
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Production Panels</h1>
        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Select department for production input</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept, i) => (
          <Link key={dept.name} href={dept.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-6 hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white bg-${dept.color}-500 shadow-lg shadow-${dept.color}-100 group-hover:scale-110 transition-transform`}>
                <dept.icon weight="bold" size={40} />
              </div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-widest">{dept.name}</h2>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
