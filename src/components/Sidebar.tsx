import { useMemo, useState } from "react";
import { NavLink } from "@/components/NavLink";
import {
  type LucideIcon,
  BarChart3,
  TrendingUp,
  DollarSign,
  Leaf,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Layers,
  Rocket,
  FlaskConical,
  Globe2,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import UserMenu from "@/components/UserMenu";
import ThemeToggle from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";

type MenuItem = {
  title: string;
  path: string;
  icon: LucideIcon;
};

const sectorMenus: Record<string, MenuItem[]> = {
  consultoria: [
    { title: "Painel Comercial", path: "/app/comercial", icon: TrendingUp },
    { title: "Painel Operacional", path: "/app/operacional", icon: BarChart3 },
    { title: "Painel Financeiro", path: "/app/consultoria/financeiro", icon: DollarSign },
  ],
  financeiro: [{ title: "Painel Financeiro", path: "/app/financeiro", icon: DollarSign }],
  "avaliacao-ativos": [{ title: "Avaliacao de Ativos", path: "/app/setor/avaliacao-ativos", icon: ClipboardList }],
  "levantamento-safra": [{ title: "Levantamento de Safra", path: "/app/setor/levantamento-safra", icon: Layers }],
  projetos: [{ title: "Projetos", path: "/app/setor/projetos", icon: Rocket }],
  "desenvolvimento-inovacao": [
    { title: "Desenvolvimento e Inovacao", path: "/app/setor/desenvolvimento-inovacao", icon: FlaskConical },
  ],
  agroeconomics: [{ title: "AgroEconomics", path: "/app/setor/agroeconomics", icon: Globe2 }],
};

const sectorLabels: Record<string, string> = {
  consultoria: "Consultoria",
  financeiro: "Financeiro",
  "avaliacao-ativos": "Avaliacao de Ativos",
  "levantamento-safra": "Levantamento de Safra",
  projetos: "Projetos",
  "desenvolvimento-inovacao": "Desenvolvimento e Inovacao",
  agroeconomics: "AgroEconomics",
};

const getSectorFromPath = (pathname: string) => {
  const parts = pathname.split("/").filter(Boolean);
  if (parts[0] !== "app") return "consultoria";
  const first = parts[1];
  if (first === "setor") {
    return parts[2] || "consultoria";
  }
  if (first === "comercial" || first === "operacional") return "consultoria";
  if (first === "financeiro") return "financeiro";
  return parts[1] || "consultoria";
};

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentSector = useMemo(() => getSectorFromPath(location.pathname), [location.pathname]);
  const menuItems = sectorMenus[currentSector] ?? sectorMenus.consultoria;
  const sectorLabel = sectorLabels[currentSector] ?? "Setor";

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
              <h2 className="text-lg font-bold text-sidebar-foreground">{sectorLabel}</h2>
              <p className="text-xs text-muted-foreground">Selecione um painel</p>
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
        <Button
          variant="ghost"
          onClick={() => navigate("/app")}
          className={cn(
            "flex items-center gap-2 px-2 text-sidebar-foreground hover:bg-sidebar-accent",
            isCollapsed ? "justify-center" : "justify-start",
          )}
          aria-label={isCollapsed ? "Selecionar outro setor" : undefined}
        >
          <ChevronLeft className="h-4 w-4" />
          {!isCollapsed && <span className="text-sm font-medium">Escolher outro setor</span>}
        </Button>
        <UserMenu collapsed={isCollapsed} />
      </div>
    </aside>
  );
};

export default Sidebar;
