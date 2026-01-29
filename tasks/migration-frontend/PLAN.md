# HRM8 Admin & Staff Management Portal - Migration Plan

## Project Overview

This document provides complete guidance for migrating and consolidating **four different dashboards** from the old monolithic frontend into a unified Admin & Staff Management Portal with **dynamic dashboard rendering** based on user type.

### Source Dashboards to Consolidate

1. **Global Admin** (`/hrm8/*` routes)
2. **Consultants** (`/consultant/*` routes)
3. **Sales Agents** (`/sales-agent/*` routes)
4. **Consultant360** (`/consultant360/*` routes)

**Critical Note:** Each user type has its own database table and authentication system. This is NOT a role-based system - it's a **multi-user-type system** where different types of users log in to see completely different dashboards rendered from the same application shell.

---

## ⚠️ CRITICAL MIGRATION PRINCIPLES

### 1. NO STUB IMPLEMENTATIONS ALLOWED

**RULE:** Every migrated component must be **100% functional** with **real implementations**.

❌ **NOT ACCEPTABLE:**
```typescript
// Placeholder/stub implementation
const fetchUsers = async () => {
  // TODO: Implement API call
  return [];
};
```

✅ **REQUIRED:**
```typescript
// Real, working implementation
const fetchUsers = async () => {
  const response = await apiClient.get('/api/hrm8/users');
  return response.data;
};
```

**Verification Checklist:**
- [ ] All API calls connect to real endpoints
- [ ] All forms submit actual data
- [ ] All tables display real data from backend
- [ ] All filters and search work
- [ ] All CRUD operations are functional
- [ ] No "coming soon" or "TODO" comments in production code

---

### 2. EXACT UI/UX PRESERVATION

**RULE:** The new frontend must look and behave **identically** to the old frontend.

**What must be preserved:**
- ✅ Exact same layout and spacing
- ✅ Exact same colors, fonts, and styles
- ✅ Exact same component positions
- ✅ Exact same user interactions
- ✅ Exact same navigation flow
- ✅ Exact same form fields and validations
- ✅ Exact same table columns and sorting
- ✅ Exact same modals and dialogs
- ✅ Exact same loading states and error messages
- ✅ Exact same responsive behavior

**How to verify:**
1. Open old dashboard page
2. Take screenshot
3. Open new migrated page
4. Take screenshot
5. Compare side-by-side - they should be identical

---

### 3. BATCH COPY MIGRATION STRATEGY

**RULE:** Use terminal commands to copy 10+ files at once, then fix imports in batch.

**Why Batch Copy?**
- Faster migration (100+ files to migrate)
- Maintains file relationships
- Preserves folder structure
- Less context switching

**Standard Batch Copy Process:**

```bash
# Step 1: Copy a batch of ~10 related files
cp /hrm8/frontend/src/pages/hrm8/RegionsPage.tsx \
   /hrm8/frontend/src/pages/hrm8/RegionalLeadsPage.tsx \
   /hrm8/frontend/src/pages/hrm8/RegionalCompaniesPage.tsx \
   /hrm8/frontend/src/pages/hrm8/LicenseesPage.tsx \
   /hrm8/frontend/src/pages/hrm8/JobAllocationPage.tsx \
   /hrm8/frontend/src/pages/hrm8/RevenueDashboardPage.tsx \
   /hrm8/frontend/src/pages/hrm8/AuditLogsPage.tsx \
   /hrm8/frontend/src/pages/hrm8/CareersRequestsPage.tsx \
   /hrm8/frontend/src/pages/hrm8/ConversionRequestsPage.tsx \
   /hrm8/frontend/src/pages/hrm8/Hrm8SettingsPage.tsx \
   /hrm8-admin-staff/src/pages/admin/

# Step 2: Batch fix import paths
find /hrm8-admin-staff/src/pages/admin -name "*.tsx" -exec \
  sed -i '' \
    -e 's|@/components/|@/shared/components/|g' \
    -e 's|@/hooks/|@/shared/hooks/|g' \
    -e 's|@/lib/|@/shared/lib/|g' \
    -e 's|@/types/|@/shared/types/|g' \
    -e 's|@/services/|@/shared/services/|g' \
  {} +

# Step 3: Copy related components in batch
cp /hrm8/frontend/src/components/regions/* \
   /hrm8-admin-staff/src/modules/admin/regions/components/

# Step 4: Copy related services in batch
cp /hrm8/frontend/src/services/regionsService.ts \
   /hrm8/frontend/src/services/licenseesService.ts \
   /hrm8/frontend/src/services/companiesService.ts \
   /hrm8-admin-staff/src/modules/admin/services/

# Step 5: Test all copied files together
pnpm run build
```

**Batch Migration Workflow:**

