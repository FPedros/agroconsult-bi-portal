const OperacionalPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Painel Operacional 
        </h1>
        <p className="text-muted-foreground">
          Indicadores agronômicos, operacionais e de campo.
        </p>
      </div>

      <div className="mt-4 w-full aspect-[16/9] rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          src="about:blank"
          className="w-full h-full"
          title="Dashboard Operacional Agroconsult"
          // Substitua o src deste iframe pelo link do BI Operacional Agroconsult
        />
      </div>
    </div>
  );
};

export default OperacionalPage;
