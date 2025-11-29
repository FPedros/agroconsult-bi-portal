import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";

const AppLayout = () => {
  const location = useLocation();
  const isBasePath = location.pathname === "/app" || location.pathname === "/app/";

  return (
    <div className="min-h-screen flex w-full bg-background">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 bg-background/40">
        {isBasePath ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl">
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Bem-vindo ao Portal Agroconsult
              </h1>
              <p className="text-muted-foreground text-lg">
                Selecione um painel na lateral para visualizar os dashboards Agroconsult.
              </p>
            </div>
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default AppLayout;
