import { useState } from "react";
import { NavLink } from "@/components/NavLink";
import { BarChart3, TrendingUp, DollarSign, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";

const menuItems = [
  {
    title: "Painel Comercial",
    path: "/app/comercial",
    icon: TrendingUp,
  },
  {
    title: "Painel Operacional",
    path: "/app/operacional",
    icon: BarChart3,
  },
  {
    title: "Painel Financeiro",
    path: "/app/financeiro",
    icon: DollarSign,
  },
];

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col transition-[width] duration-200 ease-in-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex items-center gap-3 border-b border-sidebar-border p-4">
        <Link
          to="/app"
          className={cn(
            "flex flex-1 items-center gap-3 text-sidebar-foreground transition-all duration-200",
            isCollapsed && "justify-center",
          )}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Leaf className="h-6 w-6 text-primary" />
          </div>
          {!isCollapsed && (
            <div className="leading-tight">
              <h2 className="text-lg font-bold text-sidebar-foreground">Consultoria</h2>
              <p className="text-xs text-muted-foreground">Inteligencia de Mercado</p>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          aria-label={isCollapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
      </div>

      <nav className={cn("flex-1 p-4", isCollapsed && "px-2")}>
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={isCollapsed ? item.title : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-3 text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent",
                  isCollapsed && "justify-center px-3",
                )}
                activeClassName={cn(
                  "bg-sidebar-accent text-primary font-medium shadow-sm",
                  isCollapsed && "text-primary",
                )}
              >
                <Icon className="h-5 w-5" />
                {!isCollapsed && <span className="text-sm">{item.title}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div
        className={cn(
          "border-t border-sidebar-border p-4 flex flex-col gap-3",
          isCollapsed ? "items-center" : "items-stretch",
        )}
      >
        <ThemeToggle />
        <UserMenu collapsed={isCollapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
