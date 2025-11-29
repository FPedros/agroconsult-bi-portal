import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";

const AppLayout = () => {
  const location = useLocation();
  const isBasePath = location.pathname === "/app" || location.pathname === "/app/";

  return (
    <div className="min-h-screen flex flex-col w-full bg-background">
      <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-end px-6">
        <UserMenu />
      </header>
      <div className="flex flex-1 w-full">
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
    </div>
  );
};

export default AppLayout;
