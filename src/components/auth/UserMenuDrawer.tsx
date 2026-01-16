import { useClerk, useUser } from "@clerk/clerk-react";
import { LogOut, User } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface UserMenuDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onManageAccount: () => void;
}

export function UserMenuDrawer({
  open,
  onOpenChange,
  onManageAccount,
}: UserMenuDrawerProps) {
  const { user } = useUser();
  const { signOut } = useClerk();

  if (!user) return null;

  const initials = user.firstName
    ? user.firstName.charAt(0).toUpperCase()
    : (user.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() ?? "U");

  const handleManageAccount = () => {
    onOpenChange(false);
    setTimeout(() => onManageAccount(), 100);
  };

  const handleSignOut = () => {
    onOpenChange(false);
    signOut();
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="pb-0">
          <DrawerTitle className="sr-only">User menu</DrawerTitle>
          <div className="flex items-center gap-3 py-2">
            {user.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName ?? "User"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center text-lg font-medium">
                {initials}
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium text-foreground">
                {user.fullName ?? "User"}
              </span>
              <span className="text-xs text-foreground-muted">
                {user.emailAddresses[0]?.emailAddress}
              </span>
            </div>
          </div>
        </DrawerHeader>

        <div className="px-4 pb-6 pt-4 flex flex-col gap-2">
          <DrawerClose
            onClick={handleManageAccount}
            className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-foreground hover:bg-surface-raised transition-colors w-full text-left"
          >
            <User className="w-5 h-5 text-foreground-muted" />
            Manage account
          </DrawerClose>

          <DrawerClose
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            Sign out
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
