import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import { Home, ChevronRight } from 'lucide-react';

interface RouteInfo {
  title: string;
  path: string;
}

const routeMap: Record<string, string> = {
  dashboard: 'Dashboard',
  candidates: 'Candidates',
  jobs: 'Jobs',
  applications: 'Applications',
  analytics: 'Analytics',
  calendar: 'Calendar',
  settings: 'Settings',
  help: 'Help Center',
  hrm8: 'HRM8',
  consultant: 'Consultant',
  candidate: 'Candidate',
  regions: 'Regions',
  licensees: 'Licensees',
  consultants: 'Consultants',
  commissions: 'Commissions',
  revenue: 'Revenue',
  reports: 'Reports',
  profile: 'Profile',
  'saved-jobs': 'Saved Jobs',
  messages: 'Messages',
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) {
    return null;
  }

  // Determine home path based on route prefix
  const firstSegment = pathSegments[0];
  let homePath = '/home';
  if (firstSegment === 'hrm8') {
    homePath = '/hrm8/dashboard';
  } else if (firstSegment === 'consultant') {
    homePath = '/consultant/dashboard';
  } else if (firstSegment === 'candidate') {
    homePath = '/candidate/dashboard';
  }

  const breadcrumbs: RouteInfo[] = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const title = routeMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { title, path };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs gap-1 flex-nowrap">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to={homePath} className="flex items-center gap-1 text-muted-foreground/70 hover:text-foreground transition-colors">
              <Home className="h-3 w-3" />
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbs.map((crumb, index) => (
          <span key={crumb.path} className="flex items-center gap-1">
            <BreadcrumbSeparator className="[&>svg]:h-3 [&>svg]:w-3">
              <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {index === breadcrumbs.length - 1 ? (
                <BreadcrumbPage className="font-medium text-foreground/90 truncate max-w-[150px]">{crumb.title}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={crumb.path} className="text-muted-foreground/60 hover:text-foreground transition-colors truncate max-w-[120px]">{crumb.title}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </span>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}