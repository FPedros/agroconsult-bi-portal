import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ChevronLeft,
  BarChart3,
  BookOpenText,
  CircleGauge,
  FileText,
  type LucideIcon,
  Wallet,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import UserMenu from "@/components/UserMenu";
import { fetchSidebarItemsForSector, SIDEBAR_ITEMS_EVENT, type SidebarMenuItem } from "@/lib/sidebarItems";
import { getBaseMenuItemsBySector } from "@/lib/sidebarMenu";

type NeuralNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulseOffset: number;
  pulseSpeed: number;
};

const HOME_MENU_SECTOR = "agroeconomics";
const REPORTS_PATH = "/app/relatorios";

const HOME_CARD_CONFIG: Record<
  string,
  {
    description: string;
    icon: LucideIcon;
  }
> = {
  "/app/setor/agroeconomics/comercial": {
    description: "Acompanhe indicadores comerciais e movimentos de mercado.",
    icon: BarChart3,
  },
  "/app/setor/agroeconomics/operacional": {
    description: "Monitore a operação, ritmo de execução e eficiência.",
    icon: CircleGauge,
  },
  "/app/setor/agroeconomics/financeiro": {
    description: "Consulte números financeiros, margens e resultados.",
    icon: Wallet,
  },
  "/app/relatorios": {
    description: "Abra os relatórios compartilhados disponíveis no portal.",
    icon: FileText,
  },
};

const toStaticMenuItems = () =>
  ensureReportsLast(
    getBaseMenuItemsBySector(HOME_MENU_SECTOR).map((item) => ({
      ...item,
      id: item.path,
      isCustom: false,
    })),
  );

const ensureReportsLast = <T extends { path: string }>(items: T[]) => {
  const reports = items.filter((item) => item.path === REPORTS_PATH);
  const rest = items.filter((item) => item.path !== REPORTS_PATH);
  return [...rest, ...reports];
};

const buildHomeMenuItems = async (): Promise<SidebarMenuItem[]> => {
  const baseItems = getBaseMenuItemsBySector(HOME_MENU_SECTOR);
  const fallbackItems = baseItems.map((item) => ({
    ...item,
    id: item.path,
    isCustom: false,
  }));

  try {
    const { customItems, hiddenPaths, renamedTitles, descriptions } = await fetchSidebarItemsForSector(HOME_MENU_SECTOR);
    const visibleBase = baseItems
      .filter((item) => !hiddenPaths.has(item.path))
      .map((item) => ({
        ...item,
        id: item.path,
        title: renamedTitles.get(item.path) || item.title,
        description: descriptions.get(item.path),
        isCustom: false,
      }));

    return ensureReportsLast([...visibleBase, ...customItems]);
  } catch (error) {
    console.error("Erro ao carregar itens da home", error);
    return fallbackItems;
  }
};

