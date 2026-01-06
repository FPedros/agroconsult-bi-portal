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
  pulseOffset: number;
  pulseSpeed: number;
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

      const count = 60;
      nodes = Array.from({ length: count }, () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = randomBetween(0.50, 1.25);
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: randomBetween(1, 3),
          pulseOffset: Math.random() * Math.PI * 2,
          pulseSpeed: randomBetween(0.6, 1.2),
        };
      });
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

      const time = performance.now() / 1000;
      const maxDistance = Math.min(200, Math.max(140, Math.min(width, height) * 0.25));
      context.lineWidth = 1;
      context.globalCompositeOperation = "lighter";

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDistance) {
            const alpha = (1 - dist / maxDistance) * 0.55;
            context.strokeStyle = `rgba(120, 255, 210, ${alpha})`;
            context.shadowBlur = 0;
            context.beginPath();
            context.moveTo(a.x, a.y);
            context.lineTo(b.x, b.y);
            context.stroke();
          }
        }
      }

      for (const node of nodes) {
        const pulse = 0.6 + 0.4 * Math.sin(time * node.pulseSpeed + node.pulseOffset);
        const glowAlpha = 0.55 + pulse * 0.35;
        const radius = node.radius * (0.9 + pulse * 0.2);
        context.shadowBlur = 14;
        context.shadowColor = "rgba(120, 255, 210, 0.7)";
        context.fillStyle = `rgba(120, 255, 210, ${glowAlpha})`;
        context.beginPath();
        context.arc(node.x, node.y, radius, 0, Math.PI * 2);
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
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden p-4"
      style={{
        background: "linear-gradient(90deg, #202956 0%, #1A445F 50%, #008747 100%)",
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full z-0 pointer-events-none" aria-hidden="true" />

      <div className="relative z-20 w-full max-w-5xl overflow-hidden rounded-2xl border backdrop-blur-xl shadow-2xl text-white login-body login-card">
        <div className="grid md:grid-cols-[1.1fr_0.9fr]">
          <div className="relative overflow-hidden p-8 md:p-10 login-left">
            <div className="absolute -left-16 -top-24 h-64 w-64 rounded-full bg-[#78FFD2]/20 blur-3xl" />
            <div className="absolute -right-10 -bottom-20 h-56 w-56 rounded-full bg-[#00D08A]/20 blur-3xl" />
            <div
              className="absolute inset-0 opacity-25"
              style={{
                backgroundImage:
                  "linear-gradient(120deg, rgba(120, 255, 210, 0.18), transparent 45%), linear-gradient(to bottom, rgba(255, 255, 255, 0.06) 1px, transparent 1px)",
                backgroundSize: "auto, 100% 18px",
              }}
            />
            <div className="absolute right-6 top-6 rotate-6 rounded-full border border-[#78FFD2]/30 bg-[#78FFD2]/10 px-3 py-1 text-[0.6rem] uppercase tracking-[0.4em] text-[#D7FFF1]/80">
              Acesso restrito
            </div>

            <div className="relative flex h-full flex-col gap-8">
              <div className="flex items-center gap-3">
                <img src="/agroconsult.png" alt="Agroconsult" className="h-10 object-contain" />
                <div>
                  <p className="text-[0.6rem] uppercase tracking-[0.45em] text-[#BFFFE9]/80">Agroconsult</p>
                  <p className="text-sm text-white/70">Business Insights Portal</p>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-[0.7rem] uppercase tracking-[0.5em] text-[#BFFFE9]/70">
                  Núcleo de inteligência
                </p>
                <h1 className="login-banner-title text-3xl leading-tight sm:text-4xl lg:text-5xl">
                  Agroconsult.
                  <br />
                  
                </h1>
                <p className="max-w-md text-sm text-[#D7FFF1]/70 sm:text-base">
                  Dashboards, relatórios e indicadores críticos da Agroconsult em uma linha contínua de decisão.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-[#D7FFF1]/70">
                <span className="rounded-full border border-[#78FFD2]/35 px-3 py-1">Mercado</span>
                <span className="rounded-full border border-[#78FFD2]/35 px-3 py-1">Safra</span>
                <span className="rounded-full border border-[#78FFD2]/35 px-3 py-1">Operações</span>
                <span className="rounded-full border border-[#78FFD2]/35 px-3 py-1">Financeiro</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6 border-t p-8 md:border-l md:border-t-0 md:p-10 login-right">
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
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/45 focus:ring-[#78FFD2]/60 focus:border-[#78FFD2]/40"
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
                  className="bg-white/5 border-white/15 text-white placeholder:text-white/45 focus:ring-[#78FFD2]/60 focus:border-[#78FFD2]/40"
                  required
                />
              </div>

              {error && <p className="text-sm text-red-300">{error}</p>}

              <Button
                id="btnEntrar"
                type="submit"
                className="w-full bg-[#78FFD2]/90 text-[#083330] font-semibold py-3 rounded-lg mt-2 transition-all duration-200 shadow-lg hover:bg-[#8CFFE0] hover:shadow-[0_0_24px_rgba(120,255,210,0.45)]"
              >
                Entrar
              </Button>
            </form>

            <p className="text-xs text-center text-white/50">Agroconsult. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>
      <style>{`
        @import url("https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;600;700&display=swap");

        .login-body {
          font-family: "Comfortaa", sans-serif;
        }

        .login-banner-title {
          font-family: "Comfortaa", sans-serif;
        }

        .login-card {
          background: linear-gradient(
            135deg,
            rgba(18, 27, 56, 0.88) 0%,
            rgba(16, 45, 60, 0.9) 52%,
            rgba(10, 56, 40, 0.86) 100%
          );
          border-color: rgba(120, 255, 210, 0.18);
          box-shadow: 0 25px 80px rgba(6, 14, 32, 0.6);
        }

        .login-left {
          background: linear-gradient(
            140deg,
            rgba(32, 41, 86, 0.45) 0%,
            rgba(26, 68, 95, 0.38) 45%,
            rgba(0, 135, 71, 0.2) 100%
          );
        }

        .login-right {
          background: linear-gradient(165deg, rgba(11, 21, 44, 0.65), rgba(8, 35, 40, 0.45));
          border-color: rgba(120, 255, 210, 0.12);
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
