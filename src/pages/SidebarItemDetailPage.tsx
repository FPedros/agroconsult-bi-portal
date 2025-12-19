import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { fetchSidebarItemById, type SidebarCustomItem } from "@/lib/sidebarItems";

const SidebarItemDetailPage = () => {
  const { itemId, sectorId } = useParams<{ itemId: string; sectorId: string }>();
  const [item, setItem] = useState<SidebarCustomItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;

    const load = async () => {
      if (!itemId) {
        if (isActive) {
          setError("Item invalido.");
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchSidebarItemById(itemId, sectorId);
        if (isActive) {
          if (!data) {
            setError("Item nao encontrado.");
          } else {
            setItem(data);
          }
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao carregar item.";
        if (isActive) {
          setError(message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isActive = false;
    };
  }, [itemId]);

  const title = item?.title ?? "Item da sidebar";
  const hasLink = Boolean(item?.powerBiUrl);

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="flex h-full w-full flex-col rounded-xl border border-border bg-card/80 shadow-lg">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-foreground">{title}</p>
        </div>
        <div className={cn("flex-1", hasLink ? "overflow-hidden" : "flex items-center justify-center p-8 text-center")}>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando item...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : !hasLink ? (
            <p className="text-muted-foreground">Nenhum link do Power BI configurado.</p>
          ) : (
            <iframe src={item?.powerBiUrl} className="h-full w-full" title={title} allowFullScreen />
          )}
        </div>
      </div>
    </div>
  );
};

export default SidebarItemDetailPage;
