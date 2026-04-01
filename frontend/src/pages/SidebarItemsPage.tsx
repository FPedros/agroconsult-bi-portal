import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteSidebarItem,
  fetchSidebarItemsForSector,
  hideBuiltInSidebarItem,
  insertCustomSidebarItem,
  notifySidebarItemsUpdated,
  updateBaseItemTitle,
  updateSidebarItemLink,
  updateSidebarItemTitle,
  type SidebarMenuItem,
} from "@/lib/sidebarItems";
import { getBaseMenuItemsBySector, getSectorFromPath, sectorLabels } from "@/lib/sidebarMenu";
import { fetchPowerBiLinkBySectorAndPanel, upsertPowerBiLink } from "@/lib/powerBiRepository";
import { PowerBiSection } from "@/contexts/PowerBiContext";
import { PowerBiPanel } from "@/lib/types";

const PROTECTED_PATHS = new Set(["/app/relatorios"]);

const parseSection = (section?: PowerBiSection): { sectorSlug: string; panel: PowerBiPanel } | null => {
  if (!section) return null;
  const panels: PowerBiPanel[] = ["comercial", "operacional", "financeiro", "principal"];
  const match = panels.find((panel) => section.endsWith(`-${panel}`));
  if (!match) return null;

  const sectorSlug = section.slice(0, section.length - (match.length + 1));
  return sectorSlug ? { sectorSlug, panel: match } : null;
};

