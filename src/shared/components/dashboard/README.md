# Dashboard Components Documentation

## EnhancedStatCard

A versatile component for displaying statistics on dashboards with rich visual features, action menus, and consistent styling.

### Usage

```tsx
import { EnhancedStatCard } from "@/components/dashboard/EnhancedStatCard";
import { DollarSign } from "lucide-react";

<EnhancedStatCard
  title="Total Revenue"
  value=""
  isCurrency={true}
  rawValue={2400000}
  change="+12.5%"
  trend="up"
  icon={<DollarSign className="h-6 w-6" />}
  variant="success"
  showMenu={true}
  menuItems={[
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4" />,
      onClick: () => navigate('/revenue')
    }
  ]}
/>
```

### Props

```typescript
interface EnhancedStatCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: "up" | "down";
  icon?: React.ReactNode;
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "neutral";
  
  // Action button
  showAction?: boolean;
  actionLabel?: string;
  onAction?: () => void;
  
  // Menu
  showMenu?: boolean;
  menuItems?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
  }>;
  
  // Currency formatting
  isCurrency?: boolean;
  rawValue?: number;
  
  // Styling
  size?: "sm" | "default" | "lg";
  layout?: "horizontal" | "vertical";
  elevation?: "none" | "sm" | "md" | "lg";
  showGradient?: boolean;
  showBorder?: boolean;
  iconPosition?: "left" | "right";
}
```

### Currency Formatting

For currency values, use `isCurrency` and `rawValue` props:

```tsx
<EnhancedStatCard
  title="Revenue"
  value=""
  isCurrency={true}
  rawValue={2400000}  // Numeric value only
/>
```

This automatically formats based on user's currency preference (USD/EUR/GBP).

### Variants

- **primary**: Blue - Information and data metrics
- **success**: Green - Positive metrics, revenue, growth
- **warning**: Orange - Metrics needing attention
- **neutral**: Purple - Standard metrics
- **secondary**: Alternative styling
- **default**: Base styling

### Action Menus

Add contextual actions with the menu:

```tsx
menuItems={[
  {
    label: "View Details",
    icon: <Eye className="h-4 w-4" />,
    onClick: () => navigate('/details')
  },
  {
    label: "Export",
    icon: <Download className="h-4 w-4" />,
    onClick: handleExport
  }
]}
```

Common menu actions:
- View Details (Eye icon)
- Create New (Plus icon)
- Export Data (Download icon)
- View Analytics (BarChart3 icon)
- Filter (Filter icon)

---

## Dashboard Filter Standards

All dashboard pages must implement a consistent filter bar in the header.

### Required Components

Every dashboard page MUST have:
1. **DateRangePicker** - For filtering data by date range
2. **Export Button** - For exporting dashboard data

### Standard Implementation

```tsx
import { useState } from "react";
import { DateRangePicker } from "@/components/ui/date-range-picker-v2";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";

export default function YourDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const { toast } = useToast();

  const handleExport = () => {
    toast({
      title: "Exporting Dashboard Data",
      description: "Preparing your export...",
    });
  };

  return (
    <DashboardPageLayout
      breadcrumbActions={
        <div className="flex items-center gap-3">
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Select period"
            align="end"
          />
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      }
    >
      {/* Dashboard content */}
    </DashboardPageLayout>
  );
}
```

### What NOT to Include

❌ **Department filters** - Removed for consistency across dashboards  
❌ **Custom select dropdowns** - Use DateRangePicker for time-based filtering only  
❌ **Multiple filter controls** - Keep it simple with date range and export

### DateRangePicker Features

The DateRangePicker component (`date-range-picker-v2.tsx`) supports:
- Quick presets (Last 7 days, Last 30 days, This month, This year, etc.)
- Month picker for selecting entire months
- Year picker for selecting entire years
- Custom range selection with dual calendar view
- Smart display formatting (e.g., "January 2024" for full months)

### Dashboard vs List Pages

**Dashboard Pages** (use DateRangePicker):
- Overview dashboards
- Analytics pages (Job Analytics, HR Analytics, Sales Dashboard, etc.)
- Dashboard views with stat cards and charts
- RPO operations dashboards

