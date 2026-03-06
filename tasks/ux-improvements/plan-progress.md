# Plan: UX Improvements for HRM8 Admin Dashboard

## Overview
We are enhancing the UX of the HRM8 Admin side by centralizing region management, improving the notifications flow, and adding detailed staff profiles. This plan serves as a standalone guide for implementation.

## Tech Stack Notes
- **State Management**: Use `zustand` for global region state.
- **UI Components**: Use existing shadcn/ui components (`Tabs`, `Select`, `Card`, etc.).

## Status Legend
- ⭕ Pending
- ⏳ In Progress
- ✅ Done

## Todos

### 1. Global Region Management (Zustand)
- [x] **Create Region Store**: Implement `useRegionStore` in `src/shared/stores/useRegionStore.ts`. ✅
- [x] **Sidebar Integration**: Add the Region Toggler to `UnifiedSidebar.tsx`. ✅
    - [x] Position: Below logo when expanded.
    - [x] Collapsed UX: Icon-only, reveals toggler on hover/interaction.
- [x] **Global Sync**: Update `/hrm8/*` pages to use the global region ID from the store instead of local state. ✅
    - [x] `Hrm8Overview.tsx`
    - [x] `StaffPage.tsx` with region filtering

### 2. Notifications & Alerts
- [x] **Redirection**: Link "View all alerts" from Dashboard/Widgets to `/hrm8/notifications`. ✅
- [x] **Tabbed UI**: Update `NotificationsPage.tsx` to use a tabbed interface. ✅
    - [x] Tab 1: "Notifications" (General system/user notifications).
    - [x] Tab 2: "Alerts" (Compliance/Operational alerts).
- [x] **Navigation**: Ensure `/hrm8/notifications` is easily accessible from the sidebar. ✅

### 3. Staff Profile & Management
- [x] **Clickable List**: Make rows in `StaffPage.tsx` react-router links to individual profiles. ✅
- [x] **Staff Profile Page**: Create `src/pages/hrm8/StaffProfilePage.tsx`. ✅
    - [x] Implement role-based data display.
    - [x] **Consultant**: Show jobs count and hire success rate.
    - [x] **Sales Agent**: Show leads and conversion metrics.
    - [x] **Consultant 360**: Merged view of recruitment and sales data.

### 4. Verification
- [x] Verify region switching updates data globally. ✅
- [x] Test notification redirection and tab switching. ✅
- [x] Validate staff profile role-switching logic. ✅

## Implementation Summary

### Files Created
1. `src/shared/stores/useRegionStore.ts` - Zustand store for global region state
2. `src/shared/components/hrm8/RegionToggler.tsx` - Region selection component
3. `src/pages/hrm8/StaffProfilePage.tsx` - Staff profile with role-based data display

### Files Modified
1. `src/shared/components/layouts/unified/UnifiedSidebar.tsx` - Added RegionToggler
2. `src/pages/hrm8/Hrm8Overview.tsx` - Integrated region store
3. `src/pages/hrm8/StaffPage.tsx` - Integrated region store and row click navigation
4. `src/pages/hrm8/NotificationsPage.tsx` - Added tabbed interface
5. `src/shared/components/hrm8/ComplianceAlertsWidget.tsx` - Added navigation to notifications
6. `src/shared/components/hrm8/AlertsWidget.tsx` - Added navigation to notifications
7. `src/App.tsx` - Added staff profile route

## Completed Features
✅ Global region management with Zustand store
✅ Region toggler in sidebar with expand/collapse support
✅ Global region state synced across pages
✅ Staff page filters by selected region
✅ Notification page with tabs for Notifications and Alerts
✅ Redirection from dashboard widgets to notifications page
✅ Clickable staff list rows that navigate to profile pages
✅ Role-based staff profile page with specific metrics for each role