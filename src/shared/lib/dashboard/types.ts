import type { DashboardType } from './dashboardTypes';

export interface DashboardWidget {
  id: string;
  type: 'stat' | 'chart' | 'activity';
  component: string;
  title: string;
  gridArea: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  props?: Record<string, any>;
  isVisible: boolean;
  isLocked?: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  dashboardType: DashboardType;
  widgets: DashboardWidget[];
  createdAt: Date;
  updatedAt: Date;
}
