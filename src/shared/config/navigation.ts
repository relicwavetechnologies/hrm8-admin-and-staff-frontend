import {
    LayoutDashboard,
    MapPin,
    Users,
    UserCog,
    Briefcase,
    DollarSign,
    TrendingUp,
    FileText,
    BarChart3,
    Target,
    Settings,
    ClipboardList,
    MessageSquare,
    Wallet,
    Building2,
    Plug,

    ArrowRightLeft,
    UserCheck,
    BookOpen
} from "lucide-react";
import { SidebarConfig, MenuItem } from "../types/dashboard";
import { UserType } from "../services/authService";

/**
 * Navigation items for HRM8 Admin
 */
const adminMenuItems: MenuItem[] = [
    { id: "overview", path: "/hrm8/dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "analytics", path: "/hrm8/analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
    { id: "regions", path: "/hrm8/regions", label: "Regions", icon: MapPin, adminOnly: true },
    { id: "licensees", path: "/hrm8/licensees", label: "Licensees", icon: Users, adminOnly: true },
    { id: "staff", path: "/hrm8/staff", label: "Staff", icon: UserCog },
    { id: "job-allocation", path: "/hrm8/allocations", label: "Job Allocation", icon: Briefcase },
    { id: "job-board", path: "/hrm8/job-board", label: "Jobs", icon: Briefcase, adminOnly: true },
    { id: "leads", path: "/hrm8/leads", label: "Leads", icon: Target },
    { id: "pipeline", path: "/hrm8/sales-pipeline", label: "Pipeline", icon: BarChart3 },
    { id: "commissions", path: "/hrm8/commissions", label: "Commissions", icon: DollarSign },
    { id: "withdrawals", path: "/hrm8/withdrawals", label: "Withdrawals", icon: DollarSign },
    { id: "refund-requests", path: "/hrm8/billing/refund-requests", label: "Refund Requests", icon: DollarSign },
    { id: "conversion-requests", path: "/hrm8/conversion-requests", label: "Conversion Requests", icon: UserCheck },
    { id: "settlements", path: "/hrm8/settlements", label: "Settlements", icon: DollarSign },
    { id: "revenue", path: "/hrm8/revenue", label: "Revenue", icon: TrendingUp },
    { id: "revenue-analytics", path: "/hrm8/revenue-analytics", label: "Revenue Analytics", icon: BarChart3 },
    { id: "attribution", path: "/hrm8/attribution", label: "Attribution", icon: UserCheck, adminOnly: true },
    { id: "pricing", path: "/hrm8/pricing", label: "Pricing", icon: BookOpen },
    { id: "reports", path: "/hrm8/reports", label: "Reports", icon: FileText },
    { id: "careers-requests", path: "/hrm8/careers-requests", label: "Careers Requests", icon: UserCheck, adminOnly: true },
    { id: "integrations", path: "/hrm8/integrations", label: "Integrations", icon: Plug, adminOnly: true },
    { id: "system", path: "/hrm8/system-settings", label: "System Settings", icon: Settings, adminOnly: true },
    { id: "email-templates", path: "/hrm8/email-templates", label: "Email Templates", icon: FileText, adminOnly: true },
    { id: "audit", path: "/hrm8/audit-logs", label: "Audit Logs", icon: ClipboardList, adminOnly: true },
];

/**
 * Navigation items for Recruiter/Consultant
 */
const consultantMenuItems: MenuItem[] = [
    { id: "overview", path: "/consultant/dashboard", label: "Overview", icon: LayoutDashboard },
    { id: "jobs", path: "/consultant/jobs", label: "My Jobs", icon: Briefcase },
    { id: "messages", path: "/consultant/messages", label: "Messages", icon: MessageSquare },
    { id: "commissions", path: "/consultant/commissions", label: "Commissions", icon: DollarSign },
    { id: "wallet", path: "/consultant/wallet", label: "Wallet", icon: Wallet },
];

/**
 * Navigation items for Sales Agent
 */
const salesMenuItems: MenuItem[] = [
    { id: "overview", path: "/sales-agent/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "pipeline", path: "/sales-agent/pipeline", label: "Pipeline", icon: DollarSign },
    { id: "leads", path: "/sales-agent/leads", label: "Leads", icon: Users },
    { id: "clients", path: "/sales-agent/companies", label: "My Clients", icon: Building2 },
    { id: "commissions", path: "/sales-agent/commissions", label: "Commissions", icon: DollarSign },
];

/**
 * Navigation items for Consultant 360 (Combined)
 */
const consultant360MenuItems: MenuItem[] = [
    { id: "overview", path: "/consultant360/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "earnings", path: "/consultant360/earnings", label: "Earnings", icon: DollarSign },
    { id: "recruitment-jobs", path: "/consultant360/jobs", label: "My Jobs", icon: Briefcase },
    { id: "recruitment-messages", path: "/consultant360/messages", label: "Messages", icon: MessageSquare },
    { id: "sales-leads", path: "/consultant360/leads", label: "Leads", icon: Target },
    { id: "sales-pipeline", path: "/consultant360/pipeline", label: "Pipeline", icon: BarChart3 },
];

export const getSidebarConfig = (userType: UserType, _user: any): SidebarConfig => {
    switch (userType) {
        case "ADMIN":
            return {
                dashboardType: "hrm8",
                basePath: "/hrm8",
                homePath: "/hrm8/dashboard",
                menuItems: adminMenuItems,
                footerActions: [],
                showLogoutButton: true,
                userDisplay: {
                    getName: (u: any) => `${u?.firstName} ${u?.lastName}`,
                    getSubtitle: (u: any) => u?.role === "GLOBAL_ADMIN" ? "Global Admin" : "Regional Licensee"
                },
                filterMenuItems: (items, u: any) => items.filter(i => !i.adminOnly || u?.role === "GLOBAL_ADMIN")
            };
        case "CONSULTANT":
            return {
                dashboardType: "consultant",
                basePath: "/consultant",
                homePath: "/consultant/dashboard",
                menuItems: consultantMenuItems,
                footerActions: [],
                showLogoutButton: true,
                userDisplay: {
                    getName: (u: any) => `${u?.firstName} ${u?.lastName}`,
                    getSubtitle: () => "Consultant"
                }
            };
        case "SALES_AGENT":
            return {
                dashboardType: "sales-agent",
                basePath: "/sales-agent",
                homePath: "/sales-agent/dashboard",
                menuItems: salesMenuItems,
                footerActions: [],
                showLogoutButton: true,
                userDisplay: {
                    getName: (u: any) => `${u?.firstName} ${u?.lastName}`,
                    getSubtitle: () => "Sales Partner"
                }
            };
        case "CONSULTANT360":
            return {
                dashboardType: "consultant360",
                basePath: "/consultant360",
                homePath: "/consultant360/dashboard",
                menuItems: consultant360MenuItems,
                footerActions: [
                    { id: "switch", path: "/consultant/dashboard", label: "Switch Portal", icon: ArrowRightLeft, tooltip: "Switch between portals" }
                ],
                showLogoutButton: true,
                userDisplay: {
                    getName: (u: any) => `${u?.firstName} ${u?.lastName}`,
                    getSubtitle: () => "Consultant 360"
                }
            };
        default:
            throw new Error(`Unsupported user type: ${userType}`);
    }
};