const getHomeCardMeta = (item: SidebarMenuItem) => {
  const knownConfig = HOME_CARD_CONFIG[item.path];
  if (item.description?.trim()) {
    return {
      description: item.description.trim(),
      icon: knownConfig?.icon ?? (item.isCustom ? BookOpenText : FileText),
    };
  }

  if (knownConfig) return knownConfig;

  if (item.powerBiKey?.endsWith("-comercial")) {
    return {
      description: "Acesse este painel comercial diretamente pela home.",
      icon: BarChart3,
    };
  }

  if (item.powerBiKey?.endsWith("-operacional")) {
    return {
      description: "Acesse este painel operacional diretamente pela home.",
      icon: CircleGauge,
    };
  }

  if (item.powerBiKey?.endsWith("-financeiro")) {
    return {
      description: "Acesse este painel financeiro diretamente pela home.",
      icon: Wallet,
    };
  }

  return {
    description: item.isCustom
      ? "Item personalizado do menu AgroEconomics disponível para navegação rápida."
      : "Item do menu AgroEconomics disponível para navegação rápida.",
    icon: item.isCustom ? BookOpenText : FileText,
  };
};

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isBasePath = location.pathname === "/app" || location.pathname === "/app/";
  const isAgroeconomicsOptionPath =
    location.pathname === "/app/setor/agroeconomics" || location.pathname.startsWith("/app/setor/agroeconomics/");
  const isReportsPath = location.pathname.startsWith("/app/relatorios");
  const isHomeManagementPath = location.pathname === "/app/itens-sidebar" || location.pathname === "/app/powerbi";
  const isProfilePath = location.pathname === "/app/perfil";
  const hideSidebar = isBasePath || isAgroeconomicsOptionPath || isReportsPath || isHomeManagementPath || isProfilePath;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [homeItems, setHomeItems] = useState<SidebarMenuItem[]>(() => toStaticMenuItems());
  const homeCards = useMemo(
    () =>
      homeItems.map((item) => ({
        ...item,
        ...getHomeCardMeta(item),
      })),
    [homeItems],
  );
  const powerBiCards = useMemo(
    () => homeCards.filter((item) => item.path !== REPORTS_PATH),
    [homeCards],
  );
  const reportCards = useMemo(
    () => homeCards.filter((item) => item.path === REPORTS_PATH),
    [homeCards],
  );

  useEffect(() => {
    if (!isBasePath) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let nodes: NeuralNode[] = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = 60;
      nodes = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomBetween(0.50, 1.25);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: randomBetween(1, 3),
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: randomBetween(0.6, 1.2),
        };
      });
    };

    const draw = () => {
      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      context.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;
      }

      const time = performance.now() / 1000;
      const maxDistance = Math.min(200, Math.max(140, Math.min(width, height) * 0.25));
      context.lineWidth = 1;
      context.globalCompositeOperation = "lighter";

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.55;
            context.strokeStyle = `rgba(120, 255, 210, ${alpha})`;
            context.shadowBlur = 0;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      for (const node of nodes) {
        const pulse = 0.6 + 0.4 * Math.sin(time * node.pulseSpeed + node.pulseOffset);
        const glowAlpha = 0.55 + pulse * 0.35;
        const radius = node.radius * (0.9 + pulse * 0.2);
        context.shadowBlur = 14;
        context.shadowColor = "rgba(120, 255, 210, 0.7)";
        context.fillStyle = `rgba(120, 255, 210, ${glowAlpha})`;
        context.beginPath();
        context.arc(node.x, node.y, radius, 0, Math.PI * 2);
        context.fill();
      }

      if (!reduceMotion) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isBasePath]);

  useEffect(() => {
    let isActive = true;

    const loadHomeItems = async () => {
      const items = await buildHomeMenuItems();
      if (isActive) {
        setHomeItems(items);
      }
    };

    if (isBasePath) {
      void loadHomeItems();
    }

    const handleSidebarItemsUpdate = () => {
      if (isBasePath) {
        void loadHomeItems();
      }
    };

    window.addEventListener(SIDEBAR_ITEMS_EVENT, handleSidebarItemsUpdate);

    return () => {
      isActive = false;
      window.removeEventListener(SIDEBAR_ITEMS_EVENT, handleSidebarItemsUpdate);
    };
  }, [isBasePath]);

  return (
    <div className="min-h-screen flex w-full bg-background">
      {!hideSidebar && <Sidebar />}
      <main className={`flex-1 min-h-0 overflow-hidden ${!isBasePath ? "p-4 md:p-6 bg-background/40" : ""}`}>
        {isBasePath ? (
          <div 
            className="relative flex h-full items-center justify-center overflow-hidden"
            style={{
              background: "linear-gradient(90deg, #202956 0%, #1A445F 50%, #008747 100%)",
            }}
          >
            <canvas ref={canvasRef} className="absolute inset-0 h-full w-full z-0 pointer-events-none" aria-hidden="true" />
            <div className="absolute right-4 top-4 z-30">
              <UserMenu variant="home" />
            </div>
            
            <div className="relative z-20 w-full max-w-6xl px-4">
              <div className="mb-8 text-center text-white">
                <p className="text-sm uppercase tracking-[0.45em] text-[#D7FFF1]/75">Portal</p>
                <h1 className="mt-3 text-5xl font-bold tracking-tight text-[#F4FFF9] drop-shadow-[0_10px_30px_rgba(6,14,32,0.4)]">
                  AgroEconomics
                </h1>
              </div>
              <div className="space-y-8">
                {powerBiCards.length > 0 && (
                  <section className="space-y-4">
                    <div className="space-y-1 text-white">
                      <h2 className="text-2xl font-semibold">Power BI</h2>
                      <p className="text-sm text-[#D7FFF1]/75">
                        Painéis e visões analíticas disponíveis na home principal.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {powerBiCards.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            style={{
                              background: "linear-gradient(140deg, rgba(32, 41, 86, 0.45) 0%, rgba(26, 68, 95, 0.38) 45%, rgba(0, 135, 71, 0.2) 100%)",
                              borderColor: "rgba(120, 255, 210, 0.18)",
                              boxShadow: "0 25px 80px rgba(6, 14, 32, 0.6)"
                            }}
                            className="group relative w-full rounded-xl border p-6 text-left backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#78FFD2]/40 hover:shadow-[0_8px_32px_rgba(120,255,210,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78FFD2]/60"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#78FFD2]/15 text-[#78FFD2] transition-colors group-hover:bg-[#78FFD2]/25">
                                <Icon className="h-7 w-7" />
                              </div>
                              <div className="flex-1">
                                <p className="mb-1 text-xl font-semibold text-white">{item.title}</p>
                                <p className="text-sm text-[#D7FFF1]/70">{item.description}</p>
                              </div>
                              <ArrowRight className="h-5 w-5 text-[#78FFD2] transition-transform group-hover:translate-x-1" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                {reportCards.length > 0 && (
                  <section className="space-y-4">
                    <div className="space-y-1 text-white">
                      <h2 className="text-2xl font-semibold">Relatórios</h2>
                      <p className="text-sm text-[#D7FFF1]/75">
                        Acesse os PDFs e materiais publicados para consulta.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {reportCards.map((item) => {
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            style={{
                              background: "linear-gradient(140deg, rgba(32, 41, 86, 0.45) 0%, rgba(26, 68, 95, 0.38) 45%, rgba(0, 135, 71, 0.2) 100%)",
                              borderColor: "rgba(120, 255, 210, 0.18)",
                              boxShadow: "0 25px 80px rgba(6, 14, 32, 0.6)"
                            }}
                            className="group relative w-full rounded-xl border p-6 text-left backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-[#78FFD2]/40 hover:shadow-[0_8px_32px_rgba(120,255,210,0.25)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#78FFD2]/60"
                          >
                            <div className="flex items-center gap-4">
                              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[#78FFD2]/15 text-[#78FFD2] transition-colors group-hover:bg-[#78FFD2]/25">
                                <Icon className="h-7 w-7" />
                              </div>
                              <div className="flex-1">
                                <p className="mb-1 text-xl font-semibold text-white">{item.title}</p>
                                <p className="text-sm text-[#D7FFF1]/70">{item.description}</p>
                              </div>
                              <ArrowRight className="h-5 w-5 text-[#78FFD2] transition-transform group-hover:translate-x-1" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 w-full flex-col overflow-hidden">
            <div className="flex-1 min-h-0 overflow-hidden">
              <Outlet />
            </div>
            {hideSidebar && (
              <div className="mt-4 shrink-0">
                <button
                  type="button"
                  onClick={() => navigate("/app")}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/80 px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar ao início
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AppLayout;
