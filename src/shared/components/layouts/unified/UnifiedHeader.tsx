import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { Input } from "@/shared/components/ui/input";
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
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
                {/* Main Header Row */}
                <div className="flex h-14 items-center gap-3 px-4 md:px-6">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-6" />

                    {/* Search Bar - Hidden on mobile, visible on desktop */}
                    <div className="flex-1 flex items-center gap-4">
                        <div
                            className="relative max-w-md w-full hidden md:block cursor-pointer group"
                            onClick={handleSearchClick}
                        >
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search everywhere..."
                                className="pl-10 pr-24 bg-muted/60 border-muted-foreground/20 hover:border-primary/50 transition-colors cursor-pointer rounded-full h-9 text-sm"
                                readOnly
                            />
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                                <Badge
                                    variant="outline"
                                    className="text-[10px] px-1.5 py-0.5 font-mono opacity-60 group-hover:opacity-100 transition-opacity flex items-center bg-background/50"
                                >
                                    <Command className="h-2.5 w-2.5 mr-0.5" />
                                    K
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="flex items-center gap-1.5 md:gap-3">
                        <ThemeToggle />
                        <NotificationBell />
                        <div className="h-8 w-[1px] bg-muted mx-1" />
                        <UserNav />
                    </div>
                </div>

                {/* Breadcrumbs Row */}
                <div className="px-6 h-10 border-t bg-muted/30 flex items-center justify-between gap-4">
                    <Breadcrumbs />
                </div>
            </header>
        </TooltipProvider>
    );
}
