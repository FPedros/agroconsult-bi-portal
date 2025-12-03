const OperacionalPage = () => {
  return (
    <div className="flex h-full w-full min-h-0">
      <div className="h-full w-full rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          src="https://app.powerbi.com/view?r=eyJrIjoiYzY2MDUzZmMtY2YwMC00ZjFmLWI4MjQtYTdkN2VlNTRmOGZjIiwidCI6IjRmYWUwODcwLTIwYWEtNGNhMy1iMzE2LTM0N2E1N2IyZWQxMCJ9"
          className="h-full w-full"
          title="Revenue Opportunities"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default OperacionalPage;
