import { GitCompare, Home, Search, Settings } from "lucide-react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", icon: Home, label: "Library" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/compare", icon: GitCompare, label: "Compare" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t border-neutral-800 safe-area-inset-bottom md:hidden z-50">
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
  );
}

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-56 bg-neutral-900 border-r border-neutral-800 h-screen fixed left-0 top-0 z-50">
      <div className="p-4 border-b border-neutral-800">
        <h1 className="text-lg font-bold text-neutral-50">Curator</h1>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors",
                isActive
                  ? "bg-blue-600/10 text-blue-400"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-neutral-50",
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export function Layout() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50">
      <Sidebar />

      {/* Main content area */}
      <main className="pb-20 md:pb-0 md:ml-56">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
