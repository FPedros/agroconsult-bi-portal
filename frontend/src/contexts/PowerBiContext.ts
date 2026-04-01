type PanelSlug = "comercial" | "operacional" | "financeiro";
type SectorSlug = "consultoria" | "agroeconomics" | "fertilizantes-sucroenergético";

export type PowerBiSection = `${SectorSlug}-${PanelSlug}`;

export const POWER_BI_SECTIONS: Record<
  PowerBiSection,
  {
    label: string;
    team: string;
  }
> = {
  "consultoria-comercial": { label: "Painel Comercial", team: "Consultoria" },
  "consultoria-operacional": { label: "Painel Operacional", team: "Consultoria" },
  "consultoria-financeiro": { label: "Painel Financeiro", team: "Consultoria" },
  "agroeconomics-comercial": { label: "Painel Comercial", team: "AgroEconomics" },
  "agroeconomics-operacional": { label: "Painel Operacional", team: "AgroEconomics" },
  "agroeconomics-financeiro": { label: "Painel Financeiro", team: "AgroEconomics" },
  "fertilizantes-sucroenergético-comercial": { label: "Painel Comercial", team: "Fertilizantes & Sucroenergético" },
  "fertilizantes-sucroenergético-operacional": { label: "Painel Operacional", team: "Fertilizantes & Sucroenergético" },
  "fertilizantes-sucroenergético-financeiro": { label: "Painel Financeiro", team: "Fertilizantes & Sucroenergético" },
};
