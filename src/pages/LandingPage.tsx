import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";

const LandingPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");

  const handleEntrar = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    const isValidUser =
      normalizedEmail === "teste@agroconsult.com.br" && (senha === "1234" || senha === "Agro#2025!");

    if (isValidUser) {
      setUser({
        firstName: "Teste",
        lastName: "Agroconsult",
        email: "teste@agroconsult.com.br",
      });
      setError("");
      navigate("/app");
      return;
    }

    setError("E-mail ou senha invalidos.");
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background p-4">
      <div className="absolute inset-0 bg-[url('/login-image.png')] bg-cover bg-center" aria-hidden="true" />
      <div className="absolute inset-0 bg-background/75 backdrop-brightness-95" aria-hidden="true" />

      <div className="relative max-w-md w-full rounded-xl shadow-xl bg-neutral-950/70 backdrop-blur-md border border-white/10 p-8 flex flex-col gap-6 text-white">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src="/agroconsult.png" alt="Agroconsult" className="h-12 object-contain" />
          <p className="text-white/70 text-sm">Business Insights Portal</p>
        </div>

        <form onSubmit={handleEntrar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="inpEmail" className="text-sm font-medium text-white/90">
              E-mail
            </label>
            <Input
              id="inpEmail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-primary"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="inpSenha" className="text-sm font-medium text-white/90">
              Senha
            </label>
            <Input
              id="inpSenha"
              type="password"
              placeholder="********"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:ring-primary"
              required
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <Button
            id="btnEntrar"
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg mt-2 transition-all duration-200 shadow-lg hover:shadow-[var(--glow-emerald)]"
          >
            Entrar
          </Button>
        </form>

        <p className="text-xs text-center text-white/70 mt-2">
          Agroconsult. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
};

export default LandingPage;