1. **Identify related files** (e.g., all admin pages)
2. **Copy 10-15 files** at once
3. **Batch fix imports** using sed commands
4. **Copy all related components** for those pages
5. **Copy all related services** for those pages
6. **Test compilation** - fix any errors
7. **Test functionality** - verify all features work
8. **Move to next batch**

---

### 4. MULTI-DASHBOARD DYNAMIC RENDERING

**CRITICAL ARCHITECTURE DECISION:**

This is **NOT** a role-based system. Each user type (Admin, Consultant, Sales, Consultant360) is a **completely separate user** stored in **different database tables**:

```
Database Tables:
- hrm8_users (Global Admins & Licensees)
- consultant_users (Consultants)
- sales_agent_users (Sales Agents)  
- consultant360_users (Consultant360 users)
```

**Authentication Flow:**
```
User visits /login
    ↓
Selects user type: Admin | Consultant | Sales | Consultant360
    ↓
Calls appropriate auth endpoint:
  - POST /api/auth/hrm8/login
  - POST /api/auth/consultant/login
  - POST /api/auth/sales-agent/login
  - POST /api/auth/consultant360/login
    ↓
Token contains: { userId, userType, companyId?, regionId?, permissions }
    ↓
App shell loads with unified layout
    ↓
Dashboard renders dynamically based on userType
```

**Unified Layout Architecture:**

```typescript
// App.tsx - Single entry point
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Single protected route - renders different dashboards */}
          <Route path="/*" element={
            <ProtectedRoute>
              <UnifiedDashboardLayout />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// UnifiedDashboardLayout.tsx - Dynamic dashboard renderer
function UnifiedDashboardLayout() {
  const { user } = useAuth();
  
  // Render appropriate dashboard based on user type
  switch (user.userType) {
    case 'ADMIN':
    case 'LICENSEE':
      return <AdminDashboard />;
      
    case 'CONSULTANT':
      return <ConsultantDashboard />;
      
    case 'SALES_AGENT':
      return <SalesDashboard />;
      
    case 'CONSULTANT_360':
      return <Consultant360Dashboard />;
      
    default:
      return <Navigate to="/login" />;
  }
}
```

**Key Implementation Points:**

1. **Single Layout Component**
   - One `UnifiedDashboardLayout` component
   - Renders different content based on `user.userType`
   - Shares common elements (header, notifications, profile menu)
   - Different sidebars per user type

2. **Dynamic Routing**
   - All routes behind authentication
   - Route access controlled by `userType` check
   - Example: `/clients` accessible to Consultant, Sales, and Consultant360
   - Same route path can render different components for different user types

3. **Type-Specific Navigation**
   ```typescript
   // Navigation items based on user type
   const getNavigationItems = (userType: UserType) => {
     switch (userType) {
       case 'ADMIN':
         return [
           { path: '/dashboard', label: 'Dashboard', icon: Home },
           { path: '/regions', label: 'Regions', icon: Map },
           { path: '/licensees', label: 'Licensees', icon: Building },
           // ... more admin items
         ];
       case 'CONSULTANT':
         return [
           { path: '/dashboard', label: 'Dashboard', icon: Home },
           { path: '/clients', label: 'Clients', icon: Users },
           { path: '/candidates', label: 'Candidates', icon: UserCheck },
           // ... more consultant items
         ];
       // ... other user types
     }
   };
   ```

4. **Shared vs Type-Specific Components**
   - **Shared:** Header, notifications, profile dropdown, charts
   - **Type-Specific:** Sidebar, dashboard widgets, feature pages

**How to Discover Multi-Dashboard Implementation:**

You MUST examine the old codebase to understand the pattern:

```bash
# 1. Check old authentication files
cat /hrm8/frontend/src/contexts/AuthContext.tsx
cat /hrm8/frontend/src/contexts/AdminAuthContext.tsx
cat /hrm8/frontend/src/contexts/ConsultantAuthContext.tsx

# 2. Check old routing structure
cat /hrm8/frontend/src/App.tsx
cat /hrm8/frontend/src/routes.tsx

# 3. Check how dashboards are rendered
cat /hrm8/frontend/src/pages/hrm8/Hrm8Dashboard.tsx
cat /hrm8/frontend/src/pages/consultant/ConsultantDashboard.tsx
cat /hrm8/frontend/src/pages/sales/SalesDashboard.tsx

# 4. Check layout components
ls -la /hrm8/frontend/src/layouts/
cat /hrm8/frontend/src/layouts/DashboardLayout.tsx

# 5. Check navigation components
cat /hrm8/frontend/src/components/navigation/Sidebar.tsx
cat /hrm8/frontend/src/components/navigation/AdminSidebar.tsx
```

---

## Directory Structure

### Old Codebase (Reference - DO NOT MODIFY)

