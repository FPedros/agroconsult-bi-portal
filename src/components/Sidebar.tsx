import { NavLink } from "@/components/NavLink";
import { BarChart3, TrendingUp, DollarSign, Leaf } from "lucide-react";

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
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-sidebar-foreground">Agroconsult</h2>
            <p className="text-xs text-muted-foreground">BI de Consultoria</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
                activeClassName="bg-sidebar-accent text-primary font-medium shadow-sm"
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{item.title}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-center text-muted-foreground">
          © 2024 Agroconsult
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