const SidebarItemsPage = () => {
  const location = useLocation();
  const currentSector = useMemo(
    () => getSectorFromPath(location.pathname, location.search),
    [location.pathname, location.search],
  );
  const sectorLabel = sectorLabels[currentSector] ?? "Setor";
  const [items, setItems] = useState<SidebarMenuItem[]>([]);
  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingPowerBiId, setEditingPowerBiId] = useState<string | null>(null);
  const [editingPowerBiLink, setEditingPowerBiLink] = useState("");
  const [savingPowerBiId, setSavingPowerBiId] = useState<string | null>(null);

  const hydrateItemsWithPowerBi = async (sector: string, baseItems: ReturnType<typeof getBaseMenuItemsBySector>, customItems: SidebarMenuItem[], hiddenPaths: Set<string>, renamedTitles: Map<string, string>) => {
    const visibleBase = baseItems
      .filter((item) => !hiddenPaths.has(item.path) || PROTECTED_PATHS.has(item.path))
      .map((item) => ({
        ...item,
        id: item.path,
        title: renamedTitles.get(item.path) || item.title,
        isCustom: false,
        isProtected: PROTECTED_PATHS.has(item.path),
      }));

    const baseWithLinks = await Promise.all(
      visibleBase.map(async (item) => {
        if (!item.powerBiKey) {
          return { ...item, powerBiUrl: "" };
        }

        const parsed = parseSection(item.powerBiKey);
        if (!parsed) {
          return { ...item, powerBiUrl: "" };
        }

        const data = await fetchPowerBiLinkBySectorAndPanel(parsed.sectorSlug, parsed.panel);
        return { ...item, powerBiUrl: data?.url ?? "" };
      }),
    );

    return [...baseWithLinks, ...customItems.map((item) => ({ ...item, isProtected: false }))];
  };

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const baseItems = getBaseMenuItemsBySector(currentSector);
        const { customItems, hiddenPaths, renamedTitles } = await fetchSidebarItemsForSector(currentSector);
        const hydratedItems = await hydrateItemsWithPowerBi(currentSector, baseItems, customItems, hiddenPaths, renamedTitles);

        if (isActive) {
          setItems(hydratedItems);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao carregar itens da sidebar.";
        if (isActive) {
          setLoadError(message);
          setItems([]);
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [currentSector]);

  const refreshItems = async () => {
    const baseItems = getBaseMenuItemsBySector(currentSector);
    const { customItems, hiddenPaths, renamedTitles } = await fetchSidebarItemsForSector(currentSector);
    const hydratedItems = await hydrateItemsWithPowerBi(currentSector, baseItems, customItems, hiddenPaths, renamedTitles);
    setItems(hydratedItems);
  };

  const handleAdd = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setFormError("Informe um título.");
      return;
    }

    const hasTitle = items.some((item) => item.title.toLowerCase() === trimmedTitle.toLowerCase());

    if (hasTitle) {
      setFormError("Já existe um item com este título.");
      return;
    }

    setIsSaving(true);
    setFormError("");
    try {
      await insertCustomSidebarItem({ sector: currentSector, title: trimmedTitle });
      setTitle("");
      notifySidebarItemsUpdated();
      await refreshItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao cadastrar item.";
      setFormError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (item: SidebarMenuItem) => {
    setFormError("");
    if (item.isProtected) {
      setFormError("O item Relatórios é fixo e não pode ser removido.");
      return;
    }
    
    setRemovingId(item.id);
    try {
      if (item.isCustom) {
        await deleteSidebarItem(item.id);
      } else {
        await hideBuiltInSidebarItem({
          sector: currentSector,
          title: item.title,
          path: item.path,
        });
      }
      notifySidebarItemsUpdated();
      await refreshItems();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao remover item.";
      setFormError(message);
    } finally {
      setRemovingId(null);
    }
  };

  const handleStartEdit = (item: SidebarMenuItem) => {
    setEditingId(item.id);
    setEditingTitle(item.title);
    setFormError("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingTitle("");
    setFormError("");
  };

  const handleStartPowerBiEdit = (item: SidebarMenuItem) => {
    setEditingPowerBiId(item.id);
    setEditingPowerBiLink(item.powerBiUrl ?? "");
    setFormError("");
  };

  const handleCancelPowerBiEdit = () => {
    setEditingPowerBiId(null);
    setEditingPowerBiLink("");
    setFormError("");
  };

  const handleSaveEdit = async (item: SidebarMenuItem) => {
    const trimmedTitle = editingTitle.trim();

    if (!trimmedTitle) {
      setFormError("O título não pode estar vazio.");
      return;
    }

    if (trimmedTitle === item.title) {
      handleCancelEdit();
      return;
    }

    const hasTitle = items.some(
      (i) => i.id !== item.id && i.title.toLowerCase() === trimmedTitle.toLowerCase()
    );

    if (hasTitle) {
      setFormError("Já existe um item com este título.");
      return;
    }

    setFormError("");
    try {
      if (item.isCustom) {
        await updateSidebarItemTitle(item.id, trimmedTitle);
      } else {
        await updateBaseItemTitle({
          sector: currentSector,
          path: item.path,
          newTitle: trimmedTitle,
        });
      }
      notifySidebarItemsUpdated();
      await refreshItems();
      handleCancelEdit();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao renomear item.";
      setFormError(message);
    }
  };

  const handleSavePowerBi = async (item: SidebarMenuItem) => {
    const trimmedLink = editingPowerBiLink.trim();

    if (!trimmedLink) {
      setFormError("Informe o link do Power BI.");
      return;
    }

    setFormError("");
    setSavingPowerBiId(item.id);

    try {
      if (item.isCustom) {
        await updateSidebarItemLink(item.id, trimmedLink);
      } else {
        const parsed = parseSection(item.powerBiKey);
        if (!parsed) {
          throw new Error("Este item não possui uma seção Power BI configurável.");
        }

        await upsertPowerBiLink({
          sectorSlug: parsed.sectorSlug,
          panel: parsed.panel,
          url: trimmedLink,
          sectorName: sectorLabels[currentSector] ?? parsed.sectorSlug,
        });
      }

      notifySidebarItemsUpdated();
      await refreshItems();
      handleCancelPowerBiEdit();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro ao salvar link do Power BI.";
      setFormError(message);
    } finally {
      setSavingPowerBiId(null);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Gerenciar itens da sidebar</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre novos itens ou remova opções do menu lateral. Itens removidos podem ser cadastrados novamente.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Cadastrar item</CardTitle>
            <CardDescription>
              Cadastro sempre no setor atual ({sectorLabel}). Informe o título. O caminho é gerado automaticamente.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentSector">Setor atual</Label>
              <Input id="currentSector" value={sectorLabel} readOnly />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sidebarTitle">Título</Label>
              <Input
                id="sidebarTitle"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Ex: Painel Safra"
              />
            </div>

            {formError && <p className="text-sm text-red-500">{formError}</p>}

            <Button type="button" className="w-full" onClick={handleAdd} disabled={isSaving}>
              {isSaving ? "Salvando..." : "Cadastrar item"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens atuais</CardTitle>
            <CardDescription>Itens exibidos no menu lateral do setor atual ({sectorLabel}).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadError && <p className="text-sm text-red-500">{loadError}</p>}
            {isLoading ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Carregando itens...
              </div>
            ) : items.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                Nenhum item cadastrado para este setor.
              </div>
            ) : (
              items.map((item) => {
                const isEditing = editingId === item.id;
                const isEditingPowerBi = editingPowerBiId === item.id;
                const canEditPowerBi = !item.isProtected && (item.isCustom || Boolean(item.powerBiKey));
                
                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-border bg-card/70 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      {isEditing ? (
                        <div className="flex-1 space-y-2">
                          <Input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            placeholder="Novo título"
                            className="w-full"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">{item.title}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-3">
                        {!isEditing && !isEditingPowerBi && (
                          <span className="text-xs text-muted-foreground">
                            {item.isProtected ? "Fixo" : item.isCustom ? "Personalizado" : "Padrão"}
                          </span>
                        )}
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={() => handleSaveEdit(item)}
                            >
                              Salvar
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCancelEdit}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : isEditingPowerBi ? (
                          <>
                            <Button
                              type="button"
                              variant="default"
                              size="sm"
                              onClick={() => handleSavePowerBi(item)}
                              disabled={savingPowerBiId === item.id}
                            >
                              {savingPowerBiId === item.id ? "Salvando..." : "Salvar BI"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleCancelPowerBiEdit}
                              disabled={savingPowerBiId === item.id}
                            >
                              Cancelar
                            </Button>
                          </>
                        ) : (
                          <>
                            {canEditPowerBi && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartPowerBiEdit(item)}
                                disabled={removingId === item.id}
                              >
                                Power BI
                              </Button>
                            )}
                            {!item.isProtected && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleStartEdit(item)}
                                disabled={removingId === item.id}
                              >
                                Renomear
                              </Button>
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemove(item)}
                              disabled={removingId === item.id || item.isProtected}
                            >
                              {removingId === item.id ? "Removendo..." : "Remover"}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {isEditingPowerBi && (
                      <div className="mt-4 space-y-2 border-t border-border pt-4">
                        <Label htmlFor={`powerbi-${item.id}`}>Link do Power BI</Label>
                        <Textarea
                          id={`powerbi-${item.id}`}
                          value={editingPowerBiLink}
                          onChange={(event) => setEditingPowerBiLink(event.target.value)}
                          placeholder='Cole o link ou o iframe completo (ex: <iframe ... src="https://app.powerbi.com/..."></iframe>)'
                          className="min-h-24"
                        />
                        <p className="text-xs text-muted-foreground">
                          {item.isCustom
                            ? "Este link será usado quando o usuário abrir este item personalizado."
                            : "Este link será usado pelo painel padrão deste item no setor atual."}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SidebarItemsPage;