```
/hrm8/frontend/src/
├── pages/
│   ├── hrm8/                       # Admin pages (~20 files)
│   ├── consultant/                 # Consultant pages (~15 files)
│   ├── sales/                      # Sales pages (~10 files)
│   └── consultant360/              # Consultant360 pages (~8 files)
├── components/
│   ├── admin/                      # Admin-specific components
│   ├── consultant/                 # Consultant-specific components
│   ├── sales/                      # Sales-specific components
│   └── shared/                     # Shared components
├── services/
│   ├── adminService.ts
│   ├── consultantService.ts
│   ├── salesService.ts
│   └── apiClient.ts
├── contexts/
│   ├── AdminAuthContext.tsx
│   ├── ConsultantAuthContext.tsx
│   └── SalesAuthContext.tsx
└── hooks/
    ├── useAdminAuth.ts
    ├── useConsultantAuth.ts
    └── useSalesAuth.ts
```

### New Codebase (Active Development)

```
/hrm8-admin-staff/
├── src/
│   ├── app/
│   │   ├── layouts/
│   │   │   ├── UnifiedDashboardLayout.tsx    # Main layout with dynamic rendering
│   │   │   ├── AuthLayout.tsx                # Login/register layout
│   │   │   └── components/
│   │   │       ├── AdminSidebar.tsx
│   │   │       ├── ConsultantSidebar.tsx
│   │   │       ├── SalesSidebar.tsx
│   │   │       ├── Consultant360Sidebar.tsx
│   │   │       └── Header.tsx               # Shared header
│   │   ├── guards/
│   │   │   └── ProtectedRoute.tsx           # Auth guard (not role-based)
│   │   ├── routes.tsx
│   │   └── App.tsx
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   │   ├── LoginForm.tsx            # Multi-type login
│   │   │   │   └── UserTypeSelector.tsx
│   │   │   ├── services/
│   │   │   │   └── authService.ts           # Multi-endpoint auth
│   │   │   └── hooks/
│   │   │       └── useAuth.ts
│   │   │
│   │   ├── admin/                           # Admin-specific modules
│   │   │   ├── dashboard/
│   │   │   │   ├── components/
│   │   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   │   └── AdminStatsCards.tsx
│   │   │   │   ├── hooks/
│   │   │   │   └── services/
│   │   │   ├── regions/
│   │   │   ├── licensees/
│   │   │   ├── companies/
│   │   │   └── ... (all admin features)
│   │   │
│   │   ├── consultant/                      # Consultant-specific modules
│   │   │   ├── dashboard/
│   │   │   │   ├── components/
│   │   │   │   │   ├── ConsultantDashboard.tsx
│   │   │   │   │   └── ConsultantStatsCards.tsx
│   │   │   │   ├── hooks/
│   │   │   │   └── services/
│   │   │   ├── clients/
│   │   │   ├── candidates/
│   │   │   └── ... (all consultant features)
│   │   │
│   │   ├── sales/                           # Sales-specific modules
│   │   │   ├── dashboard/
│   │   │   ├── leads/
│   │   │   └── ... (all sales features)
│   │   │
│   │   ├── consultant360/                   # Consultant360-specific modules
│   │   │   ├── dashboard/
│   │   │   └── ... (all consultant360 features)
│   │   │
│   │   └── shared/                          # Truly shared features
│   │       ├── revenue/
│   │       ├── analytics/
│   │       └── reporting/
│   │
│   ├── shared/
│   │   ├── components/
│   │   │   ├── ui/                          # shadcn/ui components
│   │   │   ├── common/                      # DataTable, StatsCard, etc.
│   │   │   ├── charts/                      # Chart components
│   │   │   └── forms/                       # Form components
│   │   ├── hooks/
│   │   ├── services/
│   │   │   └── apiClient.ts
│   │   ├── types/
│   │   │   ├── user.types.ts
│   │   │   ├── admin.types.ts
│   │   │   ├── consultant.types.ts
│   │   │   └── sales.types.ts
│   │   └── lib/
│   │       └── utils.ts
│   │
│   ├── pages/                               # Route entry points
│   │   ├── admin/
│   │   ├── consultant/
│   │   ├── sales/
│   │   ├── consultant360/
│   │   └── auth/
│   │
│   └── contexts/
│       └── AuthContext.tsx                  # Single auth context for all types
│
├── PLAN.md
├── UPDATES.md
└── README.md
```

---

## Migration Process: Step-by-Step Guide

### Phase 0: Project Setup

**Goal:** Create new React app with proper configuration

**Steps:**

1. **Initialize Vite + React + TypeScript**
   ```bash
   pnpm create vite@latest hrm8-admin-staff -- --template react-ts
   cd hrm8-admin-staff
   ```

