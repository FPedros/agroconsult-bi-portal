import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  deleteSidebarItem,
  fetchSidebarItemsForSector,
  hideBuiltInSidebarItem,
  insertCustomSidebarItem,
  notifySidebarItemsUpdated,
  type SidebarMenuItem,
} from "@/lib/sidebarItems";
import { getBaseMenuItemsBySector, getSectorFromPath, sectorLabels } from "@/lib/sidebarMenu";

const PROTECTED_PATHS = new Set(["/app/relatorios"]);

const isProtectedPath = (path: string) => PROTECTED_PATHS.has(path);

const SidebarItemsPage = () => {
  const location = useLocation();
  const currentSector = useMemo(() => getSectorFromPath(location.pathname), [location.pathname]);
  const sectorLabel = sectorLabels[currentSector] ?? "Setor";
  const [items, setItems] = useState<SidebarMenuItem[]>([]);
  const [title, setTitle] = useState("");
  const [formError, setFormError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError("");
      try {
        const baseItems = getBaseMenuItemsBySector(currentSector);
        const { customItems, hiddenPaths } = await fetchSidebarItemsForSector(currentSector);
        const visibleBase = baseItems
          .filter((item) => !hiddenPaths.has(item.path) || isProtectedPath(item.path))
          .map((item) => ({
            ...item,
            id: item.path,
            isCustom: false,
          }));

        if (isActive) {
          setItems([...visibleBase, ...customItems]);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro ao carregar itens da sidebar.";
        if (isActive) {
          setLoadError(message);
          setItems(
            getBaseMenuItemsBySector(currentSector).map((item) => ({
              ...item,
              id: item.path,
              isCustom: false,
            })),
          );
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
    const { customItems, hiddenPaths } = await fetchSidebarItemsForSector(currentSector);
    const visibleBase = baseItems
      .filter((item) => !hiddenPaths.has(item.path) || isProtectedPath(item.path))
      .map((item) => ({
        ...item,
        id: item.path,
        isCustom: false,
      }));
    setItems([...visibleBase, ...customItems]);
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
    if (!item.isCustom && isProtectedPath(item.path)) {
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
                const isProtected = !item.isCustom && isProtectedPath(item.path);
                return (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card/70 px-4 py-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {item.isCustom ? "Personalizado" : isProtected ? "Fixo" : "Padrão"}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(item)}
                        disabled={removingId === item.id || isProtected}
                      >
                        {removingId === item.id ? "Removendo..." : "Remover"}
                      </Button>
                    </div>
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
