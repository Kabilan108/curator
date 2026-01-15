import { UserProfile } from "@clerk/clerk-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { userProfileAppearance } from "@/lib/clerkAppearance";

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserProfileDialog({
  open,
  onOpenChange,
}: UserProfileDialogProps) {
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
