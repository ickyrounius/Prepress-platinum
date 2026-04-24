'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/features/auth/AuthContext';
import { recordAuditLog } from '@/features/audit-log/auditLogService';
import { exportToPDF } from '@/features/report/exportPDF';
import { KanbanBoard, type KanbanItem } from '@/components/dashboard/KanbanBoard';
import StatsGrid from '@/components/dashboard/StatsGrid';
import FilterHeader from '@/components/dashboard/FilterHeader';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { useDashboardData } from '@/hooks/useDashboardData';
import type { JosTypeFilter, JopTypeFilter } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { normalizeRole } from '@/lib/accessControl';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

export default function DashboardPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'overview' | 'kanban'>('overview');

  // Redirect based on role if not Admin
  React.useEffect(() => {
    if (loading || !role) return;
    const r = normalizeRole(role);
    const ADMIN_ROLES = ["ADMIN", "DEVELOPER", "MANAGER"];
    
    if (!ADMIN_ROLES.includes(r)) {
      if (['DT', 'CAD', 'SPV DT', 'ADMIN DT'].includes(r)) router.push('/dashboard/dt');
      else if (['DG', 'DS', 'SPV DG', 'ADMIN DG'].includes(r)) router.push('/dashboard/dg');
      else if (['PRODUCTION', 'SPV PREPRESS', 'KOORDINATOR', 'OP CTP', 'OP CTCP', 'OP FLEXO', 'OP SCREEN', 'OP ETCHING', 'ADMIN PREPRESS'].includes(r)) router.push('/dashboard/prepress');
      else if (['SUPPORT DESIGN', 'GMG', 'CNC', 'BLUEPRINT'].includes(r)) router.push('/dashboard/support');
    }
  }, [role, loading, router]);

  const {
    filteredItems,
    stats,
    josTypeFilter,
    setJosTypeFilter,
    jopTypeFilter,
    setJopTypeFilter,
    dateRange,
    setDateRange,
    resetFilters,
    productivityData,
    trendData
  } = useDashboardData();

  const exportDashboardPDF = () => {
    const columns = ['ID', 'Type', 'Buyer', 'Status', 'Sub Status'];
    const rows = filteredItems.slice(0, 100).map((item) => [
      String(item.id || '-'),
      String(item.sourceType || '-'),
      String(item.buyer || '-'),
      String(item.status_workflow || item.status_dg || item.status_dt || item.ST_WORKFLOW || '-'),
      String(item.ST_PRO_JOP || '-'),
    ]);
    exportToPDF('Prepress Dashboard Report', columns, rows, `prepress-dashboard-${Date.now()}.pdf`);
    if (user?.uid) {
      void recordAuditLog({
        actorUid: user.uid,
        action: "export_pdf",
        entityType: "dashboard",
        entityId: "main_dashboard",
        metadata: { rows: rows.length, josTypeFilter, jopTypeFilter },
      });
    }
  };

  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="space-y-8 pb-12"
    >
      <FilterHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        josTypeFilter={josTypeFilter}
        onJosTypeFilterChange={setJosTypeFilter}
        jopTypeFilter={jopTypeFilter}
        onJopTypeFilterChange={setJopTypeFilter}
        onResetFilters={resetFilters}
        onExportPDF={exportDashboardPDF}
      />

      <AnimatePresence mode="wait">
        {viewMode === 'overview' ? (
          <motion.div
            key="overview"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.3 } }}
            className="space-y-8"
          >
            <StatsGrid stats={stats} />
            <DashboardCharts
              stats={stats}
              productivityData={productivityData}
              trendData={trendData}
            />
          </motion.div>
        ) : (
          <motion.div
            key="kanban"
            initial={{ opacity: 0, x: 50, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.95, transition: { duration: 0.3 } }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="pb-8"
          >
            <KanbanBoard data={filteredItems as unknown as KanbanItem[]} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
