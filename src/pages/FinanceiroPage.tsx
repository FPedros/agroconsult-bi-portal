import { usePowerBi } from "@/contexts/PowerBiContext";

const FinanceiroPage = () => {
  const { links } = usePowerBi();

  return (
    <div className="flex h-full w-full min-h-0">
      <div className="h-full w-full rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          src={links["financeiro-principal"]}
          className="h-full w-full"
          title="Employee Hiring and History"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default FinanceiroPage;
