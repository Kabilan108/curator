import { useClerk, useUser } from "@clerk/clerk-react";
import { LogOut, User } from "lucide-react";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { UserProfileDialog } from "./UserProfileDialog";

interface UserMenuProps {
  collapsed?: boolean;
}

export function UserMenu({ collapsed = false }: UserMenuProps) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [profileOpen, setProfileOpen] = useState(false);

  if (!user) return null;

  const initials = user.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : (user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() ?? "U");

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={cn(
            "flex items-center rounded-md transition-colors text-foreground-muted hover:bg-surface-raised hover:text-foreground outline-none",
            collapsed ? "w-10 h-10 justify-center" : "gap-3 px-3 py-2.5 w-full",
          )}
        >
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName ?? "User"}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
              {initials}
            </div>
          )}
          {!collapsed && (
            <span className="text-sm font-medium truncate">
              {user.fullName ??
                user.emailAddresses[0]?.emailAddress ??
                "Account"}
            </span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side={collapsed ? "right" : "top"}
          align="start"
          sideOffset={8}
          className="min-w-[200px]"
        >
          <div className="flex items-center gap-3 px-2 py-3">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName ?? "User"}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium">
                {initials}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {user.fullName ?? "User"}
              </span>
              <span className="text-xs text-foreground-muted truncate max-w-[140px]">
                {user.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setTimeout(() => setProfileOpen(true), 100);
            }}
          >
            <User />
            Manage account
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={() => signOut()}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <UserProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
    </>
  );
}
