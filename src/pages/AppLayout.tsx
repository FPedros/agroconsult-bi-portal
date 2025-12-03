import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Building2, ClipboardList, Sprout, FolderKanban, PiggyBank, FlaskConical, Globe2 } from "lucide-react";
import Sidebar from "@/components/Sidebar";

const sectors = [
  {
    name: "AgroEconomics",
    description: "Analises macro, mercado e competitividade.",
    path: "/app/setor/agroeconomics",
    icon: Globe2,
  },
  {
    name: "Avaliacao de Ativos",
    description: "Valuation, analise patrimonial e ativos estrategicos.",
    path: "/app/setor/avaliacao-ativos",
    icon: ClipboardList,
  },
  {
    name: "Consultoria",
    description: "Dashboards de inteligencia de mercado e performance comercial.",
    path: "/app/comercial",
    icon: Building2,
  },
  {
    name: "Desenvolvimento e Inovacao",
    description: "Iniciativas, experimentacao e P&D.",
    path: "/app/setor/desenvolvimento-inovacao",
    icon: FlaskConical,
  },
  {
    name: "Financeiro",
    description: "Visao financeira, margens, custos e KPIs.",
    path: "/app/financeiro",
    icon: PiggyBank,
  },
  {
    name: "Levantamento de Safra",
    description: "Producao, produtividade e estimativas de safra.",
    path: "/app/setor/levantamento-safra",
    icon: Sprout,
  },
  {
    name: "Projetos",
    description: "Portfolio, pipeline e execucao de projetos.",
    path: "/app/setor/projetos",
    icon: FolderKanban,
  },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isBasePath = location.pathname === "/app" || location.pathname === "/app/";

  return (
    <div className="min-h-screen flex w-full bg-background">
      {!isBasePath && <Sidebar />}
      <main className="flex-1 min-h-0 p-4 md:p-6 bg-background/40 overflow-hidden">
        {isBasePath ? (
          <div className="flex h-full items-center justify-center">
            <div className="w-full max-w-6xl">
              <div className="mb-6 space-y-2 text-center">
                <h1 className="text-3xl font-bold text-foreground">Escolha o setor para continuar</h1>
                <p className="text-muted-foreground">
                  Selecione uma area para acessar os dashboards e navegacao especificos daquele setor.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sectors.map((sector) => {
                  const Icon = sector.icon;
                  return (
                    <button
                      key={sector.path}
                      onClick={() => navigate(sector.path)}
                      className="group relative w-full rounded-xl border border-border bg-card/70 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-foreground">{sector.name}</p>
                          <p className="text-sm text-muted-foreground">{sector.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 w-full overflow-hidden">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  );
};

export default AppLayout;
