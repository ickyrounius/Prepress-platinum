"use client";

import { useAuth } from "@/features/auth/AuthContext";
import { format } from "date-fns";
import { Clock, User } from "lucide-react";
import React from "react";

interface FormLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
}

export default function FormLayout({ title, description, children, onSubmit, loading }: FormLayoutProps) {
  const { user } = useAuth();
  const timeNow = format(new Date(), "yyyy-MM-dd HH:mm:ss");

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-slide-up">
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-secondary/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-5">
          {children}

          <div className="pt-4 border-t border-border mt-6">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs text-muted-foreground bg-secondary/30 p-3 rounded-lg border border-border/50">
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5" />
                <span>Operator: {user?.displayName || user?.email || "Unknown"} (Auto-recorded)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                <span>Timestamp: {timeNow} (Auto-recorded)</span>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button 
                type="submit" 
                disabled={loading}
                className="bg-primary text-primary-foreground font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-70 w-full sm:w-auto"
              >
                {loading ? "Menyimpan data..." : "Simpan Data"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
