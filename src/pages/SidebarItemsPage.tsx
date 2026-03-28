import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createPowerBiSidebarItem,
  deleteSidebarItemWithMetadata,
  fetchSidebarItemsForSector,
  hideBuiltInSidebarItem,
  notifySidebarItemsUpdated,
  restoreBuiltInSidebarItem,
  updateBaseItemTitle,
  updateSidebarItemLink,
  updateSidebarItemTitle,
  upsertSidebarItemDescription,
  type SidebarMenuItem,
} from "@/lib/sidebarItems";
import { fetchPowerBiLinkBySectorAndPanel, upsertPowerBiLink } from "@/lib/powerBiRepository";
import { getBaseMenuItemsBySector } from "@/lib/sidebarMenu";
import { type PowerBiPanel } from "@/lib/types";
import { type PowerBiSection } from "@/contexts/PowerBiContext";

const HOME_SECTOR = "agroeconomics";
const REPORTS_PATH = "/app/relatorios";
const DEFAULT_HOME_DESCRIPTIONS: Record<string, string> = {
  "/app/setor/agroeconomics/comercial": "Acompanhe indicadores comerciais e movimentos de mercado.",
  "/app/setor/agroeconomics/operacional": "Monitore a operação, ritmo de execução e eficiência.",
  "/app/setor/agroeconomics/financeiro": "Consulte números financeiros, margens e resultados.",
  "/app/relatorios": "Abra os relatórios compartilhados disponíveis no portal.",
};

type ManagedHomeItem = SidebarMenuItem & {
  source: "padrao" | "custom";
  isHidden?: boolean;
  linkEditable: boolean;
};

const ensureReportsLast = <T extends { path: string }>(items: T[]) => {
  const reports = items.filter((item) => item.path === REPORTS_PATH);
  const rest = items.filter((item) => item.path !== REPORTS_PATH);
  return [...rest, ...reports];
};

const parseSection = (section?: PowerBiSection): { sectorSlug: string; panel: PowerBiPanel } | null => {
  if (!section) return null;

  const panels: PowerBiPanel[] = ["comercial", "operacional", "financeiro", "principal"];
  const match = panels.find((panel) => section.endsWith(`-${panel}`));

  if (match) {
    const sectorSlug = section.slice(0, section.length - (match.length + 1));
    return sectorSlug ? { sectorSlug, panel: match } : null;
  }

  if (section === "avaliacao-ativos") {
    return { sectorSlug: "avaliacao-ativos", panel: "principal" };
  }

  return null;
};

const SidebarItemsPage = () => {
  const location = useLocation();
  const locationState = location.state as { selectedItemId?: string } | null;
  const [activeItems, setActiveItems] = useState<ManagedHomeItem[]>([]);
  const [hiddenItems, setHiddenItems] = useState<ManagedHomeItem[]>([]);
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newLink, setNewLink] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingLink, setEditingLink] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const editingItem = useMemo(
    () => activeItems.find((item) => item.id === editingId) ?? null,
    [activeItems, editingId],
  );

  const loadItems = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const baseItems = getBaseMenuItemsBySector(HOME_SECTOR);
      let customItems: SidebarMenuItem[] = [];
      let hiddenPaths = new Set<string>();
      let renamedTitles = new Map<string, string>();
      let descriptions = new Map<string, string>();

      try {
        const loadedItems = await fetchSidebarItemsForSector(HOME_SECTOR);
        customItems = loadedItems.customItems;
        hiddenPaths = loadedItems.hiddenPaths;
        renamedTitles = loadedItems.renamedTitles;
        descriptions = loadedItems.descriptions;
      } catch (error) {
        console.error("Erro ao carregar metadados dos itens da home", error);
        setLoadError("Não foi possível carregar todos os metadados. Exibindo os itens base da home.");
      }

      const visibleBaseItems = baseItems
        .filter((item) => !hiddenPaths.has(item.path))
        .map((item) => ({
          id: item.path,
          title: renamedTitles.get(item.path) || item.title,
          description: descriptions.get(item.path) || DEFAULT_HOME_DESCRIPTIONS[item.path] || "",
          path: item.path,
          powerBiKey: item.powerBiKey,
          powerBiUrl: "",
          isCustom: false,
          source: "padrao" as const,
          linkEditable: Boolean(item.powerBiKey),
        }));

      const hiddenBaseItems = baseItems
        .filter((item) => hiddenPaths.has(item.path))
        .map((item) => ({
          id: item.path,
          title: renamedTitles.get(item.path) || item.title,
          description: descriptions.get(item.path) || DEFAULT_HOME_DESCRIPTIONS[item.path] || "",
          path: item.path,
          powerBiKey: item.powerBiKey,
          powerBiUrl: "",
          isCustom: false,
          isHidden: true,
          source: "padrao" as const,
          linkEditable: Boolean(item.powerBiKey),
        }));

      const activeCustomItems = customItems.map((item) => ({
        ...item,
        description: item.description || "",
        powerBiUrl: item.powerBiUrl || "",
        source: "custom" as const,
        linkEditable: true,
      }));

      const visibleWithLinks = await Promise.all(
        visibleBaseItems.map(async (item) => {
          const parsed = parseSection(item.powerBiKey);
          if (!parsed) return item;

          try {
            const link = await fetchPowerBiLinkBySectorAndPanel(parsed.sectorSlug, parsed.panel);
            return {
              ...item,
              powerBiUrl: link?.url ?? "",
            };
          } catch (error) {
            console.error(`Erro ao carregar link do item ${item.title}`, error);
            return item;
          }
        }),
      );

      setActiveItems(ensureReportsLast([...visibleWithLinks, ...activeCustomItems]));
      setHiddenItems(hiddenBaseItems);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao carregar itens da home.";
      setLoadError(message);
      setActiveItems([]);
      setHiddenItems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const resetEditing = () => {
    setEditingId(null);
    setEditingTitle("");
    setEditingDescription("");
    setEditingLink("");
  };

  const handleStartEdit = useCallback((item: ManagedHomeItem) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
    setEditingDescription(item.description || "");
    setEditingLink(item.powerBiUrl || "");
  }, []);

  useEffect(() => {
    if (!locationState?.selectedItemId) return;
    const item = activeItems.find((entry) => entry.id === locationState.selectedItemId);
    if (item) {
      handleStartEdit(item);
    }
  }, [activeItems, handleStartEdit, locationState]);

  const handleCreate = async () => {
    const trimmedTitle = newTitle.trim();
    if (!trimmedTitle) return;

    const duplicateTitle = activeItems.some((item) => item.title.toLowerCase() === trimmedTitle.toLowerCase());
    if (duplicateTitle) {
      setLoadError("Já existe um item com este título.");
      return;
    }

    setIsCreating(true);
    setLoadError("");

    try {
      await createPowerBiSidebarItem({
        sector: HOME_SECTOR,
        title: trimmedTitle,
        description: newDescription,
        url: newLink.trim(),
      });

      notifySidebarItemsUpdated();
      setNewTitle("");
      setNewDescription("");
      setNewLink("");
      await loadItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao criar item.";
      setLoadError(message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const trimmedTitle = editingTitle.trim();
    if (!trimmedTitle) {
      setLoadError("O título não pode estar vazio.");
      return;
    }

    const duplicateTitle = activeItems.some(
      (item) => item.id !== editingItem.id && item.title.toLowerCase() === trimmedTitle.toLowerCase(),
    );
    if (duplicateTitle) {
      setLoadError("Já existe um item com este título.");
      return;
    }

    setIsSaving(true);
    setLoadError("");

    try {
      if (editingItem.isCustom) {
        await updateSidebarItemTitle(editingItem.id, trimmedTitle);
      } else {
        await updateBaseItemTitle({
          sector: HOME_SECTOR,
          path: editingItem.path,
          newTitle: trimmedTitle,
        });
      }

      await upsertSidebarItemDescription({
        sector: HOME_SECTOR,
        path: editingItem.path,
        description: editingDescription,
      });

      if (editingItem.linkEditable) {
        if (editingItem.isCustom) {
          await updateSidebarItemLink(editingItem.id, editingLink);
        } else if (editingItem.powerBiKey) {
          const parsed = parseSection(editingItem.powerBiKey);
          if (parsed && editingLink.trim()) {
            await upsertPowerBiLink({
              sectorSlug: parsed.sectorSlug,
              panel: parsed.panel,
              url: editingLink,
              sectorName: "AgroEconomics",
            });
          }
        }
      }

      notifySidebarItemsUpdated();
      await loadItems();
      resetEditing();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar item.";
      setLoadError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (item: ManagedHomeItem) => {
    setProcessingId(item.id);
    setLoadError("");

    try {
      if (item.isCustom) {
        await deleteSidebarItemWithMetadata({
          id: item.id,
          sector: HOME_SECTOR,
          path: item.path,
        });
      } else {
        await hideBuiltInSidebarItem({
          sector: HOME_SECTOR,
          title: item.title,
          path: item.path,
        });
      }

      notifySidebarItemsUpdated();
      if (editingId === item.id) resetEditing();
      await loadItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover item.";
      setLoadError(message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRestore = async (item: ManagedHomeItem) => {
    setProcessingId(item.id);
    setLoadError("");

    try {
      await restoreBuiltInSidebarItem({
        sector: HOME_SECTOR,
        path: item.path,
      });
      notifySidebarItemsUpdated();
      await loadItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao restaurar item.";
      setLoadError(message);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Gerenciar itens da home</h1>
        <p className="text-sm text-muted-foreground">
          Edite os cards da home do AgroEconomics: título, descrição, link do Power BI, criação, remoção e restauração.
        </p>
      </div>

      {loadError && <p className="text-sm text-red-500">{loadError}</p>}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Novo item</CardTitle>
            <CardDescription>Cadastre um novo item com Power BI para criar um novo card na home.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newItemTitle">Título</Label>
              <Input
                id="newItemTitle"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Ex: Panorama de Commodities"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newItemDescription">Descrição</Label>
              <Textarea
                id="newItemDescription"
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Resumo que será mostrado no card da home"
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newItemLink">Link do Power BI</Label>
              <Textarea
                id="newItemLink"
                value={newLink}
                onChange={(event) => setNewLink(event.target.value)}
                placeholder='Opcional. Cole o link ou o iframe completo (ex: <iframe ... src="https://app.powerbi.com/..."></iframe>)'
                className="min-h-28"
              />
            </div>

            <Button
              type="button"
              className="w-full"
              onClick={handleCreate}
              disabled={isCreating || !newTitle.trim()}
            >
              {isCreating ? "Criando..." : "Adicionar item"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Carregando itens...
              </div>
            ) : activeItems.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nenhum item ativo na home.
              </div>
            ) : (
              activeItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-border bg-card/70 px-4 py-4">
                  {editingId === item.id ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`edit-title-${item.id}`}>Título</Label>
                        <Input
                          id={`edit-title-${item.id}`}
                          value={editingTitle}
                          onChange={(event) => setEditingTitle(event.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`edit-description-${item.id}`}>Descrição</Label>
                        <Textarea
                          id={`edit-description-${item.id}`}
                          value={editingDescription}
                          onChange={(event) => setEditingDescription(event.target.value)}
                          className="min-h-24"
                        />
                      </div>

                      {item.linkEditable && (
                        <div className="space-y-2">
                          <Label htmlFor={`edit-link-${item.id}`}>Link do Power BI</Label>
                          <Textarea
                            id={`edit-link-${item.id}`}
                            value={editingLink}
                            onChange={(event) => setEditingLink(event.target.value)}
                            className="min-h-28"
                          />
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button type="button" onClick={handleSaveEdit} disabled={isSaving}>
                          {isSaving ? "Salvando..." : "Salvar"}
                        </Button>
                        <Button type="button" variant="outline" onClick={resetEditing} disabled={isSaving}>
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.source === "custom" ? "Personalizado" : "Padrão"}
                            {item.linkEditable ? " • Com Power BI" : " • Sem Power BI"}
                          </p>
                        </div>
                        <p className="max-w-2xl text-sm text-muted-foreground">
                          {item.description || "Sem descrição personalizada."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartEdit(item)}
                          disabled={processingId === item.id}
                        >
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemove(item)}
                          disabled={processingId === item.id}
                        >
                          {processingId === item.id ? "Removendo..." : "Remover"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Itens removidos</CardTitle>
          <CardDescription>Itens padrão ocultados da home que podem ser restaurados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {hiddenItems.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Nenhum item removido.
            </div>
          ) : (
            hiddenItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card/70 px-4 py-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description || "Sem descrição personalizada."}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleRestore(item)}
                  disabled={processingId === item.id}
                >
                  {processingId === item.id ? "Restaurando..." : "Restaurar"}
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SidebarItemsPage;
