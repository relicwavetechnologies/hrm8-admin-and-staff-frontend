/**
 * Dashboard Configurations
 * Centralized configuration for all dashboard types
 */

import {
  LayoutDashboard,
  User,
  FileText,
  Bookmark,
  Briefcase,
  GraduationCap,
  FolderOpen,
  MessageSquare,
  ClipboardCheck,
  DollarSign,
  Settings,
  HelpCircle,
  MapPin,
  Users,
  UserCog,
  TrendingUp,
  BookOpen,
  BarChart3,
  Target,
  UserCheck,
} from "lucide-react";
// // import { ConsultantProfileCompletionDialog } from "@/components/consultants/ConsultantProfileCompletionDialog";
import type { DashboardConfig, MenuItem } from "@/shared/types/dashboard";

// ============================================================================
// Candidate Dashboard Configuration
// ============================================================================

export const candidateDashboardConfig: DashboardConfig = {
  sidebarStateKey: "candidate",
  sidebar: {
    dashboardType: "candidate",
    basePath: "/candidate",
    homePath: "/candidate/dashboard",
    menuItems: [
      {
        id: "dashboard",
        path: "/candidate/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "profile",
        path: "/candidate/profile",
        label: "My Profile",
        icon: User,
      },
      {
        id: "work-history",
        path: "/candidate/work-history",
        label: "Work History",
        icon: Briefcase,
      },
      {
        id: "qualifications",
        path: "/candidate/qualifications",
        label: "Qualifications",
        icon: GraduationCap,
      },
      {
        id: "documents",
        path: "/candidate/documents",
        label: "Documents",
        icon: FolderOpen,
      },
      {
        id: "applications",
        path: "/candidate/applications",
        label: "Applications",
        icon: FileText,
      },
      {
        id: "saved-jobs",
        path: "/candidate/saved-jobs",
        label: "Saved Jobs",
        icon: Bookmark,
      },
      {
        id: "assessments",
        path: "/candidate/assessments",
        label: "Assessments",
        icon: ClipboardCheck,
      },
      {
        id: "messages",
        path: "/candidate/messages",
        label: "Messages",
        icon: MessageSquare,
      },
    ],
    footerActions: [
      {
        id: "settings",
        path: "/candidate/settings",
        label: "Settings",
        icon: Settings,
        tooltip: "Settings",
      },
      {
        id: "help",
        path: "/candidate/help",
        label: "Help",
        icon: HelpCircle,
        tooltip: "Help",
      },
    ],
    showLogoutButton: true,
    userDisplay: {
      getName: (user: unknown) => {
        const u = user as { firstName?: string; lastName?: string } | null;
        return u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "";
      },
      getSubtitle: (user: unknown) => {
        const u = user as { firstName?: string; lastName?: string } | null;
        return u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : null;
      },
    },
  },
  features: {
    webSocket: true,
    commandPalette: false,
    keyboardShortcuts: true,
    profileCompletionDialog: null,
  },
};

// ============================================================================
// Consultant Dashboard Configuration
// ============================================================================

export const consultantDashboardConfig: DashboardConfig = {
  sidebarStateKey: "consultant",
  sidebar: {
    dashboardType: "consultant",
    basePath: "/consultant",
    homePath: "/consultant/dashboard",
    menuItems: [
      {
        id: "dashboard",
        path: "/consultant/dashboard",
        label: "Overview",
        icon: LayoutDashboard,
      },
      {
        id: "jobs",
        path: "/consultant/jobs",
        label: "My Jobs",
        icon: Briefcase,
      },
      {
        id: "messages",
        path: "/consultant/messages",
        label: "Messages",
        icon: MessageSquare,
      },
      {
        id: "commissions",
        path: "/consultant/commissions",
        label: "Commissions",
        icon: DollarSign,
      },
      {
        id: "profile",
        path: "/consultant/profile",
        label: "Profile",
        icon: User,
      },
    ],
    footerActions: [
      {
        id: "settings",
        path: "/consultant/settings",
        label: "Settings",
        icon: Settings,
        tooltip: "Settings",
      },
      {
        id: "help",
        path: "/consultant/help",
        label: "Help",
        icon: HelpCircle,
        tooltip: "Help",
      },
    ],
    showLogoutButton: true,
    userDisplay: {
      getName: (user: unknown) => {
        const u = user as { firstName?: string; lastName?: string } | null;
        return u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "";
      },
      getSubtitle: (user: unknown) => {
        const u = user as { firstName?: string; lastName?: string } | null;
        return u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : null;
      },
    },
  },
  features: {
    webSocket: false,
    commandPalette: true,
    keyboardShortcuts: true,
    profileCompletionDialog: null, // ConsultantProfileCompletionDialog,
  },
};

