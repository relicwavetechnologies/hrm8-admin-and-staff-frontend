import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/shared/components/ui/command';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  BarChart3,
  Calendar,
  Settings,
  HelpCircle,
  Plus,
  UserPlus,
  Search,
  Clock,
  Target,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  category: 'navigation' | 'actions' | 'recent';
  keywords?: string[];
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Recent items from localStorage
  const [recentItems, setRecentItems] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('recent_pages') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    // Custom event listener for opening command palette
    const handleOpenEvent = () => setOpen(true);
    window.addEventListener('open-command-palette', handleOpenEvent);
    window.addEventListener('keydown', down);

    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('open-command-palette', handleOpenEvent);
    };
  }, []);

  // Track page visits
  useEffect(() => {
    const pageTitle = getPageTitle(location.pathname);
    if (pageTitle && !recentItems.includes(location.pathname)) {
      const updated = [location.pathname, ...recentItems.slice(0, 4)];
      setRecentItems(updated);
      localStorage.setItem('recent_pages', JSON.stringify(updated));
    }
  }, [location.pathname]);

  const navigationItems: CommandItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Overview and analytics',
      icon: LayoutDashboard,
      action: () => navigate('/dashboard'),
      category: 'navigation',
      keywords: ['home', 'overview'],
    },
    {
      id: 'candidates',
      title: 'Candidates',
      description: 'Manage candidates',
      icon: Users,
      action: () => navigate('/candidates'),
      category: 'navigation',
      keywords: ['people', 'applicants'],
    },
    {
      id: 'jobs',
      title: 'Jobs',
      description: 'View and manage job postings',
      icon: Briefcase,
      action: () => navigate('/ats/jobs'),
      category: 'navigation',
      keywords: ['positions', 'openings', 'vacancies'],
    },
    {
      id: 'applications',
      title: 'Applications',
      description: 'Track applications',
      icon: FileText,
      action: () => navigate('/applications'),
      category: 'navigation',
      keywords: ['submissions'],
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View reports and insights',
      icon: BarChart3,
      action: () => navigate('/analytics'),
      category: 'navigation',
      keywords: ['reports', 'metrics', 'stats'],
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Schedule and events',
      icon: Calendar,
      action: () => navigate('/calendar'),
      category: 'navigation',
      keywords: ['schedule', 'events'],
    },
    {
      id: 'recruitment-services',
      title: 'Recruitment Services',
      description: 'Manage recruitment service projects',
      icon: Target,
      action: () => navigate('/recruitment-services'),
      category: 'navigation',
      keywords: ['services', 'projects', 'clients'],
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Configure preferences',
      icon: Settings,
      action: () => navigate('/settings'),
      category: 'navigation',
      keywords: ['preferences', 'config'],
    },
    {
      id: 'help',
      title: 'Help Center',
      description: 'Get support',
      icon: HelpCircle,
      action: () => navigate('/help'),
      category: 'navigation',
      keywords: ['support', 'documentation'],
    },
  ];

  const actionItems: CommandItem[] = [
    {
      id: 'post-job',
      title: 'Post a New Job',
      description: 'Create a new job posting',
      icon: Plus,
      action: () => {
        navigate('/jobs/create');
        setOpen(false);
      },
      category: 'actions',
      keywords: ['create', 'new', 'add'],
    },
    {
      id: 'add-candidate',
      title: 'Add Candidate',
      description: 'Add a new candidate',
      icon: UserPlus,
      action: () => {
        navigate('/candidates/new');
        setOpen(false);
      },
      category: 'actions',
      keywords: ['create', 'new', 'add'],
    },
    {
      id: 'schedule-interview',
      title: 'Schedule Interview',
      description: 'Schedule a new interview',
      icon: Calendar,
      action: () => {
        navigate('/calendar');
        setOpen(false);
      },
      category: 'actions',
      keywords: ['create', 'new', 'add', 'meeting'],
    },
  ];

  const recentPageItems: CommandItem[] = recentItems
    .map((path) => {
      const navItem = navigationItems.find((item) => item.action.toString().includes(path));
      if (!navItem) return null;
      return {
        ...navItem,
        category: 'recent' as const,
      };
    })
    .filter(Boolean) as CommandItem[];

  const allItems = [...navigationItems, ...actionItems];

  const filteredItems = useMemo(() => {
    if (!search) return allItems;

    return allItems.filter((item) => {
      const searchLower = search.toLowerCase();
      return (
        item.title.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.keywords?.some((k) => k.toLowerCase().includes(searchLower))
      );
    });
  }, [search, allItems]);

  const handleSelect = (item: CommandItem) => {
    item.action();
    setOpen(false);
    setSearch('');
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {!search && recentPageItems.length > 0 && (
          <>
            <CommandGroup heading="Recent">
              {recentPageItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id}
                  onSelect={() => handleSelect(item)}
                >
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{item.title}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        <CommandGroup heading="Navigation">
          {filteredItems
            .filter((item) => item.category === 'navigation')
            .map((item) => (
              <CommandItem
                key={item.id}
                value={item.id}
                onSelect={() => handleSelect(item)}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">
                      {item.description}
                    </span>
                  )}
                </div>
              </CommandItem>
            ))}
        </CommandGroup>

        {filteredItems.some((item) => item.category === 'actions') && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Actions">
              {filteredItems
                .filter((item) => item.category === 'actions')
                .map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id}
                    onSelect={() => handleSelect(item)}
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>{item.title}</span>
                      {item.description && (
                        <span className="text-xs text-muted-foreground">
                          {item.description}
                        </span>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}

function getPageTitle(pathname: string): string | null {
  const routes: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/candidates': 'Candidates',
    '/ats/jobs': 'Jobs',
    '/ats/jobs/new': 'Create Job',
    '/applications': 'Applications',
    '/analytics': 'Analytics',
    '/calendar': 'Calendar',
    '/recruitment-services': 'Recruitment Services',
    '/settings': 'Settings',
    '/help': 'Help Center',
  };
  return routes[pathname] || null;
}