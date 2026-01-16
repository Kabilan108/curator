import { SignIn } from "@clerk/clerk-react";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { signInAppearance } from "@/lib/clerkAppearance";

interface SignInButtonProps {
  variant?: "header" | "bottom-nav";
}

export function SignInDialog({ variant = "header" }: SignInButtonProps) {
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
        className="w-8 h-8 rounded-full bg-surface-raised flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-surface-raised/80 transition-colors"
      >
        <LogIn className="w-4 h-4" />
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
