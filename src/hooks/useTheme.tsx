import {
  createContext,
  type ReactNode,
  useContext,
  useLayoutEffect,
  useState,
} from "react";

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

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  themes: Theme[];
  currentTheme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeId>(getStoredTheme);

  useLayoutEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const currentTheme = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <ThemeContext.Provider
      value={{ theme, setTheme, themes: THEMES, currentTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
