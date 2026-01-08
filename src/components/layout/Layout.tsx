import { GitCompare, Home, Search, Settings } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Layout() {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Library" },
    { path: "/search", icon: Search, label: "Search" },
    { path: "/compare", icon: GitCompare, label: "Compare" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-50">
      {/* Main content area with padding for bottom nav */}
      <main className="flex-1 overflow-y-auto pb-20">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Outlet />
        </div>
      </main>

      {/* Bottom navigation - fixed */}
      <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 safe-area-inset-bottom">
        <div className="flex items-center justify-around h-16 max-w-7xl mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-lg transition-colors flex-1",
                  isActive
                    ? "text-blue-400"
                    : "text-neutral-400 hover:text-neutral-50",
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
