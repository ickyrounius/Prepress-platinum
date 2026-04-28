import { calcLevelTC } from '@/lib/calculations';

export type KPIColor = 'indigo' | 'emerald' | 'sky' | 'blue' | 'amber' | 'rose' | 'cyan' | 'slate';

export interface KPIStyle {
  bg: string;
  text: string;
  hoverBg: string;
  lightBg: string;
  activeGlow: string;
}

export const KPI_COLOR_MAPPING: Record<string, KPIStyle> = {
  indigo: { 
    bg: 'bg-indigo-500', 
    text: 'text-indigo-500', 
    hoverBg: 'group-hover:bg-indigo-500', 
    lightBg: 'bg-indigo-50', 
    activeGlow: 'shadow-indigo-100' 
  },
  emerald: { 
    bg: 'bg-emerald-500', 
    text: 'text-emerald-500', 
    hoverBg: 'group-hover:bg-emerald-500', 
    lightBg: 'bg-emerald-50', 
    activeGlow: 'shadow-emerald-100' 
  },
  sky: { 
    bg: 'bg-sky-500', 
    text: 'text-sky-500', 
    hoverBg: 'group-hover:bg-sky-500', 
    lightBg: 'bg-sky-50', 
    activeGlow: 'shadow-sky-100' 
  },
  blue: { 
    bg: 'bg-blue-500', 
    text: 'text-blue-500', 
    hoverBg: 'group-hover:bg-blue-500', 
    lightBg: 'bg-blue-50', 
    activeGlow: 'shadow-blue-100' 
  },
  amber: { 
    bg: 'bg-amber-500', 
    text: 'text-amber-500', 
    hoverBg: 'group-hover:bg-amber-500', 
    lightBg: 'bg-amber-50', 
    activeGlow: 'shadow-amber-100' 
  },
  rose: { 
    bg: 'bg-rose-500', 
    text: 'text-rose-500', 
    hoverBg: 'group-hover:bg-rose-500', 
    lightBg: 'bg-rose-50', 
    activeGlow: 'shadow-rose-100' 
  },
  cyan: { 
    bg: 'bg-cyan-500', 
    text: 'text-cyan-500', 
    hoverBg: 'group-hover:bg-cyan-500', 
    lightBg: 'bg-cyan-50', 
    activeGlow: 'shadow-cyan-100' 
  },
  slate: { 
    bg: 'bg-slate-500', 
    text: 'text-slate-500', 
    hoverBg: 'group-hover:bg-slate-500', 
    lightBg: 'bg-slate-50', 
    activeGlow: 'shadow-slate-100' 
  },
};

export interface TCLevelInfo {
  label: string;
  color: string;
}

/** Presentation-layer wrapper around canonical calcLevelTC().
 *  Adds "EMPTY" state for near-zero TC and maps levels to CSS colors. */
const TC_LEVEL_COLORS: Record<string, string> = {
  EMPTY: 'bg-slate-400',
  RINGAN: 'bg-emerald-500',
  STANDARD: 'bg-blue-500',
  ADVANCED: 'bg-indigo-500',
  COMPLEX: 'bg-amber-500',
  CRITICAL: 'bg-rose-600',
};

export const getTCLevelInfo = (total: number): TCLevelInfo => {
  if (total <= 2) {
    return { label: 'EMPTY', color: TC_LEVEL_COLORS.EMPTY };
  }
  const label = calcLevelTC(total);
  return { label, color: TC_LEVEL_COLORS[label] || TC_LEVEL_COLORS.RINGAN };
};

export const getKPIColorClasses = (color: string): KPIStyle => {
  return KPI_COLOR_MAPPING[color] || KPI_COLOR_MAPPING.indigo;
};

