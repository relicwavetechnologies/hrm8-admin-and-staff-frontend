import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { Search, Command } from "lucide-react";
import { UserNav } from "@/shared/components/layouts/UserNav";
import { NotificationBell } from "@/shared/components/notifications/NotificationBell";
import { Breadcrumbs } from "@/shared/components/common/Breadcrumbs";
import { Badge } from "@/shared/components/ui/badge";
import { ThemeToggle } from "@/shared/components/common/ThemeToggle";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

export function UnifiedHeader() {
    const handleSearchClick = () => {
        const event = new CustomEvent("open-command-palette");
        window.dispatchEvent(event);
    };

    return (
        <TooltipProvider>
            <header className="sticky top-0 z-50 w-full shadow-sm">
                {/* Thin top accent line */}
                <div className="h-[2px] w-full bg-gradient-to-r from-primary/60 via-primary/80 to-violet-500/60" />

                {/* Single unified row */}
                <div className="relative flex h-14 items-center gap-3 px-4 md:px-6 bg-background/95 backdrop-blur-xl border-b border-border/50">
                    {/* Left: Sidebar trigger + Breadcrumbs */}
                    <div className="flex items-center gap-3 min-w-0">
                        <SidebarTrigger className="shrink-0 hover:bg-accent/60 transition-colors rounded-lg" />
                        <Separator orientation="vertical" className="h-5 shrink-0 bg-border/60" />
                        <div className="hidden sm:block min-w-0 overflow-hidden">
                            <Breadcrumbs />
                        </div>
                    </div>

                    {/* Center spacer */}
                    <div className="flex-1" />

                    {/* Center/Right: Search bar */}
                    <div
                        className="relative max-w-xs w-full hidden md:block cursor-pointer group"
                        onClick={handleSearchClick}
                    >
                        <div className="flex items-center gap-2 px-3.5 h-9 rounded-full bg-muted border border-border hover:border-primary/50 hover:bg-accent transition-all duration-200 group-hover:shadow-sm">
                            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm text-muted-foreground truncate">Search...</span>
                            <Badge
                                variant="outline"
                                className="ml-auto text-[10px] px-1.5 py-0 font-mono opacity-70 group-hover:opacity-100 transition-opacity flex items-center bg-background border-border shrink-0"
                            >
                                <Command className="h-2.5 w-2.5 mr-0.5" />
                                K
                            </Badge>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                        <ThemeToggle />
                        <NotificationBell />
                        <Separator orientation="vertical" className="h-5 mx-1 bg-border/40 hidden md:block" />
                        <UserNav />
                    </div>
                </div>
            </header>
        </TooltipProvider>
    );
}
