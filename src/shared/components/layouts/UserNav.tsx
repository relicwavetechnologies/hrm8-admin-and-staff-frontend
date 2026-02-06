import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/shared/stores/authStore";

export function UserNav() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const toTitleCase = (value: string) =>
    value
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0]?.toUpperCase() + part.slice(1))
      .join(' ');

  const nameFromEmail = (email?: string) => {
    if (!email) return '';
    const local = email.split('@')[0] || '';
    if (!local) return '';
    const cleaned = local.replace(/[^a-zA-Z0-9._-]/g, ' ');
    const words = cleaned.split(/[._-]+/).filter(Boolean);
    if (words.length === 0) return local;
    return toTitleCase(words.join(' '));
  };

  const getInitials = (firstName?: string, lastName?: string, email?: string) => {
    const f = firstName?.trim() || '';
    const l = lastName?.trim() || '';
    if (f || l) {
      const firstInitial = f[0] || '';
      const lastInitial = l[0] || '';
      return (firstInitial + lastInitial).toUpperCase();
    }
    const fallbackName = nameFromEmail(email);
    if (!fallbackName) return 'U';
    const parts = fallbackName.split(/\s+/).filter(Boolean);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
  };

  const getProfilePath = () => {
    if (!user) return null;
    switch (user.type) {
      case "ADMIN":
        return `/hrm8/profile`;
      case "CONSULTANT":
        return "/consultant/profile";
      case "SALES_AGENT":
        return "/sales-agent/profile";
      case "CONSULTANT360":
        return "/consultant360/profile";
      default:
        return null;
    }
  };

  const getSettingsPath = () => {
    if (!user) return null;
    switch (user.type) {
      case "ADMIN":
        return "/hrm8/settings";
      case "CONSULTANT":
        return "/consultant/settings";
      case "SALES_AGENT":
        return "/sales-agent/settings";
      case "CONSULTANT360":
        return "/consultant360/settings";
      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ');
  const displayName = fullName || nameFromEmail(user.email) || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full border">
          <Avatar className="h-9 w-9">
            <AvatarImage src="" alt={fullName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold uppercase">
              {getInitials(user.firstName, user.lastName, user.email)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold leading-tight">{displayName}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">{user.email}</p>
            <div className="mt-1 inline-flex w-fit items-center rounded-full border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              {user.type} • {user.role}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => {
              const path = getProfilePath();
              if (path) navigate(path);
            }}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              const path = getSettingsPath();
              if (path) navigate(path);
            }}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
