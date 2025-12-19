import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";

const PerfilPage = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-3xl font-bold text-foreground">Gerenciar Cadastro</h1>
        <p className="text-muted-foreground">Gerencie suas informações de perfil.</p>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Nome</label>
          <p className="text-lg text-foreground">
            {user?.firstName} {user?.lastName}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">E-mail</label>
          <p className="text-lg text-foreground">{user?.email}</p>
        </div>

        <div className="rounded-lg border border-border/60 bg-muted/10 p-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Recuperar senha</p>
              <p className="text-sm text-muted-foreground">
                Envie um e-mail para redefinir sua senha e recuperar o acesso.
              </p>
            </div>
            <Button variant="secondary" onClick={() => navigate("/recuperar-senha")}>
              Ir para recuperar senha
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilPage;
