# HRM8 Admin & Staff – Remaining Items

> **Purpose**: Single source of truth for all remaining work. Use this to ensure nothing is lost and implementation is tracked correctly.
>
> **Last Updated**: 2026-02-09
>
> **Status**: All 15 core areas are production-ready. This doc lists minor features, enhancements, and future work.

---

## How to Use This Document

- **Before starting any remaining item**: Check this doc, understand dependencies (F=Frontend, B=Backend, both)
- **After completing an item**: Mark it done here and in [progress.md](./progress.md)
- **When adding new items**: Add to the appropriate section with F/B tags and notes

---

## Legend

| Tag | Meaning |
|-----|---------|
| F | Frontend (hrm8-admin-and-staff-frontend) |
| B | Backend (hrm8-backend) |
| F+B | Both frontend and backend |

---

## 1. Auth & Roles

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 1.1 | Full role permission matrix | F+B | Low | Map all HRM8 roles to granular permissions; UI to view/edit |
| 1.2 | MFA enforcement | F+B | Low | Enforce MFA for HRM8 users; setup flow, enforcement policy |
| 1.3 | Password reset for HRM8 staff | B+F | Medium | Forgot-password flow (similar to ATS); email + reset token |
| 1.4 | Session timeout and refresh | B | Low | Configurable timeout; refresh token or re-auth flow |
| 1.5 | IP allowlist | B | Low | Restrict admin login by IP (optional security) |

---

## 2. Regions & Licensees

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 2.1 | Suspend/terminate licensee workflow | F+B | Medium | UI + backend for licensee status: ACTIVE → SUSPENDED → TERMINATED |
| 2.2 | Settlement terms configuration | F+B | Low | Configure terms per licensee/region |
| 2.3 | Agreement file uploads | F+B | Low | Upload/sign agreements for licensees |
| 2.4 | Regional KPIs dashboard | F | Low | KPIs per region (revenue, placements, etc.) |

---

## 3. Consultant/Staff

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 3.1 | Email sending on invite | B | Low | When admin clicks "Invite", send email with invite link (link flow already works) |

---

## 4. Job Allocation

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 4.1 | Auto-assign algorithm verification | B | Medium | Validate auto-assign rules; test industry/language matching |
| 4.2 | Industry/language matching | B | Medium | Match jobs to consultants by industry/language |
| 4.3 | Capacity-based assignment | B | Medium | Respect consultant capacity when assigning |
| 4.4 | Assignment audit trail/history | F+B | Low | Log who assigned what and when; history view in UI |

---

## 5. Leads + CRM

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 5.1 | Company detail page with all tabs | F | Medium | Tabs: Overview, Contacts, Opportunities, Subscriptions, Billing, Attribution |
| 5.2 | Duplicate detection | B | Low | Detect duplicate leads/companies before creation |
| 5.3 | Geo-based lead routing | B | Low | Route leads to consultants by region/territory |

---

## 6. Pricing

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 6.1 | Company custom pricing override UI | F+B | Medium | Override price book per company; verify backend supports first |

---

## 7. Commissions (Backend-Driven)

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 7.1 | Commission dispute workflow | B+F | Medium | B: `POST /commissions/:id/dispute`, `PUT /commissions/:id/resolve-dispute`; F: dispute UI on CommissionsPage |
| 7.2 | Statement generation | B+F | Low | B: `GET /commissions/statements/:consultantId`; F: download/view statement |
| 7.3 | Renewal eligibility (3-month lapse) | B | Low | Business rule: renewal eligibility after 3-month lapse |

---

## 8. Billing (Backend-Driven)

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 8.1 | Invoice generation from subscriptions | B | Medium | Auto-generate invoices from active subscriptions |
| 8.2 | Tax calculation by country | B | Medium | Tax rules per country/region |
| 8.3 | Currency conversion | B | Low | Multi-currency support; conversion rates |

---

## 9. Revenue + Settlements

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 9.1 | Automated settlement calculation | B | Medium | Scheduled job to calculate settlements |
| 9.2 | Scheduled statement generation | B | Low | Periodic statements for licensees |

---

## 10. Integrations

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 10.1 | Health monitoring UI | F | Low | Show integration health when B provides `GET /integrations/:provider/health` |
| 10.2 | Usage tracking for billing | B | Low | Track integration usage for billing |

---

## 11. Messaging

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 11.1 | SMS provider configuration | F+B | Low | Configure SMS (Twilio, etc.); provider setup UI |
| 11.2 | Opt-in/unsubscribe compliance | F+B | Medium | GDPR/compliance: opt-in, unsubscribe links |
| 11.3 | Deliverability monitoring | F+B | Low | Monitor email deliverability; bounce/complaint tracking |

