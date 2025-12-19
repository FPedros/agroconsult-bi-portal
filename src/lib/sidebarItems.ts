import { supabase } from "@/lib/supabaseClient";
import { type PowerBiSection } from "@/contexts/PowerBiContext";

export type SidebarCustomItem = {
  id: string;
  title: string;
  path: string;
  sector: string;
  powerBiUrl?: string;
};

export type SidebarMenuItem = {
  id: string;
  title: string;
  path: string;
  powerBiKey?: PowerBiSection;
  isCustom: boolean;
};

type SidebarDbItem = {
  id: string;
  title: string;
  path: string;
  sector: string;
  is_custom: boolean;
  is_hidden: boolean;
  powerbi_url?: string | null;
  created_at?: string;
  updated_at?: string;
};

const nowIso = () => new Date().toISOString();

const sanitizePowerBiValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  if (match?.[1]) return match[1];
  return trimmed;
};

export const SIDEBAR_ITEMS_EVENT = "sidebar-items-updated";

export const notifySidebarItemsUpdated = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(SIDEBAR_ITEMS_EVENT));
};

export const createSidebarItemId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `custom-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const buildCustomItemPath = (sector: string, id: string) => `/app/setor/${sector}/custom/${id}`;

export const buildHiddenItemId = (sector: string, path: string) => `hidden:${sector}:${path}`;

const mapToCustomItem = (item: SidebarDbItem): SidebarCustomItem => ({
  id: item.id,
  title: item.title,
  path: item.path,
  sector: item.sector,
  powerBiUrl: item.powerbi_url ?? "",
});

export const fetchSidebarItemsBySector = async (sector: string): Promise<SidebarDbItem[]> => {
  const { data, error } = await supabase
    .from<SidebarDbItem>("sidebar_items")
    .select("*")
    .eq("sector", sector)
    .order("created_at", { ascending: true });
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
};

export const fetchSidebarItemById = async (id: string, sector?: string): Promise<SidebarCustomItem | null> => {
  let query = supabase
    .from<SidebarDbItem>("sidebar_items")
    .select("*")
    .eq("id", id)
    .eq("is_custom", true)
    .eq("is_hidden", false);

  if (sector) {
    query = query.eq("sector", sector);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapToCustomItem(data) : null;
};

export const fetchSidebarItemsForSector = async (sector: string): Promise<{
  customItems: SidebarMenuItem[];
  hiddenPaths: Set<string>;
}> => {
  const items = await fetchSidebarItemsBySector(sector);
  const hiddenPaths = new Set(
    items.filter((item) => !item.is_custom && item.is_hidden).map((item) => item.path),
  );
  const customItems = items
    .filter((item) => item.is_custom && !item.is_hidden)
    .map((item) => ({
      id: item.id,
      title: item.title,
      path: item.path,
      isCustom: true,
    }));

  return { customItems, hiddenPaths };
};

export const insertCustomSidebarItem = async (params: { sector: string; title: string }): Promise<SidebarCustomItem> => {
  const id = createSidebarItemId();
  const now = nowIso();
  const payload: SidebarDbItem = {
    id,
    sector: params.sector,
    title: params.title.trim(),
    path: buildCustomItemPath(params.sector, id),
    is_custom: true,
    is_hidden: false,
    created_at: now,
    updated_at: now,
  };

  const { data, error } = await supabase
    .from<SidebarDbItem>("sidebar_items")
    .insert(payload)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Não foi possível salvar o item da sidebar.");
  }

  return mapToCustomItem(data);
};

export const deleteSidebarItem = async (id: string) => {
  const { error } = await supabase.from("sidebar_items").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
};

export const updateSidebarItemLink = async (id: string, url: string) => {
  const safeUrl = sanitizePowerBiValue(url);
  const { error } = await supabase
    .from<SidebarDbItem>("sidebar_items")
    .update({ powerbi_url: safeUrl, updated_at: nowIso() })
    .eq("id", id)
    .eq("is_custom", true);

  if (error) {
    throw new Error(error.message);
  }

  return safeUrl;
};

export const hideBuiltInSidebarItem = async (params: { sector: string; title: string; path: string }) => {
  const now = nowIso();
  const payload: SidebarDbItem = {
    id: buildHiddenItemId(params.sector, params.path),
    sector: params.sector,
    title: params.title,
    path: params.path,
    is_custom: false,
    is_hidden: true,
    created_at: now,
    updated_at: now,
  };

  const { error } = await supabase.from<SidebarDbItem>("sidebar_items").upsert(payload, { onConflict: "id" });
  if (error) {
    throw new Error(error.message);
  }
};
