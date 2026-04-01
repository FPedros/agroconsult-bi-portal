import type { AppUser } from "@/contexts/UserContext";

type MockCredential = {
  login: string;
  password: string;
  user: AppUser;
};

const MOCK_CREDENTIALS: MockCredential[] = [
  {
    login: "teste@agroconsult.com.br",
    password: "1234",
    user: {
      firstName: "Teste",
      lastName: "Agroconsult",
      email: "teste@agroconsult.com.br",
    },
  },
  {
    login: "teste@agroconsult.com.br",
    password: "Agro#2025!",
    user: {
      firstName: "Teste",
      lastName: "Agroconsult",
      email: "teste@agroconsult.com.br",
    },
  },
  {
    login: "nicole.heuko",
    password: "N8!q2Lm4",
    user: {
      firstName: "Nicole",
      lastName: "Heuko",
      email: "nicole.heuko@agroconsult.com.br",
    },
  },
  {
    login: "pedro.takashi",
    password: "T5@v9Xr1",
    user: {
      firstName: "Pedro",
      lastName: "Takashi",
      email: "pedro.takashi@agroconsult.com.br",
    },
  },
];

export const authenticateLocalUser = (login: string, password: string): AppUser | null => {
  const normalizedLogin = login.trim().toLowerCase();

  const match = MOCK_CREDENTIALS.find(
    (credential) => credential.login.toLowerCase() === normalizedLogin && credential.password === password,
  );

  return match ? { ...match.user } : null;
};
