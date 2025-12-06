import { usePowerBi } from "@/contexts/PowerBiContext";

const ComercialPage = () => {
  const { links } = usePowerBi();

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="h-full w-full rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          src={links["consultoria-comercial"]}
          className="h-full w-full"
          title="Processos_Consultoria_novo"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ComercialPage;
