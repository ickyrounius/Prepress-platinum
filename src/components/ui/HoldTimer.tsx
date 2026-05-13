'use client';

import React, { useEffect, useState } from 'react';

interface HoldTimerProps {
  holdStartedAt: number | null | undefined;
  holdDurationHours?: number;
  holdReason?: string;
  compact?: boolean;
}

/**
 * Live countdown showing how long a job has been on HOLD.
 * Displays accumulated hold hours + live elapsed since current HOLD started.
 */
export default function HoldTimer({
  holdStartedAt,
  holdDurationHours = 0,
  holdReason,
  compact = false,
}: HoldTimerProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!holdStartedAt) return;

    const tick = () => {
      setElapsed(Date.now() - holdStartedAt);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [holdStartedAt]);

  if (!holdStartedAt && holdDurationHours <= 0) return null;

  const currentHoldHours = holdStartedAt ? elapsed / 3_600_000 : 0;
  const totalHours = holdDurationHours + currentHoldHours;

  const hrs = Math.floor(totalHours);
  const mins = Math.floor((totalHours - hrs) * 60);
  const secs = Math.floor(((totalHours - hrs) * 60 - mins) * 60);

  const timeString = hrs > 0
    ? `${hrs}h ${String(mins).padStart(2, '0')}m`
    : `${mins}m ${String(secs).padStart(2, '0')}s`;

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 text-red-400 text-xs font-mono">
        <span className="animate-pulse">⏸</span>
        {timeString}
      </span>
    );
  }

  return (
    <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-3">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <span className="animate-pulse text-red-400">⏸</span>
          <span className="text-xs font-semibold text-red-400 uppercase tracking-wide">HOLD</span>
        </div>
        <span className="text-lg font-bold font-mono text-red-300 tabular-nums">
          {timeString}
        </span>
      </div>
      {holdReason && (
        <p className="text-[11px] text-red-400/80 mt-1 italic">
          Alasan: {holdReason}
        </p>
      )}
      {holdDurationHours > 0 && holdStartedAt && (
        <p className="text-[10px] text-slate-500 mt-1">
          Akumulasi sebelumnya: {holdDurationHours.toFixed(1)}h
        </p>
      )}
    </div>
  );
}
