import { useEffect, useState } from "react";

export type ThemeId = "gruvbox-dark" | "catppuccin-mocha" | "solarized-light";
export type ThemeGroup = "dark" | "light";

export interface Theme {
  id: ThemeId;
  name: string;
  group: ThemeGroup;
}

export const THEMES: Theme[] = [
  { id: "gruvbox-dark", name: "Gruvbox", group: "dark" },
  { id: "catppuccin-mocha", name: "Catppuccin", group: "dark" },
  { id: "solarized-light", name: "Solarized", group: "light" },
];

const STORAGE_KEY = "curator-theme";
const DEFAULT_THEME: ThemeId = "gruvbox-dark";

function getStoredTheme(): ThemeId {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEMES.some((t) => t.id === stored)) {
    return stored as ThemeId;
  }
  return DEFAULT_THEME;
}

function applyTheme(themeId: ThemeId): void {
  const root = document.documentElement;

  for (const theme of THEMES) {
    root.classList.remove(`theme-${theme.id}`);
  }
  root.classList.add(`theme-${themeId}`);
}

export function useTheme(): {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: Theme[];
  currentTheme: Theme;
} {
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const currentTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return { theme, setTheme, themes: THEMES, currentTheme };
}
