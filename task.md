# Prepress Platinum — Refactor Task List

## Phase 1: Foundation (Schema & Types)
- [/] Update `src/lib/types/index.ts` — full canonical types
- [ ] Update `src/lib/types/schema.ts` — Zod/plain schema constants
- [/] Update `src/lib/workflow.ts` — canonical status enum + state machine
- [ ] Update `firestore.rules` — add revisions, approvals, dept_summary
- [ ] Update `firestore.indexes.json` — add missing indexes
- [ ] Update `database.rules.json` — remove dashboardCounters, tighten

## Phase 2: Services
- [ ] Create `src/features/job/revisionService.ts`
- [ ] Create `src/features/job/approvalService.ts`
- [ ] Update `src/features/job/jobService.ts` — batched write + dept_summary update
- [ ] Update `src/features/workflow/workflowService.ts` — use state machine
- [ ] Update `src/features/job/checklistService.ts` — block output until complete

## Phase 3: State
- [ ] Update `src/lib/store/useJobStore.ts` — pagination cursor
- [ ] Create `src/lib/store/useDeptSummaryStore.ts`
- [ ] Update `src/lib/store/useUIStore.ts` — filter + search state

## Phase 4: Hooks
- [ ] Split `src/hooks/useDashboardData.ts` → smaller hooks
- [ ] Create `src/hooks/useJobDetail.ts`
- [ ] Create `src/hooks/useApprovals.ts`
- [ ] Create `src/hooks/useRevisions.ts`
- [ ] Update `src/hooks/useDashboardCounters.ts` — read from dept_summary

## Phase 5: UI
- [ ] Update dashboard page — use dept_summary counters
- [ ] Add RevisionForm component
- [ ] Add ApprovalPanel component
- [ ] Add PrepressChecklist component (block OUTPUT)
- [ ] Add HOLD timer display on job detail

## Phase 6: Deploy & Verify
- [ ] Deploy updated Firestore rules
- [ ] Deploy updated indexes
- [ ] Run typecheck (`npm run lint`)
- [ ] Manual smoke test (create job → HOLD → approve → done)
