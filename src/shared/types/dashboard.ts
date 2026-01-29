import { LucideIcon } from "lucide-react";
import { ComponentType } from "react";

/**
 * Dashboard type identifiers for the unified layout system
 */
export type DashboardType =
  | "candidate"
  | "consultant"
  | "consultant360"
  | "hrm8"
  | "main"
  | "sales-agent";

/**
 * Basic menu item for sidebar navigation
 */
export interface MenuItem {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
  badge?: ComponentType;
  subItems?: SubMenuItem[];
}

/**
 * Sub-item for nested navigation (used in AppSidebar collapsible groups)
 */
export interface SubMenuItem {
  title: string;
  url: string;
}

/**
 * Menu section for grouped navigation (AppSidebar style with collapsible groups)
 */
export interface MenuSection {
  id: string;
  label: string;
  items: MenuItem[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  icon?: LucideIcon;
  visibilityCondition?: (context: VisibilityContext) => boolean;
}

/**
 * Context for visibility checks (module access, permissions, user role)
 */
export interface VisibilityContext {
  user: unknown;
  hasATS?: boolean;
  hasHRMS?: boolean;
  hasRPO?: boolean;
  hasSales?: boolean;
  permissions?: string[];
}

/**
 * Footer action configuration for sidebar footer buttons
 */
export interface FooterAction {
  id: string;
  path: string;
  label: string;
  icon: LucideIcon;
  tooltip: string;
  onClick?: () => void | Promise<void>;
}

/**
 * User display configuration for sidebar header
 */
export interface UserDisplayConfig {
  getName: (user: unknown) => string;
  getSubtitle?: (user: unknown) => string | null;
  getAvatar?: (user: unknown) => string | null;
}

/**
 * Sidebar configuration for a dashboard type
 */
export interface SidebarConfig {
  dashboardType: DashboardType;
  basePath: string;
  homePath: string;

  // Simple menu (Candidate, Consultant, HRM8) - flat list of items
  menuItems?: MenuItem[];

  // Sectioned menu (AppSidebar/Main dashboard) - grouped collapsible sections
  menuSections?: MenuSection[];

  // Recent records feature (AppSidebar)
  showRecentRecords?: boolean;

  // Footer configuration
  footerActions: FooterAction[];
  showLogoutButton: boolean;

  // User display in header
  userDisplay: UserDisplayConfig;

  // Optional filter function for role-based menu filtering
  filterMenuItems?: (items: MenuItem[], user: unknown) => MenuItem[];
}

/**
 * Layout features that can be enabled/disabled per dashboard
 */
export interface LayoutFeatures {
  webSocket?: boolean;
  commandPalette?: boolean;
  keyboardShortcuts?: boolean;
  profileCompletionDialog?: ComponentType | null;
}

/**
 * Complete dashboard configuration combining sidebar and layout features
 */
export interface DashboardConfig {
  sidebar: SidebarConfig;
  features: LayoutFeatures;
  sidebarStateKey?: "candidate" | "consultant" | "consultant360" | "hrm8";
}

/**
 * Unified auth adapter interface that works across all auth contexts
 */
export interface AuthAdapter {
  user: unknown;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  getEmail?: () => string | undefined;
}