2. **Install Core Dependencies**
   ```bash
   pnpm install react-router-dom@7 @tanstack/react-query @tanstack/react-table
   pnpm install axios zustand
   pnpm install -D tailwindcss postcss autoprefixer
   pnpm dlx tailwindcss init -p
   ```

3. **Install UI Dependencies**
   ```bash
   pnpm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
   pnpm install @radix-ui/react-select @radix-ui/react-tabs
   pnpm install @radix-ui/react-tooltip @radix-ui/react-popover
   pnpm install lucide-react clsx tailwind-merge
   pnpm install react-hook-form zod @hookform/resolvers
   pnpm install date-fns recharts
   ```

4. **Setup shadcn/ui**
   ```bash
   pnpm dlx shadcn@latest init
   ```

5. **Configure Path Aliases** (tsconfig.json)
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"],
         "@/app/*": ["./src/app/*"],
         "@/modules/*": ["./src/modules/*"],
         "@/shared/*": ["./src/shared/*"],
         "@/pages/*": ["./src/pages/*"],
         "@/contexts/*": ["./src/contexts/*"]
       }
     }
   }
   ```

6. **Create Directory Structure**
   ```bash
   mkdir -p src/{app/{layouts,guards},modules/{auth,admin,consultant,sales,consultant360,shared},shared/{components/{ui,common,charts,forms},hooks,services,types,lib},pages/{admin,consultant,sales,consultant360,auth},contexts}
   ```

7. **Setup Environment Variables**
   ```bash
   echo "VITE_API_URL=http://localhost:3000" > .env
   ```

---

### Phase 1: Foundation & Core Components (BATCH COPY)

**Goal:** Copy all shared UI components and utilities from old codebase

**Batch 1: UI Components (~25 files)**

```bash
# Copy all shadcn/ui components
cp /hrm8/frontend/src/components/ui/* \
   /hrm8-admin-staff/src/shared/components/ui/

# Verify all files copied
ls -la /hrm8-admin-staff/src/shared/components/ui/
```

**Batch 2: Common Components (~15 files)**

```bash
# Copy common components
cp /hrm8/frontend/src/components/common/DataTable.tsx \
   /hrm8/frontend/src/components/common/StatsCard.tsx \
   /hrm8/frontend/src/components/common/PageHeader.tsx \
   /hrm8/frontend/src/components/common/LoadingSpinner.tsx \
   /hrm8/frontend/src/components/common/EmptyState.tsx \
   /hrm8/frontend/src/components/common/ErrorBoundary.tsx \
   /hrm8/frontend/src/components/common/ConfirmDialog.tsx \
   /hrm8/frontend/src/components/common/SearchBar.tsx \
   /hrm8/frontend/src/components/common/FilterBar.tsx \
   /hrm8/frontend/src/components/common/Pagination.tsx \
   /hrm8-admin-staff/src/shared/components/common/
```

**Batch 3: Chart Components (~8 files)**

```bash
# Copy chart components
cp /hrm8/frontend/src/components/charts/* \
   /hrm8-admin-staff/src/shared/components/charts/
```

**Batch 4: Form Components (~10 files)**

```bash
# Copy form components
cp /hrm8/frontend/src/components/forms/* \
   /hrm8-admin-staff/src/shared/components/forms/
```

**Batch 5: Utilities & Services (~10 files)**

```bash
# Copy utilities
cp /hrm8/frontend/src/lib/* \
   /hrm8-admin-staff/src/shared/lib/

# Copy base services
cp /hrm8/frontend/src/services/apiClient.ts \
   /hrm8-admin-staff/src/shared/services/
```

**Batch Fix Imports:**

```bash
# Fix all import paths in shared components
find /hrm8-admin-staff/src/shared -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|from "@/components/ui/|from "@/shared/components/ui/|g' \
  -e 's|from "@/components/common/|from "@/shared/components/common/|g' \
  -e 's|from "@/lib/|from "@/shared/lib/|g' \
  -e 's|from "@/hooks/|from "@/shared/hooks/|g'
```

---

### Phase 2: Multi-Type Authentication System

**Goal:** Implement authentication that works for all user types

**Steps:**

1. **Examine Old Authentication** (REQUIRED FIRST STEP)
   ```bash
   # Study how old system handles multiple user types
   cat /hrm8/frontend/src/contexts/AdminAuthContext.tsx
   cat /hrm8/frontend/src/contexts/ConsultantAuthContext.tsx
   cat /hrm8/frontend/src/contexts/SalesAuthContext.tsx
   
   # Study old login pages
   cat /hrm8/frontend/src/pages/auth/AdminLogin.tsx
   cat /hrm8/frontend/src/pages/auth/ConsultantLogin.tsx
   
   # Study old API services
   cat /hrm8/frontend/src/services/authService.ts
   ```

2. **Copy Auth Components (Batch)**
   ```bash
   # Copy all auth-related files
   cp /hrm8/frontend/src/pages/auth/* \
      /hrm8-admin-staff/src/pages/auth/
   
   cp /hrm8/frontend/src/components/auth/* \
      /hrm8-admin-staff/src/modules/auth/components/
   
   # Fix imports
   find /hrm8-admin-staff/src/pages/auth -name "*.tsx" | xargs sed -i '' \
     -e 's|@/components/|@/shared/components/|g'
   ```

3. **Create Unified Auth Context**
   ```typescript
   // src/contexts/AuthContext.tsx
   type UserType = 'ADMIN' | 'LICENSEE' | 'CONSULTANT' | 'SALES_AGENT' | 'CONSULTANT_360';

   interface User {
     id: string;
     email: string;
     name: string;
     userType: UserType;
     companyId?: string;
     regionId?: string;
     permissions: string[];
   }

   interface AuthContextType {
     user: User | null;
     login: (email: string, password: string, userType: UserType) => Promise<void>;
     logout: () => void;
     isAuthenticated: boolean;
   }
   ```

4. **Create Auth Service with Multiple Endpoints**
   ```typescript
   // modules/auth/services/authService.ts
   export const authService = {
     loginAsAdmin: (email: string, password: string) =>
       apiClient.post('/api/auth/hrm8/login', { email, password }),

     loginAsConsultant: (email: string, password: string) =>
       apiClient.post('/api/auth/consultant/login', { email, password }),

     loginAsSales: (email: string, password: string) =>
       apiClient.post('/api/auth/sales-agent/login', { email, password }),

     loginAsConsultant360: (email: string, password: string) =>
       apiClient.post('/api/auth/consultant360/login', { email, password }),
   };
   ```

5. **Create Login Page with Type Selection**
   - User selects type (Admin/Consultant/Sales/Consultant360)
   - Appropriate endpoint called based on selection
   - Token stored with user type information
   - Redirect to dashboard (which renders dynamically)

---

### Phase 3: Unified Dashboard Layout

**Goal:** Create single layout that renders different dashboards dynamically

**Steps:**

1. **Examine Old Layout Implementation** (REQUIRED)
   ```bash
   # Study how old app renders different dashboards
   cat /hrm8/frontend/src/App.tsx
   cat /hrm8/frontend/src/layouts/DashboardLayout.tsx
   
   # Study each dashboard
   cat /hrm8/frontend/src/pages/hrm8/Hrm8Dashboard.tsx
   cat /hrm8/frontend/src/pages/consultant/ConsultantDashboard.tsx
   cat /hrm8/frontend/src/pages/sales/SalesDashboard.tsx
   cat /hrm8/frontend/src/pages/consultant360/Consultant360Dashboard.tsx
   
   # Study sidebar implementations
   cat /hrm8/frontend/src/components/navigation/AdminSidebar.tsx
   cat /hrm8/frontend/src/components/navigation/ConsultantSidebar.tsx
   ```

2. **Copy All Sidebar Components (Batch)**
   ```bash
   cp /hrm8/frontend/src/components/navigation/AdminSidebar.tsx \
      /hrm8/frontend/src/components/navigation/ConsultantSidebar.tsx \
      /hrm8/frontend/src/components/navigation/SalesSidebar.tsx \
      /hrm8/frontend/src/components/navigation/Consultant360Sidebar.tsx \
      /hrm8/frontend/src/components/navigation/Sidebar.tsx \
      /hrm8-admin-staff/src/app/layouts/components/
   ```

3. **Copy Header Component**
   ```bash
   cp /hrm8/frontend/src/components/navigation/Header.tsx \
      /hrm8-admin-staff/src/app/layouts/components/
   ```

4. **Create Unified Dashboard Layout**
   ```typescript
   // src/app/layouts/UnifiedDashboardLayout.tsx
   import { useAuth } from '@/contexts/AuthContext';
   import AdminSidebar from './components/AdminSidebar';
   import ConsultantSidebar from './components/ConsultantSidebar';
   import SalesSidebar from './components/SalesSidebar';
   import Consultant360Sidebar from './components/Consultant360Sidebar';
   import Header from './components/Header';

   export function UnifiedDashboardLayout() {
     const { user } = useAuth();

     // Render appropriate sidebar based on user type
     const renderSidebar = () => {
       switch (user?.userType) {
         case 'ADMIN':
         case 'LICENSEE':
           return <AdminSidebar />;
         case 'CONSULTANT':
           return <ConsultantSidebar />;
         case 'SALES_AGENT':
           return <SalesSidebar />;
         case 'CONSULTANT_360':
           return <Consultant360Sidebar />;
         default:
           return null;
       }
     };

     return (
       <div className="flex h-screen">
         {renderSidebar()}
         <div className="flex-1 flex flex-col">
           <Header />
           <main className="flex-1 overflow-auto">
             <Outlet /> {/* Dashboard content renders here */}
           </main>
         </div>
       </div>
     );
   }
   ```

5. **Setup Dynamic Routing**
   ```typescript
   // src/app/routes.tsx
   <Routes>
     <Route path="/login" element={<LoginPage />} />
     
     <Route path="/*" element={
       <ProtectedRoute>
         <UnifiedDashboardLayout />
       </ProtectedRoute>
     }>
       {/* Routes render different components based on user type */}
       <Route path="dashboard" element={<DynamicDashboard />} />
       <Route path="clients" element={<DynamicClients />} />
       {/* ... more routes */}
     </Route>
   </Routes>
   ```

6. **Create Dynamic Dashboard Component**
   ```typescript
   // src/pages/DynamicDashboard.tsx
   import { useAuth } from '@/contexts/AuthContext';
   import AdminDashboard from '@/modules/admin/dashboard/components/AdminDashboard';
   import ConsultantDashboard from '@/modules/consultant/dashboard/components/ConsultantDashboard';
   import SalesDashboard from '@/modules/sales/dashboard/components/SalesDashboard';
   import Consultant360Dashboard from '@/modules/consultant360/dashboard/components/Consultant360Dashboard';

   export function DynamicDashboard() {
     const { user } = useAuth();

     switch (user?.userType) {
       case 'ADMIN':
       case 'LICENSEE':
         return <AdminDashboard />;
       case 'CONSULTANT':
         return <ConsultantDashboard />;
       case 'SALES_AGENT':
         return <SalesDashboard />;
       case 'CONSULTANT_360':
         return <Consultant360Dashboard />;
       default:
         return <Navigate to="/login" />;
     }
   }
   ```

---

### Phase 4: Admin Module (BATCH MIGRATION)

**Goal:** Migrate all admin pages and features

**Batch 1: Copy All Admin Pages (~20 files)**

```bash
# Copy ALL admin pages in one batch
cp /hrm8/frontend/src/pages/hrm8/*.tsx \
   /hrm8-admin-staff/src/pages/admin/

# Verify all files copied
ls -la /hrm8-admin-staff/src/pages/admin/
```

**Batch 2: Copy All Admin Components**

```bash
# Copy admin-specific components
cp -r /hrm8/frontend/src/components/admin/* \
   /hrm8-admin-staff/src/modules/admin/components/
```

**Batch 3: Copy All Admin Services**

```bash
# Copy admin services
cp /hrm8/frontend/src/services/regionsService.ts \
   /hrm8/frontend/src/services/licenseesService.ts \
   /hrm8/frontend/src/services/companiesService.ts \
   /hrm8/frontend/src/services/jobAllocationService.ts \
   /hrm8/frontend/src/services/revenueService.ts \
   /hrm8/frontend/src/services/auditLogService.ts \
   /hrm8-admin-staff/src/modules/admin/services/
```

**Batch 4: Fix All Admin Imports**

```bash
# Fix import paths for all admin files
find /hrm8-admin-staff/src/pages/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|from "@/components/|from "@/shared/components/|g' \
  -e 's|from "@/components/admin/|from "@/modules/admin/components/|g' \
  -e 's|from "@/hooks/|from "@/shared/hooks/|g' \
  -e 's|from "@/lib/|from "@/shared/lib/|g' \
  -e 's|from "@/services/|from "@/modules/admin/services/|g'

find /hrm8-admin-staff/src/modules/admin -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|from "@/components/ui/|from "@/shared/components/ui/|g' \
  -e 's|from "@/components/common/|from "@/shared/components/common/|g'
```

**Batch 5: Test Admin Module**

```bash
# Run build to check for errors
pnpm run build

# Run dev server and test
pnpm run dev
```

**Pages Migrated in This Phase:**
1. ✅ Hrm8Dashboard.tsx → pages/admin/DashboardPage.tsx
2. ✅ RegionsPage.tsx → pages/admin/RegionsPage.tsx
3. ✅ RegionalLeadsPage.tsx → pages/admin/RegionalLeadsPage.tsx
4. ✅ RegionalCompaniesPage.tsx → pages/admin/RegionalCompaniesPage.tsx
5. ✅ RegionalSalesDashboard.tsx → pages/admin/RegionalSalesDashboard.tsx
6. ✅ LicenseesPage.tsx → pages/admin/LicenseesPage.tsx
7. ✅ JobAllocationPage.tsx → pages/admin/JobAllocationPage.tsx
8. ✅ RevenueDashboardPage.tsx → pages/admin/RevenueDashboardPage.tsx
9. ✅ AuditLogsPage.tsx → pages/admin/AuditLogsPage.tsx
10. ✅ CareersRequestsPage.tsx → pages/admin/CareersRequestsPage.tsx
11. ✅ ConversionRequestsPage.tsx → pages/admin/ConversionRequestsPage.tsx
12. ✅ Hrm8SettingsPage.tsx → pages/admin/SettingsPage.tsx
13. ✅ (+ any other admin pages found)

---

### Phase 5: Consultant Module (BATCH MIGRATION)

**Goal:** Migrate all consultant pages and features

**Batch 1: Copy All Consultant Pages (~15 files)**

```bash
# Copy ALL consultant pages
cp /hrm8/frontend/src/pages/consultant/*.tsx \
   /hrm8-admin-staff/src/pages/consultant/
```

**Batch 2: Copy Consultant Components**

```bash
cp -r /hrm8/frontend/src/components/consultant/* \
   /hrm8-admin-staff/src/modules/consultant/components/
```

**Batch 3: Copy Consultant Services**

```bash
cp /hrm8/frontend/src/services/consultantService.ts \
   /hrm8/frontend/src/services/clientsService.ts \
   /hrm8/frontend/src/services/candidatesService.ts \
   /hrm8/frontend/src/services/jobsService.ts \
   /hrm8/frontend/src/services/interviewsService.ts \
   /hrm8-admin-staff/src/modules/consultant/services/
```

**Batch 4: Fix Consultant Imports**

```bash
find /hrm8-admin-staff/src/pages/consultant -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|from "@/components/|from "@/shared/components/|g' \
  -e 's|from "@/components/consultant/|from "@/modules/consultant/components/|g' \
  -e 's|from "@/services/|from "@/modules/consultant/services/|g'
```

---

### Phase 6: Sales Module (BATCH MIGRATION)

**Goal:** Migrate all sales pages and features

**Batch 1: Copy All Sales Pages (~10 files)**

```bash
cp /hrm8/frontend/src/pages/sales/*.tsx \
   /hrm8-admin-staff/src/pages/sales/
```

**Batch 2: Copy Sales Components**

```bash
cp -r /hrm8/frontend/src/components/sales/* \
   /hrm8-admin-staff/src/modules/sales/components/
```

**Batch 3: Copy Sales Services**

```bash
cp /hrm8/frontend/src/services/salesService.ts \
   /hrm8/frontend/src/services/leadsService.ts \
   /hrm8/frontend/src/services/pipelineService.ts \
   /hrm8-admin-staff/src/modules/sales/services/
```

**Batch 4: Fix Sales Imports**

```bash
find /hrm8-admin-staff/src/pages/sales -name "*.tsx" -o -name "*.ts" | xargs sed -i '' \
  -e 's|from "@/components/|from "@/shared/components/|g' \
  -e 's|from "@/components/sales/|from "@/modules/sales/components/|g'
```

---

### Phase 7: Consultant360 Module (BATCH MIGRATION)

**Goal:** Migrate consultant360 pages and features

**Batch 1: Copy All Consultant360 Pages (~8 files)**

```bash
cp /hrm8/frontend/src/pages/consultant360/*.tsx \
   /hrm8-admin-staff/src/pages/consultant360/
```

**Batch 2: Copy Components & Services**

```bash
cp -r /hrm8/frontend/src/components/consultant360/* \
   /hrm8-admin-staff/src/modules/consultant360/components/

cp /hrm8/frontend/src/services/consultant360Service.ts \
   /hrm8-admin-staff/src/modules/consultant360/services/
```

**Batch 3: Fix Imports**

```bash
find /hrm8-admin-staff/src/pages/consultant360 -name "*.tsx" | xargs sed -i '' \
  -e 's|from "@/components/|from "@/shared/components/|g'
```

---

### Phase 8: Integration & Testing

**Goal:** Connect all modules and test thoroughly

**Steps:**

1. **Wire Up All Routes**
   ```typescript
   // Update src/app/routes.tsx with all migrated routes
   ```

2. **Test Each User Type Flow**
   - Login as Admin → Test all admin features
   - Login as Consultant → Test all consultant features
   - Login as Sales → Test all sales features
   - Login as Consultant360 → Test unified features

3. **Test Data Scoping**
   - Verify admins see all data
   - Verify consultants see only their company data
   - Verify sales agents see only their data
   - Verify Consultant360 sees appropriate combined data

4. **Test UI/UX Matches Exactly**
   - Side-by-side comparison with old frontend
   - Verify all interactions work identically
   - Test responsive design
   - Test all CRUD operations

5. **Performance Testing**
   - Check bundle size
   - Check page load times
   - Check API response times

---

## Verification Checklist

### For Each Migrated Page

- [ ] Page copied from old codebase
- [ ] All import paths fixed
- [ ] All components present and functional
- [ ] All API calls working (real endpoints)
- [ ] All forms submitting real data
- [ ] All tables displaying real data
- [ ] All filters/search working
- [ ] All modals/dialogs working
- [ ] UI matches old page exactly
- [ ] Responsive design working
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No stub/placeholder implementations

### For Each User Type

- [ ] Login working
- [ ] Dashboard loading correctly
- [ ] Sidebar showing correct items
- [ ] All routes accessible
- [ ] All features functional
- [ ] Data scoping correct
- [ ] Permissions enforced
- [ ] Logout working

---

## API Endpoints Reference

### Admin Endpoints
```
POST   /api/auth/hrm8/login
GET    /api/hrm8/dashboard/stats
GET    /api/hrm8/regions
POST   /api/hrm8/regions
PUT    /api/hrm8/regions/:id
DELETE /api/hrm8/regions/:id
GET    /api/hrm8/licensees
POST   /api/hrm8/licensees
GET    /api/hrm8/companies
GET    /api/hrm8/job-allocations
POST   /api/hrm8/job-allocations
GET    /api/hrm8/revenue
GET    /api/hrm8/audit-logs
```

### Consultant Endpoints
```
POST   /api/auth/consultant/login
GET    /api/consultant/dashboard/stats
GET    /api/consultant/clients
POST   /api/consultant/clients
GET    /api/consultant/candidates
GET    /api/consultant/jobs
GET    /api/consultant/interviews
POST   /api/consultant/interviews
```

### Sales Endpoints
```
POST   /api/auth/sales-agent/login
GET    /api/sales-agent/dashboard/stats
GET    /api/sales-agent/leads
POST   /api/sales-agent/leads
GET    /api/sales-agent/pipeline
PUT    /api/sales-agent/pipeline/:id
```

### Consultant360 Endpoints
```
POST   /api/auth/consultant360/login
GET    /api/consultant360/dashboard/stats
GET    /api/consultant360/analytics
```

---

## Common Issues & Solutions

### Issue 1: Import Path Errors

**Symptom:** Module not found errors after copying files

**Solution:**
```bash
# Use sed to batch fix all imports
find src/pages -name "*.tsx" | xargs sed -i '' \
  -e 's|@/components/|@/shared/components/|g'
```

### Issue 2: Missing Components

**Symptom:** Component not found after fixing imports

**Solution:**
1. Find component in old codebase
2. Copy to appropriate location in new codebase
3. Fix its imports
4. Repeat for all dependencies

### Issue 3: API Calls Failing

**Symptom:** 404 or network errors

**Solution:**
1. Check API endpoint matches backend
2. Verify token in headers
3. Check user type has access to endpoint
4. Verify backend route exists

### Issue 4: Wrong Dashboard Rendering

**Symptom:** Wrong dashboard shows for user type

**Solution:**
1. Check user.userType in token
2. Verify switch statement in UnifiedDashboardLayout
3. Check component imports are correct

---

## Timeline Estimate

**With Batch Copy Approach:**

- **Phase 0 (Setup):** 1 day
- **Phase 1 (Foundation):** 1 day (batch copy components)
- **Phase 2 (Auth):** 2 days (study old system + implement)
- **Phase 3 (Layout):** 1 day (copy + wire up)
- **Phase 4 (Admin):** 2-3 days (batch copy + fix + test)
- **Phase 5 (Consultant):** 2-3 days (batch copy + fix + test)
- **Phase 6 (Sales):** 1-2 days (batch copy + fix + test)
- **Phase 7 (Consultant360):** 1-2 days (batch copy + fix + test)
- **Phase 8 (Integration):** 2-3 days (testing all flows)

**Total:** 3-4 weeks (with AI assistance and batch copying)

---

## Success Criteria

✅ **Project is successful when:**

1. All 4 dashboards consolidated into one app
2. Multi-user-type authentication working
3. Single layout dynamically renders correct dashboard
4. All pages migrated with full functionality
5. UI/UX matches old frontend exactly
6. All API calls working (no stubs)
7. All CRUD operations functional
8. Data scoping working correctly
9. No console or TypeScript errors
10. Fast build and load times
11. Responsive design working
12. All user flows tested and working

---

## Important Reminders

1. **Always examine old codebase first** before implementing anything
2. **Copy in batches of 10+ files** for efficiency
3. **No stub implementations** - everything must be fully functional
4. **UI must match exactly** - compare screenshots
5. **Test with real API calls** - no mock data
6. **Fix imports in batch** using sed commands
7. **Test each user type thoroughly** after migration
8. **Update UPDATES.md** with detailed progress notes

---

**Last Updated:** January 29, 2026