'use client';

import React, { useState, KeyboardEvent, useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface MultiItemInputProps {
  label: string;
  placeholder?: string;
  value: string; // Comma separated string
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  themeColor?: 'indigo' | 'pink' | 'emerald' | 'amber' | 'rose';
  required?: boolean;
}

export function MultiItemInput({
  label,
  placeholder = "Ketik lalu tekan Enter...",
  value,
  onChange,
  icon,
  themeColor = 'indigo',
  required = false
}: MultiItemInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [items, setItems] = useState<string[]>([]);

  // Sync items with the comma-separated string value
  useEffect(() => {
    if (value) {
      const splitItems = value.split(',').map(i => i.trim()).filter(Boolean);
      // Only update if different to avoid infinite loops
      if (JSON.stringify(splitItems) !== JSON.stringify(items)) {
        setItems(splitItems);
      }
    } else {
      setItems([]);
    }
  }, [value]);

  const addItem = (item: string) => {
    const trimmed = item.trim().toUpperCase();
    if (trimmed && !items.includes(trimmed)) {
      const newItems = [...items, trimmed];
      setItems(newItems);
      onChange(newItems.join(', '));
    }
    setInputValue('');
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onChange(newItems.join(', '));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
      e.preventDefault();
      addItem(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && items.length > 0) {
      removeItem(items.length - 1);
    }
  };

  const colorClasses = {
    indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600 focus-within:border-indigo-500 focus-within:ring-indigo-500/10',
    pink: 'bg-pink-50 border-pink-100 text-pink-600 focus-within:border-pink-500 focus-within:ring-pink-500/10',
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600 focus-within:border-emerald-500 focus-within:ring-emerald-500/10',
    amber: 'bg-amber-50 border-amber-100 text-amber-600 focus-within:border-amber-500 focus-within:ring-amber-500/10',
    rose: 'bg-rose-50 border-rose-100 text-rose-600 focus-within:border-rose-500 focus-within:ring-rose-500/10',
  };

  const tagClasses = {
    indigo: 'bg-indigo-600 text-white shadow-indigo-200',
    pink: 'bg-pink-600 text-white shadow-pink-200',
    emerald: 'bg-emerald-600 text-white shadow-emerald-200',
    amber: 'bg-amber-600 text-white shadow-amber-200',
    rose: 'bg-rose-600 text-white shadow-rose-200',
  };

  return (
    <div className="space-y-4">
      <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] flex items-center gap-2">
        {icon} {label}
        {required && <span className="text-rose-500 font-bold">*</span>}
      </label>

      <div className={cn(
        "min-h-[64px] sm:min-h-[80px] p-2 sm:p-3 border-2 rounded-[1.5rem] transition-all flex flex-wrap gap-2 items-center",
        colorClasses[themeColor] || colorClasses.indigo,
        "bg-slate-50/50 backdrop-blur-sm"
      )}>
        <AnimatePresence>
          {items.map((item, index) => (
            <motion.span
              key={`${item}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className={cn(
                "pl-3 pr-1.5 py-1.5 rounded-xl text-[11px] sm:text-xs font-black uppercase flex items-center gap-2 shadow-lg",
                tagClasses[themeColor] || tagClasses.indigo
              )}
            >
              {item}
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="w-5 h-5 rounded-lg bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
              >
                <X size={12} strokeWidth={4} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addItem(inputValue)}
          placeholder={items.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent border-none outline-none p-2 text-base sm:text-lg font-black placeholder:text-slate-300 min-w-[150px]"
        />
      </div>
      
      {items.length > 0 && (
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-2">
          Total: {items.length} Model Berhasil Diinput
        </p>
      )}
    </div>
  );
}
