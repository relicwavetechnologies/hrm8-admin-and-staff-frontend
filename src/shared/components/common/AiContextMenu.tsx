/**
 * AiContextMenu
 *
 * A floating right-click context menu that surfaces "Ask AI about this [entity]".
 *
 * Two usage modes:
 *
 * 1. WRAPPER MODE — wraps children and listens for right-click:
 *    <AiContextMenu reference={ref}>
 *      <SomeRow />
 *    </AiContextMenu>
 *
 * 2. CONTROLLED MODE — parent controls position/visibility (e.g. DataTable via onRowContextMenu):
 *    <AiContextMenu reference={ref} position={{ x, y }} onClose={() => setRef(null)} />
 */

import { useRef, useState, useCallback, useEffect } from "react";
import { BotMessageSquare, Sparkles, X } from "lucide-react";
import { publishAiReference } from "@/shared/hooks/useAiReferences";
import { EntityReference } from "@/shared/types/ai-references";

interface MenuPosition {
    x: number;
    y: number;
}

interface AiContextMenuProps {
    /** The reference that will be published when user clicks "Ask AI" */
    reference: EntityReference;
    /**
     * CONTROLLED MODE: fixed pixel position of the menu.
     * When provided the menu is always rendered (no internal open state).
     */
    position?: MenuPosition;
    /**
     * CONTROLLED MODE: called when the menu should close.
     * Required when `position` is supplied.
     */
    onClose?: () => void;
    /** Extra menu items alongside "Ask AI" */
    extraItems?: Array<{
        label: string;
        icon?: React.ReactNode;
        onClick: () => void;
    }>;
    /** WRAPPER MODE: children that trigger the context menu on right-click */
    children?: React.ReactNode;
}

// ─── Shared floating menu UI ─────────────────────────────────────────────────

function FloatingMenu({
    reference,
    position,
    onClose,
    extraItems,
}: {
    reference: EntityReference;
    position: MenuPosition;
    onClose: () => void;
    extraItems?: AiContextMenuProps["extraItems"];
}) {
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on Escape or outside click
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        const onMouseDown = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        document.addEventListener("mousedown", onMouseDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.removeEventListener("mousedown", onMouseDown);
        };
    }, [onClose]);

    const handleAskAi = useCallback(() => {
        publishAiReference(reference);
        window.dispatchEvent(new Event("open-ai-panel"));
        onClose();
    }, [reference, onClose]);

    const accentColors: Record<string, string> = {
        job: "text-blue-600 dark:text-blue-400",
        candidate: "text-violet-600 dark:text-violet-400",
        company: "text-emerald-600 dark:text-emerald-400",
        application: "text-amber-600 dark:text-amber-400",
        consultant: "text-sky-600 dark:text-sky-400",
        custom: "text-muted-foreground",
    };
    const accentClass = accentColors[reference.entityType] ?? accentColors.custom;

    // Clamp to viewport so menu never clips outside the screen
    const clampedX = Math.min(position.x, window.innerWidth - 220);
    const clampedY = Math.min(position.y, window.innerHeight - 190);

    return (
        <div
            ref={menuRef}
            role="menu"
            aria-label="AI context menu"
            className="fixed z-[9999] min-w-[210px] rounded-xl border border-border/60 bg-popover shadow-xl shadow-black/10 dark:shadow-black/30 overflow-hidden animate-in fade-in-0 zoom-in-95 duration-100"
            style={{ top: clampedY, left: clampedX }}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border/50 bg-muted/30">
                <div className="flex items-center gap-1.5 min-w-0">
                    <Sparkles className={`h-3.5 w-3.5 shrink-0 ${accentClass}`} />
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60 truncate">
                        {reference.entityType}
                    </span>
                </div>
                <button
                    onClick={onClose}
                    className="rounded p-0.5 text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted transition-colors"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>

            {/* Record label */}
            <div className="px-3 py-1.5 border-b border-border/30">
                <p
                    className="text-xs font-medium text-foreground truncate max-w-[185px]"
                    title={reference.label}
                >
                    {reference.label}
                </p>
            </div>

            {/* Primary action */}
            <div className="py-1">
                <button
                    role="menuitem"
                    onClick={handleAskAi}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-xs font-medium text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent"
                >
                    <BotMessageSquare className={`h-3.5 w-3.5 shrink-0 ${accentClass}`} />
                    <span>
                        Ask AI about this{" "}
                        <span className={accentClass}>{reference.entityType}</span>
                    </span>
                </button>

                {extraItems?.map((item, i) => (
                    <button
                        key={i}
                        role="menuitem"
                        onClick={() => {
                            item.onClick();
                            onClose();
                        }}
                        className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus:bg-accent"
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── WrapperMode (uncontrolled) ───────────────────────────────────────────────

function WrapperMode({
    reference,
    extraItems,
    children,
}: {
    reference: EntityReference;
    extraItems?: AiContextMenuProps["extraItems"];
    children?: React.ReactNode;
}) {
    const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);

    const handleContextMenu = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setMenuPos({ x: e.clientX, y: e.clientY });
    }, []);

    return (
        <>
            <div onContextMenu={handleContextMenu} className="contents">
                {children}
            </div>
            {menuPos && (
                <FloatingMenu
                    reference={reference}
                    position={menuPos}
                    onClose={() => setMenuPos(null)}
                    extraItems={extraItems}
                />
            )}
        </>
    );
}

// ─── Public component ─────────────────────────────────────────────────────────

export function AiContextMenu({
    reference,
    position,
    onClose,
    extraItems,
    children,
}: AiContextMenuProps) {
    // CONTROLLED MODE — parent supplies position + onClose
    if (position !== undefined && onClose !== undefined) {
        return (
            <FloatingMenu
                reference={reference}
                position={position}
                onClose={onClose}
                extraItems={extraItems}
            />
        );
    }

    // WRAPPER MODE — intercepts right-click on children
    return (
        <WrapperMode reference={reference} extraItems={extraItems}>
            {children}
        </WrapperMode>
    );
}
