import { usePowerBi } from "@/contexts/PowerBiContext";

const AvaliacaoAtivosPage = () => {
  const { links } = usePowerBi();

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="h-full w-full rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          src={links["avaliacao-ativos"]}
          className="h-full w-full"
          title="Artificial Intelligence Sample"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default AvaliacaoAtivosPage;
