import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUser } from "@/contexts/UserContext";

type NeuralNode = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
};

const LandingPage = () => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    setError("E-mail ou senha inválidos.");
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let nodes: NeuralNode[] = [];
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.min(120, Math.max(50, Math.floor((width * height) / 12000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: randomBetween(-0.4, 0.4),
        vy: randomBetween(-0.4, 0.4),
        radius: randomBetween(1, 2.4),
      }));
    };

    const draw = () => {
      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(draw);
        return;
      }

      context.clearRect(0, 0, width, height);

      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x <= 0 || node.x >= width) node.vx *= -1;
        if (node.y <= 0 || node.y >= height) node.vy *= -1;
      }

      const maxDistance = Math.min(200, Math.max(120, Math.min(width, height) * 0.2));
      context.lineWidth = 1.4;

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDistance) {
            const alpha = 1 - dist / maxDistance;
            context.strokeStyle = `rgba(80, 255, 120, ${alpha * 0.7})`;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      for (const node of nodes) {
        context.fillStyle = "rgba(140, 255, 170, 0.95)";
        context.beginPath();
        context.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        context.fill();
      }

      if (!reduceMotion) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950 p-4">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full z-0 pointer-events-none" aria-hidden="true" />
      <div className="absolute inset-0 z-10 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 80% at 50% 0%, rgba(0, 255, 150, 0.2), rgba(0, 0, 0, 0.95) 60%), radial-gradient(45% 45% at 80% 15%, rgba(0, 255, 130, 0.18), transparent 60%), linear-gradient(180deg, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.9))",
          }}
        />
        <div
          className="absolute inset-0 opacity-40 mix-blend-screen"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(0, 255, 140, 0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 255, 140, 0.08) 1px, transparent 1px)",
            backgroundSize: "120px 120px",
          }}
        />
        <div
          className="absolute inset-x-[-15%] bottom-[-35%] h-[70%] opacity-60"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, rgba(0, 255, 120, 0.35) 0px, rgba(0, 255, 120, 0.35) 1px, transparent 1px, transparent 16px)",
            transform: "perspective(900px) rotateX(65deg)",
            transformOrigin: "top center",
            filter: "blur(0.2px)",
          }}
        />
      </div>
      <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] z-10 pointer-events-none" aria-hidden="true" />

      <div className="relative z-20 w-full max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/70 backdrop-blur-xl shadow-2xl text-white login-body">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden p-8 md:p-10">
            <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-emerald-400/25 blur-3xl" />
            <div className="absolute -right-10 -bottom-20 h-56 w-56 rounded-full bg-lime-300/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, rgba(16, 185, 129, 0.18), transparent 45%), linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
                backgroundSize: "auto, 100% 18px",
              }}
            />
            <div className="absolute right-6 top-6 rotate-6 rounded-full border border-emerald-300/40 bg-emerald-500/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-emerald-100/80">
              Acesso restrito
            </div>

            <div className="relative flex h-full flex-col gap-8">
              <div className="flex items-center gap-3">
                <img src="/agroconsult.png" alt="Agroconsult" className="h-10 object-contain" />
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.45em] text-emerald-200/80">Agroconsult</p>
                  <p className="text-sm text-white/70">Business Insights Portal</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[0.7rem] uppercase tracking-[0.5em] text-emerald-200/70">
                  Núcleo de inteligência
                </p>
                <h1 className="login-banner-title text-3xl leading-tight sm:text-4xl lg:text-5xl">
                  BI em estado líquido.
                  <br />
                  <span className="text-emerald-200">Sinais que viram ação.</span>
                </h1>
                <p className="max-w-md text-sm text-emerald-50/70 sm:text-base">
                  Dashboards, relatórios e indicadores críticos da Agroconsult em uma linha contínua de decisão.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-emerald-50/70">
                <span className="rounded-full border border-emerald-400/40 px-3 py-1">Mercado</span>
                <span className="rounded-full border border-emerald-400/40 px-3 py-1">Safra</span>
                <span className="rounded-full border border-emerald-400/40 px-3 py-1">Operações</span>
                <span className="rounded-full border border-emerald-400/40 px-3 py-1">Financeiro</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t border-white/10 p-8 md:border-l md:border-t-0 md:p-10">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Acesso</p>
              <h2 className="text-2xl font-semibold">Entrar no portal</h2>
              <p className="text-sm text-white/60">Use suas credenciais para continuar.</p>
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
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:ring-emerald-300"
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
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:ring-emerald-300"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}

              <Button
                id="btnEntrar"
                type="submit"
                className="w-full bg-emerald-400/90 text-emerald-950 font-semibold py-3 rounded-lg mt-2 transition-all duration-200 shadow-lg hover:bg-emerald-300 hover:shadow-[0_0_22px_rgba(52,211,153,0.45)]"
              >
                Entrar
              </Button>
            </form>

            <p className="text-xs text-center text-white/50">Agroconsult. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Unbounded:wght@500;700&display=swap");

        .login-body {
          font-family: "Space Grotesk", sans-serif;
        }

        .login-banner-title {
          font-family: "Unbounded", sans-serif;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
