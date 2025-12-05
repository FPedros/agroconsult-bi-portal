const ComercialPage = () => {
  return (
    <div className="flex h-full w-full min-h-0">
      <div className="h-full w-full rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          src="https://app.powerbi.com/view?r=eyJrIjoiODgyM2M1NmItNjk0Yy00MTM1LTk1MTMtOGNjYWYzYzM5NDVlIiwidCI6IjRmYWUwODcwLTIwYWEtNGNhMy1iMzE2LTM0N2E1N2IyZWQxMCJ9"
          className="h-full w-full"
          title="Processos_Consultoria_novo"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ComercialPage;
