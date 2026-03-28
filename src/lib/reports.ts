import { supabase } from "@/lib/supabaseClient";

export const REPORTS_BUCKET = "reports";
export const REPORTS_UPDATED_EVENT = "reports-updated";

export type ReportFile = {
  name: string;
  path: string;
  title: string;
  description: string;
  createdAt?: string;
  updatedAt?: string;
  size?: number;
};

type ReportMetadataDbItem = {
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

const normalizeSector = (sector: string) => {
  const trimmed = sector.trim();
  return trimmed || "consultoria";
};

const sanitizeFileName = (name: string) => {
  const trimmed = name.trim();
  const safeName = trimmed
    .replace(/\s+/g, "_")
    .replace(/[\\/#?%*:|"<>]/g, "")
    .replace(/_{2,}/g, "_");
  if (!safeName) return `relatorio-${Date.now()}.pdf`;
  return safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`;
};

export const notifyReportsUpdated = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REPORTS_UPDATED_EVENT));
};

const buildReportTitleId = (path: string) => `report-title:${path}`;
const buildReportDescriptionId = (path: string) => `report-description:${path}`;
const formatName = (name: string) => name.replace(/^\d+-/, "").replace(/_/g, " ").replace(/\.pdf$/i, "");

const upsertReportMetadata = async (params: { sector: string; path: string; title: string; description?: string }) => {
  const now = new Date().toISOString();
  const rows: ReportMetadataDbItem[] = [
    {
      id: buildReportTitleId(params.path),
      sector: params.sector,
      title: params.title.trim(),
      path: params.path,
      is_custom: false,
      is_hidden: false,
      created_at: now,
      updated_at: now,
    },
  ];

  if (params.description?.trim()) {
    rows.push({
      id: buildReportDescriptionId(params.path),
      sector: params.sector,
      title: params.description.trim(),
      path: params.path,
      is_custom: false,
      is_hidden: false,
      created_at: now,
      updated_at: now,
    });
  }

  const { error } = await supabase.from<ReportMetadataDbItem>("sidebar_items").upsert(rows, { onConflict: "id" });
  if (error) {
    throw new Error(error.message);
  }
};

const fetchReportMetadataMap = async (sector: string) => {
  const { data, error } = await supabase
    .from<ReportMetadataDbItem>("sidebar_items")
    .select("*")
    .eq("sector", sector);

  if (error) {
    throw new Error(error.message);
  }

  const titleMap = new Map<string, string>();
  const descriptionMap = new Map<string, string>();

  for (const item of data ?? []) {
    if (item.id.startsWith("report-title:")) {
      titleMap.set(item.path, item.title);
    }

    if (item.id.startsWith("report-description:")) {
      descriptionMap.set(item.path, item.title);
    }
  }

  return { titleMap, descriptionMap };
};

export const listReports = async (sector: string): Promise<ReportFile[]> => {
  const sectorPath = normalizeSector(sector);
  const [{ data, error }, metadata] = await Promise.all([
    supabase.storage.from(REPORTS_BUCKET).list(sectorPath, {
      limit: 200,
      offset: 0,
      sortBy: { column: "created_at", order: "desc" },
    }),
    fetchReportMetadataMap(sectorPath).catch(() => ({
      titleMap: new Map<string, string>(),
      descriptionMap: new Map<string, string>(),
    })),
  ]);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .filter((item) => item.name && !item.name.endsWith("/"))
    .map((item) => {
      const rawSize = item.metadata?.size;
      const parsedSize = typeof rawSize === "number" ? rawSize : Number(rawSize);
      const path = `${sectorPath}/${item.name}`;
      return {
        name: item.name,
        path,
        title: metadata.titleMap.get(path) || formatName(item.name),
        description: metadata.descriptionMap.get(path) || "",
        createdAt: item.created_at ?? undefined,
        updatedAt: item.updated_at ?? undefined,
        size: Number.isFinite(parsedSize) ? parsedSize : undefined,
      };
    });
};

export const uploadReport = async (
  sector: string,
  file: File,
  metadata?: { title?: string; description?: string },
): Promise<string> => {
  const isPdfType = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdfType) {
    throw new Error("Selecione um arquivo PDF válido.");
  }

  const sectorPath = normalizeSector(sector);
  const fileName = sanitizeFileName(file.name);
  const path = `${sectorPath}/${Date.now()}-${fileName}`;

  const { error } = await supabase.storage.from(REPORTS_BUCKET).upload(path, file, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const reportTitle = metadata?.title?.trim() || formatName(file.name);
  await upsertReportMetadata({
    sector: sectorPath,
    path,
    title: reportTitle,
    description: metadata?.description,
  });

  return path;
};

export const downloadReport = async (path: string): Promise<Blob> => {
  const { data, error } = await supabase.storage.from(REPORTS_BUCKET).download(path);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getReportUrl = async (path: string): Promise<string> => {
  const { data: signedData, error: signedError } = await supabase.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(path, 60 * 10);
  if (!signedError && signedData?.signedUrl) {
    return signedData.signedUrl;
  }

  const { data: publicData } = supabase.storage.from(REPORTS_BUCKET).getPublicUrl(path);
  if (!publicData?.publicUrl) {
    throw new Error("Não foi possível gerar o link do relatório.");
  }

  return publicData.publicUrl;
};

export const deleteReport = async (path: string) => {
  const [{ error: storageError }, { error: metadataError }] = await Promise.all([
    supabase.storage.from(REPORTS_BUCKET).remove([path]),
    supabase
      .from("sidebar_items")
      .delete()
      .in("id", [buildReportTitleId(path), buildReportDescriptionId(path)]),
  ]);

  if (storageError) {
    throw new Error(storageError.message);
  }

  if (metadataError) {
    throw new Error(metadataError.message);
  }
};
