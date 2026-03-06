import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  Users,
  Calendar,
  TrendingUp,
  Clock,
  DollarSign,
  Lock
} from "lucide-react";
import { usePermissions } from "@/shared/hooks/usePermissions";

export function ModuleQuickAccessCard() {
  const navigate = useNavigate();
  const { hasModuleAccess } = usePermissions();

  const modules = [
    {
      id: 'ats',
      name: 'Applicant Tracking',
      description: 'Manage jobs and candidates',
      icon: Briefcase,
      path: '/candidates',
      module: 'ats.candidates' as const,
      color: 'text-blue-500',
    },
    {
      id: 'hrms',
      name: 'HR Management',
      description: 'Employee management',
      icon: Users,
      path: '/hrms',
      module: 'hrms.employees' as const,
      color: 'text-green-500',
    },
    {
      id: 'interviews',
      name: 'Interviews',
      description: 'Schedule and track',
      icon: Calendar,
      path: '/interviews',
      module: 'ats.interviews' as const,
      color: 'text-purple-500',
    },
    {
      id: 'reports',
      name: 'Reports',
      description: 'Analytics and insights',
      icon: TrendingUp,
      path: '/reports',
      module: 'ats.reports' as const,
      color: 'text-orange-500',
    },
    {
      id: 'attendance',
      name: 'Attendance',
      description: 'Track work hours',
      icon: Clock,
      path: '/hrms/attendance',
      module: 'hrms.attendance' as const,
      color: 'text-cyan-500',
    },
    {
      id: 'payroll',
      name: 'Payroll',
      description: 'Manage compensation',
      icon: DollarSign,
      path: '/hrms/payroll',
      module: 'hrms.payroll' as const,
      color: 'text-emerald-500',
    },
  ];

  const accessibleModules = modules.filter(m => hasModuleAccess(m.module));
  const lockedModules = modules.filter(m => !hasModuleAccess(m.module));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Access</CardTitle>
        <CardDescription>
          Jump to your most used modules
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {accessibleModules.map((module) => {
            const Icon = module.icon;
            return (
              <Button
                key={module.id}
                variant="outline"
                className="h-auto flex flex-col items-start p-4 hover:bg-muted"
                onClick={() => navigate(module.path)}
              >
                <div className="flex items-center gap-2 w-full mb-2">
                  <Icon className={`h-5 w-5 ${module.color}`} />
                  <Badge variant="default" className="ml-auto text-xs">Active</Badge>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">{module.name}</p>
                  <p className="text-xs text-muted-foreground">{module.description}</p>
                </div>
              </Button>
            );
          })}

          {lockedModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                className="relative h-auto flex flex-col items-start p-4 border rounded-md bg-muted/50 opacity-60"
              >
                <div className="flex items-center gap-2 w-full mb-2">
                  <Icon className={`h-5 w-5 ${module.color}`} />
                  <Badge variant="secondary" className="ml-auto text-xs">
                    <Lock className="h-3 w-3 mr-1" />
                    Locked
                  </Badge>
                </div>
                <div className="text-left">
                  <p className="font-semibold text-sm">{module.name}</p>
                  <p className="text-xs text-muted-foreground">{module.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {lockedModules.length > 0 && (
          <div className="mt-4 text-center">
            <Button
              variant="link"
              size="sm"
              onClick={() => navigate('/settings?tab=subscription')}
            >
              Upgrade to unlock more modules
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
