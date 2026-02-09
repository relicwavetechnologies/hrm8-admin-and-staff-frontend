# HRM8 Admin Workflow Audit - Agent Guide

> 🚨 **CRITICAL REMINDER**: This file MUST be updated after completing ANY task. Check off completed items, add new findings. Keep synchronized with [progress.md](./progress.md).

---

## Overview

This is a **living document** to guide agents through auditing and fixing the HRM8 Admin Workflow. 

**Your job**: Pick ONE area from [progress.md](./progress.md), audit it, fix issues, test it, and mark it complete.

---

## 🚨 CRITICAL: Casing & Cross-Frontend Validation

**Our ecosystem has inconsistent casing that somehow works:**

- **Database (Prisma)**: `snake_case` (e.g., `created_at`, `region_id`)
- **Backend (API responses)**: Mix of `snake_case` and `camelCase`
- **3 Frontends**: Expect `camelCase` in many places

### **MANDATORY Workflow When Changing Backend:**

1. **Before editing backend**: Note the endpoint path and response structure
2. **Search ALL 3 frontends** for API usage:
   ```bash
   # Search for endpoint usage
   grep -r "/hrm8/settlements" hrm8-admin-staff/src
   grep -r "/hrm8/settlements" hrm8-ats/src
   grep -r "/hrm8/settlements" hrm8-candidate/src
   ```
3. **Check response field names** - if you change `settlement_date` → `settlementDate`, search for `.settlement_date` usage
4. **Fix ALL frontends immediately** to match new structure
5. **Test each frontend** - verify API calls still work
6. **Never leave frontends broken** - this is non-negotiable

**Example Casing Issues Seen:**
- Settlement API returned `snake_case` but frontend expected `camelCase`
- Commission fields had mixed casing
- Analytics endpoints had inconsistent transformations

---

## Project Structure

```
hrm8-new/
├── backend-template/           # Node.js/Express + Prisma
│   ├── src/modules/hrm8/      # HRM8 admin controllers
│   └── prisma/schema.prisma   # Database schema
├── hrm8-admin-staff/          # Main admin UI (React/TS)
├── hrm8-ats/                  # Employer/recruiter UI
└── hrm8-candidate/            # Candidate portal
```

---

## How to Proceed

### 1. Pick Your Task

Open [progress.md](./progress.md) and pick ONE area:

- **Start with**: 🔴 High priority bugs (access control, FK issue, pagination)
- **Then**: 🟡 Missing features (pricing, disputes, invites)
- **Finally**: 🟢 Enhancements (analytics, audit logs, integrations)

### 2. Audit the Area

For your chosen area, verify:

**Database**:
- Models exist with correct fields
- Relationships are defined
- Check `backend-template/prisma/schema.prisma`

**Backend**:
- Controller exists in `backend-template/src/modules/hrm8/`
- Service implements logic
- Routes are registered
- DTOs handle validation

**Frontend (ALL 3)**:
- Pages/components exist in `hrm8-admin-staff/src/pages/hrm8/`
- Check if `hrm8-ats` or `hrm8-candidate` use the same APIs
- API services call correct endpoints
- State management works

**Casing Check**:
- Database uses `snake_case`
- Backend transforms to `camelCase` (or should)
- Frontends expect `camelCase`

### 3. Fix Issues

**For bugs**:
1. Identify root cause
2. Fix in backend and/or frontend
3. Search ALL frontends for impact
4. Test the fix

**For missing features**:
1. Implement backend first (controller → service → repository)
2. Add/update frontend UI
3. Test end-to-end flow
4. Add to relevant frontend(s)

**For casing fixes**:
1. Decide on standard (prefer `camelCase` in APIs)
2. Update backend to transform `snake_case` → `camelCase`
3. Search and fix ALL frontend usage
4. Test all affected pages

### 4. Test Thoroughly

- **Backend**: Test endpoint with Postman/curl
- **Database**: Verify data structure
- **Frontend**: Load page, test actions
- **Cross-check**: Ensure no other frontend broke

