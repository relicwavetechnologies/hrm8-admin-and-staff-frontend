import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { Input } from "@/shared/components/ui/input";
import { Search, Command } from "lucide-react";
import { Hrm8UserNav } from "./Hrm8UserNav";
import { NotificationBell } from "@/shared/components/notifications/NotificationBell";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Breadcrumbs } from "@/shared/components/common/Breadcrumbs";
import { Badge } from "@/shared/components/ui/badge";
import { ThemeToggle } from "@/shared/components/common/ThemeToggle";
import { ReactNode } from "react";

interface Hrm8HeaderProps {
    breadcrumbActions?: ReactNode;
}

export function Hrm8Header({ breadcrumbActions }: Hrm8HeaderProps = {}) {
    const handleSearchClick = () => {
        const event = new CustomEvent("open-command-palette");
        window.dispatchEvent(event);
    };

    return (
        <TooltipProvider>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-14 items-center gap-3 px-5">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-6" />

                    <div className="flex-1 flex items-center gap-4">
                        <div
                            className="relative max-w-md w-full hidden md:block cursor-pointer group"
                            onClick={handleSearchClick}
                        >
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search everywhere..."
                                className="pl-10 pr-24 bg-muted/50 cursor-pointer"
                                readOnly
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0.5 font-mono opacity-60 group-hover:opacity-100 transition-opacity"
                                >
                                    <Command className="h-2.5 w-2.5 mr-0.5" />
                                    K
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <NotificationBell />
                        <Hrm8UserNav />
                    </div>
                </div>

                {/* Breadcrumbs Row */}
                <div className="px-6 h-10 border-t bg-muted/30 flex items-center justify-between gap-4">
                    <Breadcrumbs />
                    {breadcrumbActions && (
                        <div className="flex items-center gap-2">{breadcrumbActions}</div>
                    )}
                </div>
            </header>
        </TooltipProvider>
    );
}
