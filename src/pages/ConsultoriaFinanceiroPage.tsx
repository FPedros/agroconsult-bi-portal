import { usePowerBi } from "@/contexts/PowerBiContext";

const ConsultoriaFinanceiroPage = () => {
  const { links } = usePowerBi();

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="h-full w-full rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          title="Processos_Consultoria_novo"
          src={links["consultoria-financeiro"]}
          className="h-full w-full"
          frameBorder="0"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ConsultoriaFinanceiroPage;
