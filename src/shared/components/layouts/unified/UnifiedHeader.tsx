import { SidebarTrigger } from "@/shared/components/ui/sidebar";
import { Separator } from "@/shared/components/ui/separator";
import { Search, Command, MessageSquare, PanelRightOpen, PanelRightClose } from "lucide-react";
import { UserNav } from "@/shared/components/layouts/UserNav";
import { NotificationBell } from "@/shared/components/notifications/NotificationBell";
import { Breadcrumbs } from "@/shared/components/common/Breadcrumbs";
import { ThemeToggle } from "@/shared/components/common/ThemeToggle";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { Button } from "@/shared/components/ui/button";

interface UnifiedHeaderProps {
    showAiToggle?: boolean;
    isAiOpen?: boolean;
    onToggleAi?: () => void;
}

export function UnifiedHeader({ showAiToggle = false, isAiOpen = false, onToggleAi }: UnifiedHeaderProps) {
    const handleSearchClick = () => {
        const event = new CustomEvent("open-command-palette");
        window.dispatchEvent(event);
    };

    return (
        <TooltipProvider>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
                <div className="relative flex h-14 items-center gap-3 px-4 md:px-6">
                    {/* Left: Sidebar trigger + Breadcrumbs */}
                    <div className="flex items-center gap-3 min-w-0">
                        <SidebarTrigger className="shrink-0 rounded-md" />
                        <Separator orientation="vertical" className="h-5 shrink-0" />
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
                        <div className="flex items-center gap-2 h-9 rounded-md border bg-background px-3 transition-colors group-hover:bg-accent">
                            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-sm text-muted-foreground truncate">Search...</span>
                            <kbd className="ml-auto inline-flex h-5 shrink-0 items-center rounded border px-1.5 text-[10px] font-mono text-muted-foreground">
                                <Command className="h-2.5 w-2.5 mr-0.5" />
                                K
                            </kbd>
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
                        {showAiToggle && (
                            <Button
                                type="button"
                                variant={isAiOpen ? "secondary" : "outline"}
                                size="sm"
                                className="h-8 px-2.5"
                                onClick={onToggleAi}
                                title="Toggle AI Assistant"
                            >
                                {isAiOpen ? <PanelRightClose className="h-4 w-4 mr-1.5" /> : <PanelRightOpen className="h-4 w-4 mr-1.5" />}
                                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                                <span className="text-xs">AI</span>
                            </Button>
                        )}
                        <ThemeToggle />
                        <NotificationBell />
                        <Separator orientation="vertical" className="h-5 mx-1 hidden md:block" />
                        <UserNav />
                    </div>
                </div>
            </header>
        </TooltipProvider>
    );
}
