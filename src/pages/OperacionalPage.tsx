import { usePowerBi } from "@/contexts/PowerBiContext";

const OperacionalPage = () => {
  const { links } = usePowerBi();

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="h-full w-full rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          src={links["consultoria-operacional"]}
          className="h-full w-full"
          title="Revenue Opportunities"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default OperacionalPage;
