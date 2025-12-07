import { supabase } from "./supabaseClient";
import { PowerBiLink, PowerBiPanel, Sector } from "./types";

const sanitizePowerBiValue = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const match = trimmed.match(/src=["']([^"']+)["']/i);
  if (match?.[1]) return match[1];
  return trimmed;
};

const nowIso = () => new Date().toISOString();

const randomId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export async function fetchSectors(): Promise<Sector[]> {
  const { data, error } = await supabase.from("sectors").select("*");
  if (error) {
    throw new Error(error.message);
  }
  return data ?? [];
}

export async function fetchSectorBySlug(slug: string): Promise<Sector | null> {
  const { data, error } = await supabase.from("sectors").select("*").eq("slug", slug).maybeSingle();
  if (error) {
    throw new Error(error.message);
  }
  return data ?? null;
}

export async function fetchPowerBiLinkBySectorAndPanel(
  sectorSlug: string,
  panel: PowerBiPanel,
): Promise<PowerBiLink | null> {
  const sector = await fetchSectorBySlug(sectorSlug);
  if (!sector) return null;

  const { data, error } = await supabase
    .from("powerbi_links")
    .select("*")
    .eq("sectorId", sector.id)
    .eq("panel", panel)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

export async function upsertPowerBiLink(params: {
  sectorSlug: string;
  panel: PowerBiPanel;
  url: string;
  sectorName?: string;
}): Promise<PowerBiLink> {
  const { sectorSlug, panel, url, sectorName } = params;
  const safeUrl = sanitizePowerBiValue(url);
  const normalizedSlug = sectorSlug.trim();
  const resolvedName = sectorName?.trim() || normalizedSlug;

  let sector = await fetchSectorBySlug(normalizedSlug);

  if (!sector) {
    const timestamp = nowIso();
    const { data, error } = await supabase
      .from<Sector>("sectors")
      .insert({
        id: randomId(),
        slug: normalizedSlug,
        name: resolvedName,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .select("*")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("Nao foi possivel criar o setor");
    }

    sector = data;
  }

  const existingLink = await fetchPowerBiLinkBySectorAndPanel(normalizedSlug, panel);
  const now = nowIso();
  const payload: PowerBiLink = existingLink
    ? { ...existingLink, url: safeUrl, updatedAt: now }
    : {
        id: randomId(),
        sectorId: sector.id,
        panel,
        url: safeUrl,
        createdAt: now,
        updatedAt: now,
      };

  const { data, error } = existingLink
    ? await supabase
        .from<PowerBiLink>("powerbi_links")
        .update({ url: payload.url, updatedAt: payload.updatedAt })
        .eq("id", existingLink.id)
        .select("*")
        .maybeSingle()
    : await supabase.from<PowerBiLink>("powerbi_links").insert(payload).select("*").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Nao foi possivel salvar o link do Power BI");
  }

  return data;
}
