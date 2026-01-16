import { UserProfile } from "@clerk/clerk-react";
import { Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/useMediaQuery";
import {
  userProfileAppearance,
  userProfileMobileAppearance,
} from "@/lib/clerkAppearance";
import { cn } from "@/lib/utils";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ProfileTab = "account" | "security";

function ProfileTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
}) {
  return (
    <div className="flex justify-center border-b border-border">
      <button
        type="button"
        onClick={() => onTabChange("account")}
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
          activeTab === "account"
            ? "text-primary border-b-2 border-primary"
            : "text-foreground-muted hover:text-foreground",
        )}
      >
        <User className="w-4 h-4" />
        Profile
      </button>
      <button
        type="button"
        onClick={() => onTabChange("security")}
        className={cn(
          "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors",
          activeTab === "security"
            ? "text-primary border-b-2 border-primary"
            : "text-foreground-muted hover:text-foreground",
        )}
      >
        <Shield className="w-4 h-4" />
        Security
      </button>
    </div>
  );
}

export function UserProfileDialog({
  open,
  onOpenChange,
}: UserProfileDialogProps) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<ProfileTab>("account");

  useEffect(() => {
    if (open && isMobile) {
      window.location.hash = activeTab === "account" ? "" : "/security";
    }
  }, [activeTab, open, isMobile]);

  useEffect(() => {
    if (!open) {
      setActiveTab("account");
      if (isMobile) {
        window.location.hash = "";
      }
    }
  }, [open, isMobile]);

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[95vh]">
          <DrawerHeader className="p-0">
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </DrawerHeader>
          <div className="overflow-y-auto flex-1">
            <UserProfile
              appearance={userProfileMobileAppearance}
              routing="hash"
            />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-[960px] p-0 overflow-hidden max-h-[85vh] overflow-y-auto bg-background"
      >
        <UserProfile appearance={userProfileAppearance} routing="hash" />
      </DialogContent>
    </Dialog>
  );
}
