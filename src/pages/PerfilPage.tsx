import { useUser } from "@/contexts/UserContext";

const PerfilPage = () => {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Gerenciar Cadastro
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações de perfil.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">
            Nome
          </label>
          <p className="text-lg text-foreground">
            {user?.firstName} {user?.lastName}
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-muted-foreground">
            E-mail
          </label>
          <p className="text-lg text-foreground">{user?.email}</p>
        </div>

        <p className="text-sm text-muted-foreground mt-4">
          * Página em desenvolvimento. Funcionalidade de edição será implementada em breve.
        </p>
      </div>
    </div>
  );
};

export default PerfilPage;
