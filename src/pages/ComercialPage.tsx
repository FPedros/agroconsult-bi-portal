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
          src="https://app.powerbi.com/view?r=eyJrIjoiOGY5OThmNWQtYTExMS00MGMzLWIyMzEtZGUyZjRkODM5MzU3IiwidCI6IjRmYWUwODcwLTIwYWEtNGNhMy1iMzE2LTM0N2E1N2IyZWQxMCJ9"
          className="w-full h-full"
          title="Agrovalora_Dashboard_vf"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ComercialPage;
