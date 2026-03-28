import { useCallback, useEffect, useState } from "react";
import { CalendarDays, ExternalLink, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import {
  getReportUrl,
  listReports,
  REPORTS_UPDATED_EVENT,
  type ReportFile,
} from "@/lib/reports";
import { sectorLabels } from "@/lib/sidebarMenu";

const REPORTS_SECTOR = "agroeconomics";

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
};

const formatSize = (size?: number) => {
  if (!size) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let remaining = size;
  let unitIndex = 0;

  while (remaining >= 1024 && unitIndex < units.length - 1) {
    remaining /= 1024;
    unitIndex += 1;
  }

  return `${remaining.toFixed(remaining < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
};

const RelatoriosPage = () => {
  const sectorLabel = sectorLabels[REPORTS_SECTOR] ?? "Setor";

  const [reports, setReports] = useState<ReportFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [openingPath, setOpeningPath] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");
    try {
      const data = await listReports(REPORTS_SECTOR);
      setReports(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar relatórios.";
      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReports();

    const handleUpdated = () => {
      void loadReports();
    };

    window.addEventListener(REPORTS_UPDATED_EVENT, handleUpdated);
    return () => {
      window.removeEventListener(REPORTS_UPDATED_EVENT, handleUpdated);
    };
  }, [loadReports]);

  const handleOpen = async (report: ReportFile) => {
    setOpeningPath(report.path);
    try {
      const url = await getReportUrl(report.path);
      const opened = window.open(url, "_blank", "noopener,noreferrer");
      if (!opened) {
        toast({
          title: "Permita pop-ups",
          description: "Habilite pop-ups para abrir o relatório em nova guia.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao abrir relatório.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setOpeningPath(null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          PDFs disponíveis para o setor {sectorLabel}. Cada card mostra o título e a descrição do material publicado.
        </p>
      </div>

      {loadError && <p className="text-sm text-red-500">{loadError}</p>}

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
          Carregando relatórios...
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center text-sm text-muted-foreground">
          Nenhum PDF disponível.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.path} className="overflow-hidden border-border/80 bg-card/80 shadow-sm">
              <CardHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-lg leading-tight">{report.title}</CardTitle>
                  <CardDescription className="line-clamp-4 min-h-[4.5rem] text-sm">
                    {report.description || "Sem descrição cadastrada para este PDF."}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(report.updatedAt ?? report.createdAt)}
                  </span>
                  <span className="rounded-full border border-border px-2.5 py-1">{formatSize(report.size)}</span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    onClick={() => void handleOpen(report)}
                    disabled={openingPath === report.path}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {openingPath === report.path ? "Abrindo..." : "Abrir PDF"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RelatoriosPage;
