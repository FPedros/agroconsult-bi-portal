import { supabase } from "@/lib/supabaseClient";

export const REPORTS_BUCKET = "reports";
export const REPORTS_UPDATED_EVENT = "reports-updated";

const REPORTS_TABLE = "report_entries";
const REPORTS_IMAGE_FOLDER = "_images";

type ReportEntryRow = {
  id: string;
  sector: string;
  title: string;
  description?: string | null;
  pdf_path: string;
  image_path?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ReportFile = {
  id: string;
  name: string;
  title: string;
  description?: string;
  path: string;
  imagePath?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  size?: number;
  isLegacy?: boolean;
};

const stripDiacritics = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const normalizeSector = (sector: string) => {
  const trimmed = sector.trim();
  if (!trimmed) return "consultoria";
  return stripDiacritics(trimmed).toLowerCase();
};

const sanitizeFileName = (name: string) => {
  const trimmed = stripDiacritics(name.trim());
  const safeName = trimmed.replace(/\s+/g, "_").replace(/[\\/#?%*:|"<>]/g, "").replace(/_{2,}/g, "_");
  if (!safeName) return `relatorio-${Date.now()}.pdf`;
  return safeName.toLowerCase().endsWith(".pdf") ? safeName : `${safeName}.pdf`;
};

const sanitizeImageName = (name: string) => {
  const trimmed = stripDiacritics(name.trim());
  const safeName = trimmed.replace(/\s+/g, "_").replace(/[\\/#?%*:|"<>]/g, "").replace(/_{2,}/g, "_");
  if (!safeName) return `capa-${Date.now()}.png`;
  return safeName;
};

const ensurePdf = (file: File) => {
  const isPdfType = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdfType) {
    throw new Error("Selecione um arquivo PDF valido.");
  }
};

const ensureImage = (file: File) => {
  const isImage = file.type.startsWith("image/");
  if (!isImage) {
    throw new Error("Selecione uma imagem valida.");
  }
};

const formatNameFromFile = (name: string) => name.replace(/^\d+-/, "").replace(/_/g, " ").replace(/\.pdf$/i, "");

const getStorageUrl = async (path?: string | null): Promise<string | undefined> => {
  if (!path) return undefined;

  const { data: signedData, error: signedError } = await supabase.storage
    .from(REPORTS_BUCKET)
    .createSignedUrl(path, 60 * 10);

  if (!signedError && signedData?.signedUrl) {
    return signedData.signedUrl;
  }

  const { data: publicData } = supabase.storage.from(REPORTS_BUCKET).getPublicUrl(path);
  return publicData?.publicUrl || undefined;
};

const mapLegacyStorageItem = (sectorPath: string, item: {
  name: string;
  created_at?: string;
  updated_at?: string;
  metadata?: { size?: number | string } | null;
}): ReportFile | null => {
  if (!item.name || item.name.startsWith(REPORTS_IMAGE_FOLDER)) return null;

  const rawSize = item.metadata?.size;
  const parsedSize = typeof rawSize === "number" ? rawSize : Number(rawSize);
  const path = `${sectorPath}/${item.name}`;

  return {
    id: `legacy:${path}`,
    name: item.name,
    title: formatNameFromFile(item.name),
    path,
    createdAt: item.created_at ?? undefined,
    updatedAt: item.updated_at ?? undefined,
    size: Number.isFinite(parsedSize) ? parsedSize : undefined,
    isLegacy: true,
  };
};

export const notifyReportsUpdated = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(REPORTS_UPDATED_EVENT));
};

export const listReports = async (sector: string): Promise<ReportFile[]> => {
  const sectorPath = normalizeSector(sector);
  const reportsByPath = new Map<string, ReportFile>();

  try {
    const { data, error } = await supabase
      .from<ReportEntryRow>(REPORTS_TABLE)
      .select("*")
      .eq("sector", sectorPath)
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    const rows = data ?? [];
    const withImages = await Promise.all(
      rows.map(async (item) => {
        const imageUrl = await getStorageUrl(item.image_path ?? undefined);
        return {
          id: item.id,
          name: item.pdf_path.split("/").pop() ?? item.pdf_path,
          title: item.title,
          description: item.description ?? "",
          path: item.pdf_path,
          imagePath: item.image_path ?? undefined,
          imageUrl,
          createdAt: item.created_at ?? undefined,
          updatedAt: item.updated_at ?? undefined,
        } satisfies ReportFile;
      }),
    );

    withImages.forEach((item) => reportsByPath.set(item.path, item));
  } catch (error) {
    console.error("Erro ao carregar metadados de relatórios", error);
  }

  const { data: storageItems, error: storageError } = await supabase.storage.from(REPORTS_BUCKET).list(sectorPath, {
    limit: 200,
    offset: 0,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (storageError) {
    throw new Error(storageError.message);
  }

  (storageItems ?? [])
    .map((item) => mapLegacyStorageItem(sectorPath, item))
    .filter((item): item is ReportFile => Boolean(item))
    .forEach((item) => {
      if (!reportsByPath.has(item.path)) {
        reportsByPath.set(item.path, item);
      }
    });

  return Array.from(reportsByPath.values()).sort((a, b) => {
    const aTime = new Date(a.updatedAt ?? a.createdAt ?? 0).getTime();
    const bTime = new Date(b.updatedAt ?? b.createdAt ?? 0).getTime();
    return bTime - aTime;
  });
};

export const uploadReport = async (params: {
  sector: string;
  title: string;
  description?: string;
  file: File;
  imageFile?: File | null;
}): Promise<string> => {
  const { sector, title, description = "", file, imageFile } = params;
  const trimmedTitle = title.trim();

  if (!trimmedTitle) {
    throw new Error("Informe o titulo do relatorio.");
  }

  ensurePdf(file);
  if (imageFile) {
    ensureImage(imageFile);
  }

  const sectorPath = normalizeSector(sector);
  const fileName = sanitizeFileName(file.name);
  const pdfPath = `${sectorPath}/${Date.now()}-${fileName}`;

  const { error: pdfError } = await supabase.storage.from(REPORTS_BUCKET).upload(pdfPath, file, {
    contentType: "application/pdf",
    upsert: false,
  });

  if (pdfError) {
    throw new Error(pdfError.message);
  }

  let imagePath: string | undefined;

  try {
    if (imageFile) {
      const imageName = sanitizeImageName(imageFile.name);
      imagePath = `${sectorPath}/${REPORTS_IMAGE_FOLDER}/${Date.now()}-${imageName}`;
      const { error: imageError } = await supabase.storage.from(REPORTS_BUCKET).upload(imagePath, imageFile, {
        contentType: imageFile.type || undefined,
        upsert: false,
      });

      if (imageError) {
        throw new Error(imageError.message);
      }
    }

    const { error: insertError } = await supabase.from(REPORTS_TABLE).insert({
      sector: sectorPath,
      title: trimmedTitle,
      description: description.trim() || null,
      pdf_path: pdfPath,
      image_path: imagePath ?? null,
    });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return pdfPath;
  } catch (error) {
    await supabase.storage.from(REPORTS_BUCKET).remove([pdfPath, imagePath].filter(Boolean) as string[]);
    throw error;
  }
};

export const downloadReport = async (path: string): Promise<Blob> => {
  const { data, error } = await supabase.storage.from(REPORTS_BUCKET).download(path);

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const getReportUrl = async (path: string): Promise<string> => {
  const url = await getStorageUrl(path);
  if (!url) {
    throw new Error("Nao foi possivel gerar o link do relatorio.");
  }

  return url;
};

export const deleteReport = async (report: Pick<ReportFile, "id" | "path" | "imagePath" | "isLegacy">) => {
  const pathsToDelete = [report.path, report.imagePath].filter(Boolean) as string[];
  const { error: storageError } = await supabase.storage.from(REPORTS_BUCKET).remove(pathsToDelete);
  if (storageError) {
    throw new Error(storageError.message);
  }

  if (report.isLegacy) {
    return;
  }

  const { error: dbError } = await supabase.from(REPORTS_TABLE).delete().eq("id", report.id);
  if (dbError) {
    throw new Error(dbError.message);
  }
};
