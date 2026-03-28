import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { CalendarDays, ExternalLink, FileText, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import {
  deleteReport,
  getReportUrl,
  listReports,
  notifyReportsUpdated,
  REPORTS_UPDATED_EVENT,
  uploadReport,
  type ReportFile,
} from "@/lib/reports";

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

const GerenciarRelatoriosPage = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [reports, setReports] = useState<ReportFile[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);
  const [reportsError, setReportsError] = useState("");
  const [openingPath, setOpeningPath] = useState<string | null>(null);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setIsLoadingReports(true);
    setReportsError("");
    try {
      const data = await listReports(REPORTS_SECTOR);
      setReports(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar relatórios.";
      setReportsError(message);
    } finally {
      setIsLoadingReports(false);
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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
  };

  const handleUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      toast({ title: "Selecione um PDF", description: "Escolha um arquivo para enviar.", variant: "destructive" });
      return;
    }

    setIsUploading(true);
    try {
      await uploadReport(REPORTS_SECTOR, selectedFile, {
        title,
        description,
      });
      notifyReportsUpdated();
      setTitle("");
      setDescription("");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({ title: "PDF enviado", description: "O relatório já está disponível no item Relatórios da home." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao enviar o PDF.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleDelete = async (report: ReportFile) => {
    const confirmation = window.confirm(`Deseja excluir o relatório "${report.title}"?`);
    if (!confirmation) return;

    setDeletingPath(report.path);
    try {
      await deleteReport(report.path);
      notifyReportsUpdated();
      toast({ title: "Relatório removido", description: "O PDF foi removido da home de relatórios." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao excluir relatório.";
      toast({ title: "Erro", description: message, variant: "destructive" });
    } finally {
      setDeletingPath(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Gerenciar relatórios</h1>
        <p className="text-muted-foreground">Publique novos PDFs e remova relatórios já disponíveis na home.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Publicar relatório</CardTitle>
            <CardDescription>
              Envie um novo PDF para o item Relatórios da home com o título e a descrição que o usuário verá.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportFile">Arquivo PDF</Label>
                <Input
                  id="reportFile"
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                />
                {selectedFile && <p className="text-xs text-muted-foreground">Selecionado: {selectedFile.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportTitle">Título</Label>
                <Input
                  id="reportTitle"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex: Panorama Mensal de Mercado"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportDescription">Descrição</Label>
                <Textarea
                  id="reportDescription"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Resumo curto do conteúdo do PDF para o usuário entender o material."
                  className="min-h-28"
                />
              </div>

              <Button type="submit" disabled={isUploading || !selectedFile} className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                {isUploading ? "Enviando..." : "Adicionar relatório"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Relatórios publicados</CardTitle>
            <CardDescription>Gerencie os PDFs que aparecem no item Relatórios da home.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {reportsError && <p className="text-sm text-red-500">{reportsError}</p>}

            {isLoadingReports ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-6 text-center text-sm text-muted-foreground">
                Carregando relatórios...
              </div>
            ) : reports.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/10 p-6 text-center text-sm text-muted-foreground">
                Nenhum relatório publicado até agora.
              </div>
            ) : (
              <div className="space-y-3">
                {reports.map((report) => (
                  <div key={report.path} className="rounded-xl border border-border bg-muted/10 p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-foreground">
                          <FileText className="h-4 w-4 text-primary" />
                          <p className="font-medium">{report.title}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {report.description || "Sem descrição cadastrada para este PDF."}
                        </p>
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(report.updatedAt ?? report.createdAt)}
                          </span>
                          <span className="rounded-full border border-border px-2.5 py-1">
                            {formatSize(report.size)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => void handleOpen(report)}
                          disabled={openingPath === report.path || deletingPath === report.path}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {openingPath === report.path ? "Abrindo..." : "Abrir"}
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => void handleDelete(report)}
                          disabled={deletingPath === report.path || openingPath === report.path}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingPath === report.path ? "Removendo..." : "Remover"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GerenciarRelatoriosPage;
