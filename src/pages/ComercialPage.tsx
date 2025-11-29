const ComercialPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Painel Comercial 
        </h1>
        <p className="text-muted-foreground">
          Espaço para dashboards de inteligência de mercado e performance comercial.
        </p>
      </div>

      <div className="mt-4 w-full aspect-[16/9] rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          src="about:blank"
          className="w-full h-full"
          title="Dashboard Comercial Agroconsult"
          // Substitua o src deste iframe pelo link do BI Comercial Agroconsult
        />
      </div>
    </div>
  );
};

export default ComercialPage;
