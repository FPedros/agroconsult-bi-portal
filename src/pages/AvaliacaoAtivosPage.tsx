const AvaliacaoAtivosPage = () => {
  return (
    <div className="flex h-full w-full min-h-0">
      <div className="h-full w-full rounded-xl border border-border overflow-hidden bg-card shadow-lg">
        <iframe
          src="https://app.powerbi.com/view?r=eyJrIjoiNWMyMDRjZTEtNDc1Zi00OWFjLWE4N2QtZTM2M2FlZDNhZjE5IiwidCI6IjRmYWUwODcwLTIwYWEtNGNhMy1iMzE2LTM0N2E1N2IyZWQxMCJ9"
          className="h-full w-full"
          title="Artificial Intelligence Sample"
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default AvaliacaoAtivosPage;
