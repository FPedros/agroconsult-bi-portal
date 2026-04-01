import {
  type LucideIcon,
  Building2,
  Globe2,
  Leaf,
} from "lucide-react";
import { type PowerBiSection } from "@/contexts/PowerBiContext";

export type BaseMenuItem = {
  title: string;
  path: string;
  powerBiKey?: PowerBiSection;
};

const sharedMenuItems: BaseMenuItem[] = [{ title: "Relatórios", path: "/app/relatorios" }];

const sectorMenus: Record<string, BaseMenuItem[]> = {
  consultoria: [
    { title: "Painel Comercial", path: "/app/setor/consultoria/comercial", powerBiKey: "consultoria-comercial" },
    { title: "Painel Operacional", path: "/app/setor/consultoria/operacional", powerBiKey: "consultoria-operacional" },
    {
      title: "Painel Financeiro",
      path: "/app/setor/consultoria/financeiro",
      powerBiKey: "consultoria-financeiro",
    },
  ],
  agroeconomics: [
    { title: "Comercial", path: "/app/setor/agroeconomics/comercial" },
    { title: "Operacional", path: "/app/setor/agroeconomics/operacional" },
    { title: "Financeiro", path: "/app/setor/agroeconomics/financeiro" },
  ],
  "fertilizantes-sucroenergético": [
    { title: "Painel Fertilizantes", path: "/app/setor/fertilizantes-sucroenergético/fertilizantes" },
    { title: "Painel Sucroenergético", path: "/app/setor/fertilizantes-sucroenergético/sucroenergético" },
  ],
};

export const sectorLabels: Record<string, string> = {
  consultoria: "Consultoria",
  agroeconomics: "AgroEconomics",
  "fertilizantes-sucroenergético": "Fertilizantes & Sucroenergético",
};

export const sectorIcons: Record<string, LucideIcon> = {
  consultoria: Building2,
  agroeconomics: Globe2,
  "fertilizantes-sucroenergético": Leaf,
};

const LAST_SECTOR_STORAGE_KEY = "current-sector";

const decodePathSegment = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizeSector = (value?: string | null) => {
  if (!value) return null;
  const normalized = decodePathSegment(value).trim();
  return normalized && sectorMenus[normalized] ? normalized : null;
};

const readStoredSector = () => {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(LAST_SECTOR_STORAGE_KEY);
    return value && sectorMenus[value] ? value : null;
  } catch (error) {
    console.error("Erro ao ler setor salvo", error);
    return null;
  }
};

const persistSector = (sector: string) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LAST_SECTOR_STORAGE_KEY, sector);
  } catch (error) {
    console.error("Erro ao salvar setor", error);
  }
};

export const buildSectorScopedPath = (path: string, sector: string) => {
  const normalizedSector = normalizeSector(sector);
  if (!normalizedSector) return path;

  const [pathAndSearch, hash = ""] = path.split("#");
  const [basePath, existingSearch = ""] = pathAndSearch.split("?");
  const params = new URLSearchParams(existingSearch);
  params.set("sector", normalizedSector);
  const nextSearch = params.toString();

  return `${basePath}${nextSearch ? `?${nextSearch}` : ""}${hash ? `#${hash}` : ""}`;
};

export const getSectorFromPath = (pathname: string, search = "") => {
  const explicitSector = normalizeSector(new URLSearchParams(search).get("sector"));
  if (explicitSector) {
    persistSector(explicitSector);
    return explicitSector;
  }

  const parts = pathname
    .split("/")
    .filter(Boolean)
    .map(decodePathSegment);
  if (parts[0] !== "app") return "consultoria";
  const first = parts[1];
  if (first === "setor") {
    const sector = normalizeSector(parts[2]);
    if (sector) {
      persistSector(sector);
      return sector;
    }
    return "consultoria";
  }
  if (first === "itens-sidebar" || first === "relatorios" || first === "powerbi" || first === "perfil") {
    // Quando estiver na página de gerenciamento de sidebar, relatórios, PowerBI ou perfil, usar o setor salvo
    return readStoredSector() || "consultoria";
  }
  
  return "consultoria";
};

const standardPanelsForSector = (sector: string): BaseMenuItem[] => [
  {
    title: "Painel Comercial",
    path: `/app/setor/${sector}/comercial`,
    powerBiKey: `${sector}-comercial` as PowerBiSection,
  },
  {
    title: "Painel Operacional",
    path: `/app/setor/${sector}/operacional`,
    powerBiKey: `${sector}-operacional` as PowerBiSection,
  },
  {
    title: "Painel Financeiro",
    path: `/app/setor/${sector}/financeiro`,
    powerBiKey: `${sector}-financeiro` as PowerBiSection,
  },
];

export const getBaseMenuItemsBySector = (sector: string): BaseMenuItem[] => {
  const existingItems = sectorMenus[sector] ?? [];
  
  if (existingItems.length > 0) {
    return [...existingItems, ...sharedMenuItems];
  }
  
  return [...standardPanelsForSector(sector), ...sharedMenuItems];
};

export { sectorMenus };