### 5. Update Documentation

**MANDATORY after every task**:

1. Update [progress.md](./progress.md):
   - Change status (⏳ → 🔨 → ✅)
   - Update timestamp
   - Mark checklist items complete
   - Update Summary Statistics

2. Update this file (plan.md):
   - Check off completed items below
   - Add new findings

---

## Audit Checklist by Area

### 🔴 High Priority - Fix These First

- [x] **1. Settlements Access Control** (Area 1, 9) - ✅ **RESOLVED**
  - Issue: RoleGuard blocking admin access
  - Status: Route properly guarded (ADMIN + GLOBAL_ADMIN), backend secured with authenticateHrm8
  - Files: `RoleGuard.tsx`, settlement routes, `hrm8.routes.ts`
  - Frontends: `hrm8-admin-staff` (others may use settlements API)

- [x] **2. Consultant-Licensee FK Constraint** (Area 2) - ✅ **RESOLVED**
  - Issue: FK violation when deleting licensees with settlement history
  - Status: Added `onDelete: Restrict` to Settlement FK + validation in delete method
  - Files: `schema.prisma`, `regional-licensee.service.ts`
  - Frontends: `hrm8-admin-staff`

- [x] **3. Job Allocation Pagination** (Area 4) - ✅ **RESOLVED**
  - Issue: Filter parameter mismatch (companySearch vs company)
  - Status: Fixed parameter naming to match backend API
  - Files: `JobAllocationPage.tsx`
  - Frontend: `hrm8-admin-staff`

### 🟡 Medium Priority - Partial Implementations

- [x] **4. Pricing Service Stub** (Area 6) - ✅ **RESOLVED**
  - Frontend PricingPage: Full CRUD for products, price books, tiers, promo codes
  - Region filter populated from API
  - API success/error handling added
  - Frontend: `hrm8-admin-staff`

- [x] **5. Staff Invite Flow** (Area 3) - ✅ **PARTIAL**
  - Done: Uses env.FRONTEND_URL + generateInvitationToken(); ConsultantSetupAccountPage + route `/consultant/setup-account` added
  - Pending: Email sending on invite (optional/future)
  - Files: `staff.controller.ts`, `ConsultantSetupAccountPage.tsx`

- [ ] **6. Commission Dispute Resolution** (Area 7) - Future (backend endpoints needed)
  - Add: Dispute endpoints
  - Build: Dispute workflow UI
  - Frontend CommissionsPage: Production-ready (API handling, Hrm8PageLayout, TableSkeleton)

- [ ] **7. Company Custom Pricing UI** (Area 6) - Future
  - Build: Override UI in company detail page
  - Backend: May already have logic, verify
  - Frontends: `hrm8-admin-staff`, `hrm8-ats`

### 🟢 Low Priority - Enhancements

- [x] **8. Integration Health Monitoring** (Area 10) - Frontend ready
  - Hrm8IntegrationsPage: Defensive array handling, error fallbacks
  - Future: Health check endpoints + status indicators when backend supports

- [ ] **9. Audit Log Coverage** (Area 14)
  - Add: Audit middleware to more endpoints
  - Ensure: All write actions logged
  - Files: Across all controllers

- [x] **10. Analytics Validation** (Area 13)
  - AnalyticsDashboard: API error toast, normalized overview with fallbacks
  - Future: Custom report builder, scheduled exports

### Other Missing Pieces (Lower Priority)

> **Full list**: See [REMAINING_ITEMS.md](./REMAINING_ITEMS.md) for all items with F/B tags and notes.

- [ ] Feature flags system
- [ ] DSR (GDPR) workflow
- [ ] MFA enforcement
- [ ] Bulk import/export wizards
- [ ] Email/SMS provider config UI
- [ ] Job board settings CRUD
- [ ] SSO configuration

---

## Common Patterns

### Backend Controller Pattern

