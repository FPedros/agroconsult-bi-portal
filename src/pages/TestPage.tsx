import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Sector } from "@/lib/types";

const TestPage = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ data?: Sector[]; error?: string } | null>(null);

  useEffect(() => {
    const run = async () => {
      const { data, error } = await supabase.from<Sector>("sectors").select("*").limit(5);
      if (error) {
        setResult({ error: error.message });
      } else {
        setResult({ data });
      }
      setLoading(false);
    };

    run();
  }, []);

  if (loading) return <p>Testando conexao...</p>;

  return (
    <pre style={{ background: "#222", color: "#0f0", padding: "1rem" }}>
      {JSON.stringify(result, null, 2)}
    </pre>
  );
};

export default TestPage;