---

## 12. Careers + Job Boards

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 12.1 | Job board settings CRUD | F+B | Low | `GET/PUT /job-boards/settings`; UI for board config |
| 12.2 | Content libraries (templates, questions) | F+B | Low | Job templates; application questions library |
| 12.3 | Auto-sync to external boards | B | Low | Sync jobs to Indeed, LinkedIn, etc. |

---

## 13. Analytics

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 13.1 | Custom report builder | F+B | Low | Build custom reports; filters, dimensions, exports |
| 13.2 | Scheduled exports | F+B | Low | Schedule report exports; email delivery |
| 13.3 | Churn risk indicators | B+F | Low | Identify at-risk companies; dashboard widget |

---

## 14. Security + Compliance

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 14.1 | Full audit log coverage on all write actions | B | Medium | Add audit middleware to all controllers with write ops |
| 14.2 | DSR (GDPR) workflow | F+B | Medium | Data subject request: create, track, fulfill; `DataSubjectRequest` model |
| 14.3 | MFA enforcement | F+B | Low | See 1.2 |
| 14.4 | SSO configuration | F+B | Low | SAML/OIDC for admin login |

---

## 15. System Settings

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| 15.1 | Feature flags management | F+B | Low | `GET/PUT /system/feature-flags`; UI to toggle by region/cohort |
| 15.2 | Background job monitoring UI | F+B | Low | View status of cron/scheduled jobs |
| 15.3 | Bulk import/export wizard | F+B | Low | Import consultants, companies, jobs; export data |

---

## 16. UI Bugs (Header, Global Toggler, Minor)

| # | Item | F/B | Priority | Notes |
|---|------|-----|----------|-------|
| ~~16.1~~ | ~~Header duplication~~ | F | ~~High~~ | ✅ **Done** – Removed Hrm8Header from Hrm8PageLayout; UnifiedHeader is the single source |
| **16.2** | **Global region toggler – all pages** | F+B | **High** | Sidebar RegionToggler drives data; no personal region selectors. Done: Staff, JobBoard, Overview, RegionalLeads, JobAllocation, ConsultantJobs, SalesPipeline, RegionalSalesDashboard, **Pricing**, **UnassignedJobs**, **Revenue** ✅. Hierarchy (keep own filter): Regions, Licensees, Territories (sales territory regions: north-america/emea/apac – different from HRM8 regions). Form fields (e.g. StaffForm region assignment) stay as-is |
| 16.3 | Avatar styling inconsistency | F | Low | UserNav uses `bg-primary/10 text-primary`; Hrm8UserNav uses `bg-primary text-primary-foreground`. Causes visual diff when duplicate headers appear. Standardize once 16.1 is fixed |

---

## Summary by Priority

| Priority | Count | Items |
|----------|-------|-------|
| High | 2 | **16.1 (Header duplication)**, **16.2 (Global region toggler)** |
| Medium | 12 | 1.3, 2.1, 4.1–4.3, 5.1, 6.1, 7.1, 8.1–8.2, 9.1, 11.2, 14.1–14.2 |
| Low | 30 | 16.3, and all others |

---

## Recommended Implementation Order

1. **Header duplication** (16.1) – remove Hrm8Header from Hrm8PageLayout; fix immediately
2. **Global region toggler** (16.2) – migrate SalesPipeline, RegionalSalesDashboard to useRegionStore; add region filter to Licensees, Regions, Analytics, Revenue, Commissions, etc. where backend supports it
3. **Password reset for HRM8 staff** (1.3) – usability
4. **Company detail page with tabs** (5.1) – core CRM
5. **Suspend/terminate licensee** (2.1) – operations
6. **Company custom pricing UI** (6.1) – if backend ready
7. **Commission dispute workflow** (7.1) – if disputes are common
8. **Auto-assign verification** (4.1–4.3) – job allocation
9. **Invoice generation from subscriptions** (8.1) – billing
10. **DSR workflow** (14.2) – compliance
11. **Audit log coverage** (14.1) – compliance
12. **Opt-in/unsubscribe** (11.2) – compliance

---

## Cross-References

- [progress.md](./progress.md) – Current status per area
- [plan.md](./plan.md) – Agent guide and audit checklist
- [findings.md](./findings.md) – Detailed audit findings
- [../../docs/INTERCONNECTIVITY_AUDIT_REPORT.md](../../docs/INTERCONNECTIVITY_AUDIT_REPORT.md) – Admin-Staff ↔ ATS ↔ Candidate

---

**End of Remaining Items**
