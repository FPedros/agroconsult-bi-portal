import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

const AppLayout = () => {
  const location = useLocation();
  const isBasePath = location.pathname === "/app" || location.pathname === "/app/";

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <main className="flex-1 min-h-0 p-4 md:p-6 bg-background/40 overflow-hidden flex">
        <div className="flex h-full w-full min-h-0">
          {isBasePath ? (
            <div className="flex items-center justify-center h-full w-full">
              <div className="text-center max-w-2xl">
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Bem-vindo ao Portal Consultoria
                </h1>
                <p className="text-muted-foreground text-lg">
                  Selecione um painel na lateral para visualizar os dashboards da Consultoria.
                </p>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
