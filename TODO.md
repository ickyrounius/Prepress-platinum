You are a senior software architect specialized in:

* Printing industry workflow
* Design & Prepress management systems
* Firebase architecture
* Firestore optimization
* Realtime production dashboards
* KPI systems
* MIS / MES workflow
* ISO 12647-aware prepress workflow

Your task is to refactor, redesign, and improve my existing project:
“Prepress-platinum”

==================================================
PRIMARY SYSTEM PHILOSOPHY
=========================

This system is NOT ERP.

This is a lightweight operational control system for:

* Design Graphic (DG)
* Design Technical (DT)
* Support Design (SD)
* Prepress

The system must prioritize:

1. Operational speed
2. Workflow clarity
3. Low human error
4. Revision safety
5. Approval safety
6. Lightweight architecture
7. Low Firebase cost
8. Easy maintenance
9. Fast onboarding for operators
10. Production visibility

The system must feel:

* fast
* simple
* keyboard-friendly
* operator-focused
* low-click
* responsive
* easy to understand

Avoid overengineering.

==================================================
IMPORTANT CONSTRAINTS
=====================

Must remain compatible with:

* Firebase Spark Plan

Optimize aggressively for:

* low Firestore reads
* low writes
* low storage usage
* low bandwidth
* minimal realtime usage

DO NOT USE:

* microservices
* event sourcing
* CQRS
* GraphQL
* Redux
* heavy analytics pipelines
* websocket servers
* AI-heavy systems
* complex workflow engines
* repository pattern over-abstraction
* unnecessary clean architecture layers

Keep architecture:

* modular
* maintainable
* realistic
* production-ready
* simple

==================================================
EXPECTED SYSTEM SCALE
=====================

Expected usage:

* 20–80 active users
* <30 concurrent users
* 500–3000 jobs/month
* Internal company usage only
* Mostly LAN/WiFi environment
* File uploads mostly:

  * PDF
  * AI
  * CDR
  * TIFF
  * JPG

Realtime requirements are lightweight.

==================================================
DEPARTMENT STRUCTURE
====================

Departments:

1. Design Graphic (DG)

2. Design Technical (DT)

3. Support Design (SD)

   * GMG
   * CNC
   * Blueprint
   * QC

     * QC-DG
     * QC-DT

4. Prepress (PP)

   * CTP
   * CTCP
   * FLEXO
   * ETCHING
   * SCREEN

==================================================
SYSTEM STACK
============

Use:

Frontend:

* Next.js (App Router)
* TypeScript
* TailwindCSS

State:

* Zustand

Backend:

* Firebase Auth
* Firestore
* Firebase RTDB
* Firebase Storage

Architecture rules:

* Firestore = transactional/business data
* RTDB = lightweight realtime presence only
* Storage = uploaded production files

==================================================
WORKFLOW ENGINE
===============

Implement lightweight workflow state machine.

Statuses:

* WAITING
* IN_PROGRESS
* REVISION
* CHECKING
* APPROVED
* OUTPUT
* DONE
* HOLD

Workflow characteristics:

* Jobs move sequentially between departments.
* Revision may return to previous department.
* QC may reject output.
* HOLD pauses production timer.
* HOLD duration must NOT affect KPI.
* Deadline tracking excludes HOLD duration.
* Revision history must be preserved permanently.

==================================================
JOB REQUIREMENTS
================

Each job must contain:

* createdAt
* updatedAt
* deadline
* operator
* assignedTo
* department
* revisionNumber
* priority
* status
* approvalStatus
* holdDuration
* activeDuration

==================================================
FIRESTORE ARCHITECTURE
======================

Create scalable Firestore schema.

Collections:

* users/
* jobs/
* job_logs/
* revisions/
* approvals/
* reports/
* daily_kpi/
* customers/
* departments/
* templates/
* profiles/

==================================================
FIRESTORE OPTIMIZATION RULES
============================

IMPORTANT:
Must stay within Firebase Spark Plan limits.

Rules:

* Never query entire collections.
* Always use indexed queries.
* Always paginate lists.
* Avoid large realtime listeners.
* Avoid document bloat.
* Avoid infinitely growing arrays.
* Use subcollections carefully.
* Avoid N+1 reads.
* Avoid client-side aggregation.
* Avoid unnecessary snapshots.
* Use batched writes when appropriate.
* Prefer summary documents over expensive aggregation.

==================================================
JOB DOCUMENT STRUCTURE
======================

jobs/{jobId}

Fields:

* jobNumber
* customerName
* productName
* category
* department
* assignedTo
* status
* priority
* deadline
* createdAt
* updatedAt
* revisionCount
* currentRevision
* approvalRequired
* approvalStatus
* outputType
* paperType
* colorProfile
* printMethod
* notes
* tags
* searchable
* activeDuration
* holdDuration

==================================================
REVISION TRACKING SYSTEM
========================

Implement robust revision architecture.

revisions/{revisionId}

Fields:

* jobId
* revisionNumber
* changedBy
* reason
* changedAt
* fileVersion
* notes

Revision format:

* R0
* R1
* R2
* FINAL

Requirements:

