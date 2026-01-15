import type { SignIn, UserProfile } from "@clerk/clerk-react";
import type { ComponentProps } from "react";
import { cn } from "./utils";

type SignInAppearance = NonNullable<
  ComponentProps<typeof SignIn>["appearance"]
>;
type UserProfileAppearance = NonNullable<
  ComponentProps<typeof UserProfile>["appearance"]
>;

const variables = {
  colorBackground: "var(--background)",
  colorInputBackground: "var(--surface)",
  colorInputText: "var(--foreground)",
  colorText: "var(--foreground)",
  colorTextSecondary: "var(--foreground-muted)",
  colorPrimary: "var(--primary)",
  colorDanger: "var(--destructive)",
  colorSuccess: "var(--success)",
  colorNeutral: "var(--foreground-subtle)",
  borderRadius: "0px",
  fontFamily: "'JetBrains Mono Variable', monospace",
  fontSize: "13px",
} as const;

const baseElements = {
  formFieldLabel: "text-xs text-foreground-muted",
  formFieldInput: cn(
    "bg-surface text-foreground text-xs",
    "border-border focus:border-primary focus:ring-primary/50",
    "placeholder:text-foreground-subtle",
  ),
  formButtonPrimary: cn(
    "bg-primary text-primary-foreground text-xs font-medium",
    "hover:bg-primary/90",
  ),
  alert: "bg-destructive/10 text-destructive border-destructive/20",
  alertText: "text-xs",
  footer: "hidden",
};

export const signInAppearance: SignInAppearance = {
  variables,
  elements: {
    ...baseElements,
    rootBox: "w-full",
    card: "bg-transparent shadow-none w-full m-0 p-4 gap-4",
    header: "gap-1",
    headerTitle: "text-sm font-medium text-foreground",
    headerSubtitle: "text-xs text-foreground-muted",
    socialButtonsBlockButton: cn(
      "bg-surface-raised border-border text-foreground",
      "hover:bg-surface-overlay",
      "ring-1 ring-foreground/10",
    ),
    socialButtonsBlockButtonText: "text-xs font-medium text-foreground",
    dividerLine: "bg-border",
    dividerText: "text-foreground-muted text-xs",
    footerActionLink: "text-primary hover:text-primary/80 text-xs",
    footerActionText: "text-foreground-muted text-xs",
    identityPreview: "bg-surface-raised border-border",
    identityPreviewText: "text-foreground text-xs",
    identityPreviewEditButton: "text-primary text-xs",
    formFieldSuccessText: "text-success text-xs",
    formFieldErrorText: "text-destructive text-xs",
    otpCodeFieldInput: "border-border bg-surface text-foreground",
  },
};

export const userProfileAppearance: UserProfileAppearance = {
  variables,
  elements: {
    ...baseElements,
    rootBox: "!w-full !max-w-none !bg-background",
    cardBox: "!w-full !max-w-none !bg-background !shadow-none",
    card: "!w-full !max-w-none !bg-background !shadow-none m-0 p-0",
    scrollBox: "!bg-background !shadow-none flex-1",
    navbar:
      "!bg-surface ![background-image:none] border-r border-border min-w-[220px]",
    navbarButton: cn(
      "text-foreground-muted text-xs",
      "hover:bg-surface-raised hover:text-foreground",
      "data-[active=true]:bg-surface-raised data-[active=true]:text-foreground",
    ),
    navbarButtonIcon: "w-4 h-4",
    pageScrollBox: "p-4 !bg-background",
    page: "gap-4 !bg-background",
    profilePage: "!bg-background",
    profilePage__security: "gap-4 !bg-background",
    profileSection: "!bg-background",
    profileSectionHeader: "!bg-background",
    profileSectionTitle: "text-sm font-medium text-foreground",
    profileSectionTitleText: "text-sm font-medium text-foreground",
    profileSectionContent: "gap-3 !bg-background",
    profileSectionPrimaryButton: cn(
      "bg-primary text-primary-foreground text-xs font-medium",
      "hover:bg-primary/90",
    ),
    formButtonReset: "text-foreground-muted text-xs hover:text-foreground",
    avatarBox: "w-16 h-16",
    avatarImage: "w-16 h-16",
    userPreviewMainIdentifier: "text-sm font-medium text-foreground",
    userPreviewSecondaryIdentifier: "text-xs text-foreground-muted",
    accordionTriggerButton: cn(
      "text-foreground text-xs",
      "hover:bg-surface-raised",
    ),
    accordionContent: "bg-surface-raised border-border",
    badge: "bg-surface-raised text-foreground-muted text-xs border-border",
    menuButton: cn(
      "text-foreground-muted text-xs",
      "hover:bg-surface-raised hover:text-foreground",
    ),
    menuList: "bg-surface-overlay border-border",
    menuItem: cn("text-foreground text-xs", "hover:bg-surface-raised"),
  },
};
