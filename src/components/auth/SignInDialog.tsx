import { SignIn } from "@clerk/clerk-react";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { signInAppearance } from "@/lib/clerkAppearance";
import { cn } from "@/lib/utils";

interface SignInButtonProps {
  collapsed?: boolean;
  variant?: "sidebar" | "bottom-nav";
}

export function SignInDialog({
  collapsed = false,
  variant = "sidebar",
}: SignInButtonProps) {
  const [open, setOpen] = useState(false);

  const triggerButton =
    variant === "bottom-nav" ? (
      <button
        type="button"
        className="flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors flex-1 text-foreground-muted hover:text-foreground"
      >
        <LogIn className="w-6 h-6" />
        <span className="text-xs font-medium">Sign In</span>
      </button>
    ) : (
      <button
        type="button"
        className={cn(
          "flex items-center rounded-md transition-colors text-foreground-muted hover:bg-surface-raised hover:text-foreground",
          collapsed ? "w-10 h-10 justify-center" : "gap-3 px-3 py-2.5 w-full",
        )}
      >
        <LogIn className="w-5 h-5 shrink-0" />
        {!collapsed && <span className="text-sm font-medium">Sign In</span>}
      </button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={triggerButton} />
      <DialogContent
        showCloseButton={true}
        className="sm:max-w-[400px] p-0 overflow-hidden"
      >
        <SignIn appearance={signInAppearance} routing="hash" />
      </DialogContent>
    </Dialog>
  );
}