* Never overwrite revision history.
* Revisions must be traceable.
* Support rollback visibility.
* Track revision causes.

==================================================
APPROVAL SYSTEM
===============

Implement lightweight approval flow.

Flow:

Designer
↓
SPV
↓
Ready Output

Approval fields:

* approvedBy
* approvedAt
* rejectedReason
* approvalStatus

Requirements:

* Approval history must be logged.
* Rejection must return workflow safely.
* Approval must support audit trail.

==================================================
REALTIME STRATEGY
=================

Use Firebase RTDB ONLY for:

* active users
* online presence
* currently editing
* live queue counters
* lightweight dashboard counters

DO NOT STORE:

* production history
* revision history
* approvals
* KPI records

==================================================
RTDB STRUCTURE
==============

presence/
queue/
activeJobs/
dashboardCounters/

==================================================
KPI SYSTEM
==========

Create lightweight KPI architecture.

Per-user metrics:

* completedJobs
* overdueJobs
* revisionJobs
* avgCompletionTime
* activeJobs
* approvalCount

Generate:

* daily
* weekly
* monthly

IMPORTANT KPI RULES:

* HOLD duration excluded from KPI.
* Revision count affects productivity score.
* Approval waiting tracked separately.
* Overdue calculated from active production duration.
* KPI summaries precalculated on write.
* Avoid aggregate queries.

Use:
daily_kpi/{date_userId}

==================================================
DASHBOARD REQUIREMENTS
======================

Dashboard must prioritize operations.

Widgets:

* waiting jobs
* urgent jobs
* overdue jobs
* revision jobs
* approved jobs
* operator workload
* department queue
* live counters

Requirements:

* lazy loading
* pagination
* memoization
* selective listeners
* minimal reads
* responsive tables
* fast filtering

==================================================
SEARCH SYSTEM
=============

Implement lightweight indexed search.

Filter by:

* customer
* operator
* status
* priority
* deadline
* revision
* department

Search requirements:

* prefix search only
* indexed fields only
* normalized searchable fields
* no full collection scans
* no external search engine

==================================================
FILE MANAGEMENT
===============

Use Firebase Storage.

Structure:

/jobs/{jobId}/design/
/jobs/{jobId}/prepress/
/jobs/{jobId}/proof/
/jobs/{jobId}/approved/

Requirements:

* Never overwrite files.
* Use versioned filenames.
* Store lightweight metadata only in Firestore.
* Avoid duplicate uploads.

==================================================
PREPRESS CHECKLIST
==================

Implement output checklist.

Fields:

* bleedChecked
* overprintChecked
* dpiChecked
* barcodeChecked
* trappingChecked
* profileChecked
* fontChecked

Requirements:

* Output blocked until checklist complete.
* QC approval required before OUTPUT.
* Checklist history logged.

==================================================
COLOR MANAGEMENT
================

Keep color management lightweight.

Support:

* FOGRA51
* FOGRA52

Store:

* paperType
* outputProfile
* printMethod

DO NOT:

* build ICC engine
* build RIP system
* implement complex color conversion

==================================================
AUDIT LOG SYSTEM
================

Create audit logging.

job_logs/{logId}

Fields:

* jobId
* userId
* action
* oldValue
* newValue
* timestamp

Requirements:

* Lightweight logs only.
* Important workflow changes only.
* Trace approvals and revisions.

==================================================
SECURITY
========

Implement granular RBAC.

Roles:

* admin
* spv
* designer
* prepress
* qc

Requirements:

* Department-based permissions
* Minimal rule complexity
* Secure Storage access
* Firestore rules optimized for Spark Plan

==================================================
CACHE & STATE STRATEGY
======================

Use Zustand carefully.

Requirements:

* cache active dashboard data
* avoid unnecessary refetch
* debounce filters
* lightweight persistence
* optimistic UI only where safe
* separate UI state from server state

==================================================
UI/UX REQUIREMENTS
==================

Optimize for production operators.

Requirements:

* minimal clicks
* keyboard shortcuts
* production-focused UI
* clear status colors
* responsive tables
* compact layout
* fast search
* low training complexity

==================================================
PERFORMANCE OPTIMIZATION
========================

Aggressively optimize:

* Firestore reads
* Firestore writes
* indexes
* listeners
* dashboard queries
* image loading
* pagination
* caching

Use:

* batched writes
* server pagination
* memoization
* selective listeners
* indexed queries
* cached Zustand state

==================================================
DELIVERABLES
============

Generate:

1. Complete Firestore schema
2. RTDB schema
3. Recommended Firestore indexes
4. Next.js folder structure
5. Zustand store architecture
6. Dashboard architecture
7. KPI aggregation strategy
8. Security rules
9. Realtime strategy
10. Search strategy
11. File upload strategy
12. Revision tracking architecture
13. Approval workflow
14. Production board design
15. Spark Plan optimization checklist
16. Recommended query patterns
17. Recommended listener strategy
18. Department workflow mapping
19. HOLD timer logic
20. Lightweight audit architecture

IMPORTANT:
Keep everything:

* realistic
* maintainable
* lightweight
* production-ready
* Spark Plan optimized
* suitable for real printing production environments.
