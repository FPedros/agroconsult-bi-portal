import type { AppUser } from "@/contexts/UserContext";

type MvpCredential = {
  login: string;
  password: string;
  user: AppUser;
};

const MVP_CLIENT_SECTOR = "agroeconomics";

const MVP_CREDENTIALS: MvpCredential[] = [
  {
    login: "nicole.heuko",
    password: "N8!q2Lm4",
    user: {
      firstName: "Nicole",
      lastName: "Heuko",
      email: "nicole.heuko@cliente.agroconsult",
      login: "nicole.heuko",
      role: "client",
      allowedSectors: [MVP_CLIENT_SECTOR],
    },
  },
  {
    login: "pedro.takashi",
    password: "T5@v9Xr1",
    user: {
      firstName: "Pedro",
      lastName: "Takashi",
      email: "pedro.takashi@cliente.agroconsult",
      login: "pedro.takashi",
      role: "client",
      allowedSectors: [MVP_CLIENT_SECTOR],
    },
  },
  {
    login: "teste@agroconsult.com.br",
    password: "Agro@2026",
    user: {
      firstName: "Teste",
      lastName: "Agroconsult",
      email: "teste@agroconsult.com.br",
      login: "teste@agroconsult.com.br",
      role: "admin",
      allowedSectors: [],
    },
  },
  {
    login: "teste@agroconsult.com.br",
    password: "1234",
    user: {
      firstName: "Teste",
      lastName: "Agroconsult",
      email: "teste@agroconsult.com.br",
      login: "teste@agroconsult.com.br",
      role: "admin",
      allowedSectors: [],
    },
  },
];

export const authenticateMvpUser = (login: string, password: string): AppUser | null => {
  const normalizedLogin = login.trim().toLowerCase();

  const found = MVP_CREDENTIALS.find(
    (credential) => credential.login.toLowerCase() === normalizedLogin && credential.password === password,
  );

  if (!found) return null;

  return {
    ...found.user,
    allowedSectors: [...found.user.allowedSectors],
  };
};