// ============================================================================
// Sales Agent Dashboard Configuration (same as consultant but different base path)
// ============================================================================

export const salesAgentDashboardConfig: DashboardConfig = {
  sidebarStateKey: "consultant",
  sidebar: {
    dashboardType: "sales-agent",
    basePath: "/sales-agent",
    homePath: "/sales-agent/dashboard",
    menuItems: [
      {
        id: "dashboard",
        path: "/sales-agent/dashboard",
        label: "Overview",
        icon: LayoutDashboard,
      },
      {
        id: "jobs",
        path: "/sales-agent/jobs",
        label: "My Jobs",
        icon: Briefcase,
      },
      {
        id: "messages",
        path: "/sales-agent/messages",
        label: "Messages",
        icon: MessageSquare,
      },
      {
        id: "commissions",
        path: "/sales-agent/commissions",
        label: "Commissions",
        icon: DollarSign,
      },
      {
        id: "profile",
        path: "/sales-agent/profile",
        label: "Profile",
        icon: User,
      },
    ],
    footerActions: [
      {
        id: "settings",
        path: "/sales-agent/settings",
        label: "Settings",
        icon: Settings,
        tooltip: "Settings",
      },
      {
        id: "help",
        path: "/sales-agent/help",
        label: "Help",
        icon: HelpCircle,
        tooltip: "Help",
      },
    ],
    showLogoutButton: true,
    userDisplay: {
      getName: (user: unknown) => {
        const u = user as { firstName?: string; lastName?: string } | null;
        return u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "";
      },
      getSubtitle: (user: unknown) => {
        const u = user as { firstName?: string; lastName?: string } | null;
        return u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : null;
      },
    },
  },
  features: {
    webSocket: false,
    commandPalette: true,
    keyboardShortcuts: true,
    profileCompletionDialog: null, // ConsultantProfileCompletionDialog,
  },
};

// ============================================================================
// HRM8 Dashboard Configuration
// ============================================================================

export const hrm8DashboardConfig: DashboardConfig = {
  sidebarStateKey: "hrm8",
  sidebar: {
    dashboardType: "hrm8",
    basePath: "/hrm8",
    homePath: "/hrm8/dashboard",
    menuItems: [
      {
        id: "dashboard",
        path: "/hrm8/dashboard",
        label: "Overview",
        icon: LayoutDashboard,
      },
      {
        id: "analytics",
        path: "/hrm8/analytics",
        label: "Analytics",
        icon: BarChart3,
        adminOnly: true,
      },
      {
        id: "regions",
        path: "/hrm8/regions",
        label: "Regions",
        icon: MapPin,
        adminOnly: true,
      },
      {
        id: "licensees",
        path: "/hrm8/licensees",
        label: "Licensees",
        icon: Users,
        adminOnly: true,
      },
      {
        id: "staff",
        path: "/hrm8/staff",
        label: "Staff",
        icon: UserCog,
      },
      {
        id: "job-allocation",
        path: "/hrm8/jobs",
        label: "Job Allocation",
        icon: Briefcase,
      },
      {
        id: "job-board",
        path: "/hrm8/job-board",
        label: "Jobs",
        icon: Briefcase,
        adminOnly: true,
      },
      {
        id: "leads",
        path: "/hrm8/leads",
        label: "Leads",
        icon: Target,
      },
      {
        id: "pipeline",
        path: "/hrm8/sales-pipeline",
        label: "Pipeline",
        icon: BarChart3,
      },
      {
        id: "commissions",
        path: "/hrm8/commissions",
        label: "Commissions",
        icon: DollarSign,
      },
      {
        id: "withdrawals",
        path: "/hrm8/withdrawals",
        label: "Withdrawals",
        icon: DollarSign,
      },
      {
        id: "refund-requests",
        path: "/hrm8/billing/refund-requests",
        label: "Refund Requests",
        icon: DollarSign,
      },
      {
        id: "conversion-requests",
        path: "/hrm8/conversion-requests",
        label: "Conversion Requests",
        icon: UserCheck,
      },
      {
        id: "settlements",
        path: "/hrm8/settlements",
        label: "Settlements",
        icon: DollarSign,
      },
      {
        id: "revenue",
        path: "/hrm8/revenue",
        label: "Revenue",
        icon: TrendingUp,
      },
      {
        id: "revenue-analytics",
        path: "/hrm8/revenue-analytics",
        label: "Revenue Analytics",
        icon: BarChart3,
      },
      {
        id: "attribution",
        path: "/hrm8/attribution",
        label: "Attribution",
        icon: UserCheck,
        adminOnly: true,
      },
      {
        id: "pricing",
        path: "/hrm8/pricing",
        label: "Pricing",
        icon: BookOpen,
      },
      {
        id: "reports",
        path: "/hrm8/reports",
        label: "Reports",
        icon: FileText,
      },
      {
        id: "settings",
        path: "/hrm8/settings",
        label: "Account Settings",
        icon: Settings,
      },
      {
        id: "careers-requests",
        path: "/hrm8/careers-requests",
        label: "Careers Requests",
        icon: UserCheck,
        adminOnly: true,
      },
      {
        id: "system-settings",
        path: "/hrm8/system-settings",
        label: "System Settings",
        icon: Settings,
        adminOnly: true,
      },
    ],
    footerActions: [
      {
        id: "settings",
        path: "/hrm8/settings",
        label: "Settings",
        icon: Settings,
        tooltip: "Settings",
      },
      {
        id: "help",
        path: "/hrm8/help",
        label: "Help",
        icon: HelpCircle,
        tooltip: "Help",
      },
    ],
    showLogoutButton: true,
    userDisplay: {
      getName: (user: unknown) => {
        const u = user as { firstName?: string; lastName?: string } | null;
        return u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "";
      },
      getSubtitle: (user: unknown) => {
        const u = user as { role?: string } | null;
        if (!u) return null;
        return u.role === "GLOBAL_ADMIN" ? "Global Admin" : "Regional Licensee";
      },
    },
    filterMenuItems: (items: MenuItem[], user: unknown) => {
      const u = user as { role?: string } | null;
      const isGlobalAdmin = u?.role === "GLOBAL_ADMIN";
      return items.filter((item) => !item.adminOnly || isGlobalAdmin);
    },
  },
  features: {
    webSocket: false,
    commandPalette: true,
    keyboardShortcuts: true,
    profileCompletionDialog: null,
  },
};

