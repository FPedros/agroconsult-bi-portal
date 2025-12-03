const ConsultoriaFinanceiroPage = () => {
  return (
    <div className="flex h-full w-full min-h-0">
      <div className="h-full w-full rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          src="https://app.powerbi.com/view?r=eyJrIjoiMmIzNDk0NWUtMzRiZS00Zjg2LWIxNTAtMjEzM2RhNmY5ZDA2IiwidCI6IjRmYWUwODcwLTIwYWEtNGNhMy1iMzE2LTM0N2E1N2IyZWQxMCJ9"
          className="h-full w-full"
          title="Employee Hiring and History"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default ConsultoriaFinanceiroPage;
