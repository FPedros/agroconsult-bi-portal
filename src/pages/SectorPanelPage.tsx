import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { PowerBiSection, POWER_BI_SECTIONS, usePowerBi } from "@/contexts/PowerBiContext";
import { cn } from "@/lib/utils";

type PanelId = "comercial" | "operacional" | "financeiro";

const formatSector = (sectorId?: string) => {
  if (!sectorId) return "Setor";
  return sectorId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const SectorPanelPage = () => {
  const { sectorId, panelId } = useParams<{ sectorId: string; panelId: PanelId }>();
  const { links } = usePowerBi();

  const powerBiKey = useMemo(() => {
    if (!sectorId) return null;
    if (!panelId || !["comercial", "operacional", "financeiro"].includes(panelId)) return null;
    const key = `${sectorId}-${panelId}` as PowerBiSection;
    if (!POWER_BI_SECTIONS[key]) return null;
    return key;
  }, [sectorId, panelId]);

  const currentLink = powerBiKey ? links[powerBiKey] : "";
  const sectorLabel = formatSector(sectorId);
  const panelLabel = panelId ? `Painel ${panelId.charAt(0).toUpperCase() + panelId.slice(1)}` : "Painel";

  const missingLink = !currentLink;

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex h-full w-full flex-col rounded-xl border border-border bg-card/80 shadow-lg">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">
            {sectorLabel} · {panelLabel}
          </p>
        </div>
        <div className={cn("flex-1", missingLink ? "flex items-center justify-center p-8" : "overflow-hidden")}>
          {missingLink ? (
            <div className="max-w-xl text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">Link do Power BI não configurado</p>
              <p className="text-sm text-muted-foreground">
                Defina o link deste painel em Gerenciar cadastro → Alterar Power BI para visualizar o dashboard.
              </p>
            </div>
          ) : (
            <iframe src={currentLink} className="h-full w-full" title={`${sectorLabel}-${panelLabel}`} allowFullScreen />
          )}
        </div>
      </div>
    </div>
  );
};

export default SectorPanelPage;
