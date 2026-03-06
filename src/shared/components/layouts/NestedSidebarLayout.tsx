import { ReactNode } from "react";

export interface NestedSidebarItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface NestedSidebarLayoutProps {
  title: string;
  subtitle?: string;
  backPath?: string;
  backLabel?: string;
  items: NestedSidebarItem[];
  children: ReactNode;
}

export function NestedSidebarLayout({ children }: NestedSidebarLayoutProps) {
  return <main className="flex-1 min-w-0">{children}</main>;
}