// ============================================================================
// Consultant 360 Dashboard Configuration (Unified access to both consult ant and sales)
// ============================================================================

export const consultant360DashboardConfig: DashboardConfig = {
  sidebarStateKey: "consultant360",
  sidebar: {
    dashboardType: "consultant360",
    basePath: "/consultant360",
    homePath: "/consultant360/dashboard",
    menuItems: [
      {
        id: "dashboard",
        path: "/consultant360/dashboard",
        label: "Dashboard",
        icon: LayoutDashboard,
      },
      {
        id: "earnings",
        path: "/consultant360/earnings",
        label: "Earnings",
        icon: DollarSign,
      },
      // Recruitment section
      {
        id: "jobs",
        path: "/consultant360/jobs",
        label: "My Jobs",
        icon: Briefcase,
      },
      // Sales section
      {
        id: "leads",
        path: "/consultant360/leads",
        label: "Leads",
        icon: Target,
      },
      {
        id: "pipeline",
        path: "/consultant360/pipeline",
        label: "Pipeline",
        icon: BarChart3,
      },
      {
        id: "messages",
        path: "/consultant360/messages",
        label: "Messages",
        icon: MessageSquare,
      },
      {
        id: "profile",
        path: "/consultant360/profile",
        label: "Profile",
        icon: User,
      },
    ],
    footerActions: [
      {
        id: "settings",
        path: "/consultant360/settings",
        label: "Settings",
        icon: Settings,
        tooltip: "Settings",
      },
      {
        id: "help",
        path: "/consultant360/help",
        label: "Help",
        icon: HelpCircle,
        tooltip: "Help",
      },
    ],
    showLogoutButton: true,
    userDisplay: {
      getName: (user: unknown) => {
        const u = user as { firstName?: string; lastName?: string } | null;
        return u ? `${u.firstName || ""} ${u.lastName || ""}`.trim() : "";
      },
      getSubtitle: () => "Consultant 360",
    },
  },
  features: {
    webSocket: false,
    commandPalette: true,
    keyboardShortcuts: true,
    profileCompletionDialog: null, // ConsultantProfileCompletionDialog,
  },
};

// ============================================================================
// Export all configs
// ============================================================================

export const dashboardConfigs = {
  candidate: candidateDashboardConfig,
  consultant: consultantDashboardConfig,
  "sales-agent": salesAgentDashboardConfig,
  consultant360: consultant360DashboardConfig,
  hrm8: hrm8DashboardConfig,
} as const;