```typescript
// Standard controller pattern in /modules/hrm8/
export class MyController extends BaseController {
  async getAll(req: Hrm8AuthenticatedRequest, res: Response) {
    try {
      const result = await this.service.getAll({
        regionIds: req.assignedRegionIds  // For regional access control
      });
      // Transform snake_case to camelCase before sending
      return this.sendSuccess(res, { items: result });
    } catch (error) {
      return this.sendError(res, error);
    }
  }
}
```

### Frontend API Pattern

```typescript
// Standard API service in /services/
export const myApi = {
  async getAll(regionId?: string) {
    const response = await fetch(`/hrm8/my-endpoint?regionId=${regionId}`);
    const data = await response.json();
    // Expect camelCase from backend
    return data.items;
  }
};
```

### Casing Transform Pattern

```typescript
// In backend service, transform before returning
import { toCamelCase } from '@/utils/case-transform';

async getAll() {
  const items = await this.repository.findAll();
  return items.map(item => toCamelCase(item)); // snake_case → camelCase
}
```

---

## Testing Checklist

After any change:

- [ ] Backend: Test endpoint returns data
- [ ] Backend: Check casing in response
- [ ] Frontend 1 (`hrm8-admin-staff`): Test UI loads
- [ ] Frontend 2 (`hrm8-ats`): Test if it uses the API
- [ ] Frontend 3 (`hrm8-candidate`): Test if it uses the API
- [ ] Database: Verify data structure matches
- [ ] No console errors in any frontend
- [ ] No 500 errors in backend logs

---

## Reference Documents

- [progress.md](./progress.md) - Current status and next tasks
- [REMAINING_ITEMS.md](./REMAINING_ITEMS.md) - **Full list of remaining items** (single source of truth)
- [findings.md](./findings.md) - Detailed audit report
- [docs/INTERCONNECTIVITY_AUDIT_REPORT.md](../../docs/INTERCONNECTIVITY_AUDIT_REPORT.md) - Admin-Staff ↔ ATS ↔ Candidate interconnectivity

---

## Quick Links

**Database**:
- Schema: `backend-template/prisma/schema.prisma`

**Backend**:
- HRM8 Controllers: `backend-template/src/modules/hrm8/`
- Routes: `backend-template/src/modules/hrm8/hrm8.routes.ts`

**Frontends**:
- Admin UI: `hrm8-admin-staff/src/pages/hrm8/`
- ATS UI: `hrm8-ats/src/`
- Candidate UI: `hrm8-candidate/src/`

---

**Remember**: Pick ONE task, audit it, fix it, test ALL frontends, update docs, repeat.

---

## Recent Completions (2026-02-09)

- **Interconnectivity Fixes** (see `docs/INTERCONNECTIVITY_AUDIT_REPORT.md`): C1–C3 path mismatches fixed (conversation, sales, interview actionUrls); M1 consultant messages deep-link; M2 staff invite (env + real token, setup-account page).
- **Staff Invite Flow**: staff.controller uses env.FRONTEND_URL + generateInvitationToken(); ConsultantSetupAccountPage added; route `/consultant/setup-account` handles invite links.
- **System Settings API**: Fixed `SystemSettingsService` to use correct backend routes (`/api/hrm8/settings` instead of `/api/hrm8/system-settings`). Backend returns settings array; frontend transforms to key-value map. `bulkUpdateSettings` implemented client-side.
- **Commissions**: CommissionsPage - Hrm8PageLayout, TableSkeleton, API success/error handling.
- **Integrations**: Hrm8IntegrationsPage - defensive array handling and error fallbacks.
- **Analytics**: AnalyticsDashboard - API error toast, normalized overview with fallbacks.
- **Messaging + Templates**: AdminEmailTemplatesPage - Hrm8PageLayout, defensive fetchTemplates/fetchVariables, messagingService fallback.
- **Careers + Job Boards**: Hrm8JobBoardPage, CareersRequestsPage - Hrm8PageLayout, API error handling, defensive arrays.
- **Security + Compliance**: AuditLogsPage - Hrm8PageLayout, API success/error handling, defensive logs/stats.