**List/Management Pages** (DON'T add DateRangePicker):
- Candidates page
- Jobs page
- Employers page
- HRMS employee list
- Consultants page
- These pages have their own comprehensive filter systems for table filtering

### Migration Checklist

When updating a dashboard page:
- [ ] Import DateRangePicker from `@/components/ui/date-range-picker-v2`
- [ ] Import DateRange type from `react-day-picker`
- [ ] Add `useState` for dateRange
- [ ] Add DateRangePicker to breadcrumbActions or header
- [ ] Remove any department filter dropdowns
- [ ] Ensure Export button is present with Download icon
- [ ] Add handleExport function with toast notification
- [ ] Test date range selection and export functionality
- [ ] Verify responsive layout on mobile

---

## Design Tokens

Use semantic tokens from the design system (`index.css` and `tailwind.config.ts`):

### Colors
```tsx
// ✅ Correct - using semantic tokens
className="bg-background text-foreground"
className="bg-primary text-primary-foreground"
className="bg-card border-border"

// ❌ Wrong - hardcoded colors
className="bg-white text-black"
className="bg-blue-500 text-white"
```

### Spacing & Sizing
```tsx
// Standard card padding
p-6  // EnhancedStatCard default size

// Icon sizes
h-6 w-6  // Card icons
h-4 w-4  // Menu item icons
```

### Borders & Effects
```tsx
// Left border accent (6px)
border-l-[6px] border-l-primary

// Hover effects
hover:shadow-lg hover:-translate-y-1 transition-all duration-200
```

---

## Best Practices

### Card Usage

1. **Use consistent sizing**: Default `size="default"` for most cards
2. **Apply semantic variants**: Choose variants based on metric meaning
3. **Add action menus**: Provide quick access to related features
4. **Currency formatting**: Always use `isCurrency` and `rawValue` for money
5. **Meaningful icons**: Select icons that represent the metric
6. **Hover states**: All cards should have hover effects enabled

### Dashboard Layout

1. **Responsive grids**: Use `grid gap-4 md:grid-cols-2 lg:grid-cols-3`
2. **Consistent spacing**: Use `space-y-6` for vertical spacing
3. **Filter placement**: Always in header/breadcrumbActions
4. **Export functionality**: Include on every dashboard
5. **Loading states**: Handle data loading gracefully

### Common Patterns

**Sales Metrics:**
```tsx
<EnhancedStatCard
  title="Total Revenue"
  value=""
  isCurrency={true}
  rawValue={totalRevenue}
  variant="success"
  icon={<DollarSign className="h-6 w-6" />}
/>
```

**Count Metrics:**
```tsx
<EnhancedStatCard
  title="Active Users"
  value={activeUsers.toString()}
  change="+12 this month"
  trend="up"
  variant="primary"
  icon={<Users className="h-6 w-6" />}
/>
```

**Percentage Metrics:**
```tsx
<EnhancedStatCard
  title="Conversion Rate"
  value={`${conversionRate.toFixed(1)}%`}
  change="+2.1% vs last quarter"
  trend="up"
  variant="success"
  icon={<TrendingUp className="h-6 w-6" />}
/>
```

---

## Deprecated Components

The following components are deprecated and should NOT be used in new code:

- ❌ `StatsCard` - Use `EnhancedStatCard` instead
- ❌ `EmailStatsCard` - Use `EnhancedStatCard` with custom props
- ❌ Inline Card implementations - Use `EnhancedStatCard`

**Exception:** `ConsultantMetricCard` is still used in specific consultant contexts where specialized layout is required.

---

## Examples by Dashboard Type

### Sales Dashboard
```tsx
<EnhancedStatCard
  title="Pipeline Value"
  value=""
  isCurrency={true}
  rawValue={pipelineValue}
  change={`${coverage}% quota coverage`}
  variant="primary"
  icon={<TrendingUp className="h-6 w-6" />}
  showMenu={true}
  menuItems={[
    { label: "View Pipeline", icon: <Eye />, onClick: () => {} },
    { label: "Add Opportunity", icon: <Plus />, onClick: () => {} }
  ]}
/>
```

### HR Analytics
```tsx
<EnhancedStatCard
  title="Total Employees"
  value={employeeCount.toString()}
  change="+4.2% vs last year"
  trend="up"
  variant="neutral"
  icon={<Users className="h-6 w-6" />}
  showMenu={true}
  menuItems={[
    { label: "View All", icon: <Eye />, onClick: () => {} },
    { label: "Add Employee", icon: <Plus />, onClick: () => {} }
  ]}
/>
```

### RPO Dashboard
```tsx
<EnhancedStatCard
  title="Monthly Recurring Revenue"
  value=""
  isCurrency={true}
  rawValue={mrr}
  change="+8% vs last month"
  trend="up"
  variant="success"
  icon={<DollarSign className="h-6 w-6" />}
  showMenu={true}
  menuItems={[
    { label: "View MRR Report", icon: <BarChart3 />, onClick: () => {} },
    { label: "Export", icon: <Download />, onClick: handleExport }
  ]}
/>
```

---

## cardActions.ts

Use the `getCardActions()` utility to retrieve dashboard-specific action menus:

```tsx
import { getCardActions } from "@/lib/cardActions";

const actions = getCardActions("sales");
// Returns: { icon: DollarSign, actions: [...] }
```

Supported dashboard types:
- `jobs` - Job posting actions
- `hrms` - HR management actions
- `financial` - Financial actions
- `sales` - Sales pipeline actions
- `rpo` - RPO contract actions
- `consulting` - Consulting project actions

---

## Testing

When implementing or updating dashboard cards:

1. Verify all cards use EnhancedStatCard
2. Check currency formatting with different locales
3. Test action menus appear and function correctly
4. Verify hover effects work
5. Test responsive layout on mobile
6. Ensure consistent spacing and alignment
7. Check dark mode styling
8. Verify DateRangePicker functionality
9. Test export button behavior
10. Validate no console errors
