import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Leaf } from "lucide-react";

const LandingPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleEntrar = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/app/comercial");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full rounded-xl shadow-2xl bg-card/50 backdrop-blur-sm border border-border p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Leaf className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Portal Agroconsult
            </h1>
            <p className="text-muted-foreground text-sm">
              Consultoria e Inteligência de Mercado
            </p>
          </div>
        </div>

        <form onSubmit={handleEntrar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="inpEmail" className="text-sm font-medium text-foreground">
              E-mail
            </label>
            <Input
              id="inpEmail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-secondary border-border focus:ring-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="inpSenha" className="text-sm font-medium text-foreground">
              Senha
            </label>
            <Input
              id="inpSenha"
              type="password"
              placeholder="••••••••"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="bg-secondary border-border focus:ring-primary"
              required
            />
          </div>

          <Button
            id="btnEntrar"
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg mt-2 transition-all duration-200 shadow-lg hover:shadow-[var(--glow-emerald)]"
          >
            Entrar
          </Button>
        </form>

        <p className="text-xs text-center text-muted-foreground mt-2">
          © 2024 Agroconsult. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
