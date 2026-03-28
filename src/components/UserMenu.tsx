import { useNavigate } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { User, Settings, LogOut, ListPlus, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { canUserManageSettings } from "@/lib/access";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface UserMenuProps {
  collapsed?: boolean;
  variant?: "sidebar" | "home";
}

const UserMenu = ({ collapsed = false, variant = "sidebar" }: UserMenuProps) => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const showManagementActions = canUserManageSettings(user);
  const isHomeVariant = variant === "home";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            isHomeVariant
              ? "h-auto justify-start rounded-xl border border-[#78FFD2]/20 bg-[rgba(32,41,86,0.45)] px-4 py-3 text-white shadow-[0_25px_80px_rgba(6,14,32,0.35)] backdrop-blur-xl hover:bg-[rgba(32,41,86,0.62)] hover:text-white"
              : "flex w-full items-center gap-2 px-2 hover:bg-sidebar-accent",
            collapsed ? "justify-center" : "justify-start",
          )}
          aria-label={collapsed || isHomeVariant ? "Abrir menu do usuário" : undefined}
        >
          <div
            className={cn(
              "flex items-center justify-center rounded-full",
              isHomeVariant ? "h-10 w-10 bg-[#78FFD2]/15 text-[#78FFD2]" : "h-9 w-9 bg-primary/20",
            )}
          >
            <User className={cn(isHomeVariant ? "h-5 w-5" : "h-4 w-4 text-primary")} />
          </div>
          {!collapsed && (
            isHomeVariant ? (
              <div className="text-left">
                <p className="text-sm font-semibold text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-[#D7FFF1]/75">{user.email}</p>
              </div>
            ) : (
              <span className="text-sm font-medium text-foreground">
                {user.firstName} {user.lastName}
              </span>
            )
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {showManagementActions && (
          <>
            <DropdownMenuItem
              onClick={() => navigate("/app/relatorios/gerenciar")}
              className="cursor-pointer"
            >
              <FileUp className="mr-2 h-4 w-4" />
              <span>Gerenciar relatórios</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/app/perfil")}
              className="cursor-pointer"
            >
              <Settings className="mr-2 h-4 w-4" />
              <span>Gerenciar cadastro</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/app/itens-sidebar")}
              className="cursor-pointer"
            >
              <ListPlus className="mr-2 h-4 w-4" />
              <span>Gerenciar itens da home</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
