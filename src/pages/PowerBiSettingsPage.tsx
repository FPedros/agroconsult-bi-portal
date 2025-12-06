import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { POWER_BI_SECTIONS, PowerBiSection, usePowerBi } from "@/contexts/PowerBiContext";
import { getMenuItemsBySector, getSectorFromPath, sectorLabels } from "@/components/Sidebar";

const PowerBiSettingsPage = () => {
  const location = useLocation();
  const { links, updateLink } = usePowerBi();
  const [selectedSection, setSelectedSection] = useState<PowerBiSection | "">("");
  const [newLink, setNewLink] = useState("");

  const currentSector = useMemo(() => getSectorFromPath(location.pathname), [location.pathname]);

  const availableSections = useMemo(() => {
    const items = getMenuItemsBySector(currentSector);
    const keys = items
      .map((item) => item.powerBiKey)
      .filter((key): key is PowerBiSection => Boolean(key) && key in POWER_BI_SECTIONS);
    const uniqueKeys = Array.from(new Set(keys));
    return uniqueKeys.map((section) => ({
      section,
      label: POWER_BI_SECTIONS[section].label,
    }));
  }, [currentSector]);

  useEffect(() => {
    if (!availableSections.some((item) => item.section === selectedSection)) {
      setSelectedSection(availableSections[0]?.section ?? "");
    }
  }, [availableSections, selectedSection]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSection || !newLink.trim()) return;

    updateLink(selectedSection, newLink);
    toast({
      title: "Power BI atualizado",
      description: `${POWER_BI_SECTIONS[selectedSection].label} agora usa o novo link.`,
    });
    setNewLink("");
  };

  const hasSections = availableSections.length > 0;

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Alterar Power BI</h1>
        <p className="text-muted-foreground">
          Selecione a secao do setor atual ({sectorLabels[currentSector] ?? "Setor"}) e atualize o link do painel.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="secaoPowerBi">Secao do setor atual</Label>
            <Select
              value={selectedSection}
              onValueChange={(value) => setSelectedSection(value as PowerBiSection)}
              disabled={!hasSections}
            >
              <SelectTrigger id="secaoPowerBi">
                <SelectValue
                  placeholder={
                    hasSections ? "Escolha qual secao deseja trocar" : "Nenhuma secao disponivel para este setor"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{sectorLabels[currentSector] ?? "Setor"}</SelectLabel>
                  {availableSections.map((item) => (
                    <SelectItem key={item.section} value={item.section}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          {selectedSection && (
            <div className="space-y-2">
              <Label htmlFor="novoLink">Novo link do Power BI</Label>
              <Textarea
                id="novoLink"
                placeholder='Cole o link ou o iframe completo (ex: <iframe ... src="https://app.powerbi.com/..."></iframe>)'
                value={newLink}
                onChange={(event) => setNewLink(event.target.value)}
                required
                className="min-h-24"
              />
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="submit" disabled={!selectedSection || !newLink.trim()}>
              Salvar novo link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PowerBiSettingsPage;
