import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// ======================================================
// ROLES DE AUTENTICACIÓN
// ======================================================

export type UserRole =
  | "USER"
  | "CLIENT_USER"
  | "CLIENT_ADMIN"
  | "PROFESSIONAL"
  | "COORDINATOR"
  | "ADMIN"
  | "OWNER"
  | "SUPERADMIN";

// ======================================================
// TIPOS RELACIONADOS
// ======================================================

export type BackendUserRole =
  | "USUARIO"
  | "USUARIO_CLIENTE"
  | "ADMIN_CLIENTE"
  | "PROFESIONAL"
  | "COORDINADOR"
  | "ADMIN"
  | "PROPIETARIO"
  | "SUPERADMIN";


export interface CompanySummary {
  id: string;
  name: string;
  taxId: string;
  isActive: boolean;
}

export interface ProfessionalSummary {
  id: string;
  firstNames: string;
  lastNames: string;
  identificationNumber?: string;
  profession?: string | null;
  professionalRole?: string | null;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  rol?: BackendUserRole;

  companyId: string | null;
  professionalId: string | null;

  company: CompanySummary | null;
  professional: ProfessionalSummary | null;

  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ======================================================
// RESPUESTAS DEL BACKEND
// ======================================================

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

// ======================================================
// CONTEXTO
// ======================================================

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;

  login: (userData: User, token: string) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;

  hasRole: (...roles: UserRole[]) => boolean;
  isInternalUser: boolean;
  isProfessional: boolean;
  isClientUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

// ======================================================
// CONFIGURACIÓN
// ======================================================

const TOKEN_STORAGE_KEY = "sis_token";
const USER_STORAGE_KEY = "sis_user";

const API_URL = (
  import.meta.env.VITE_API_URL as string | undefined
)?.replace(/\/$/, "");

const USER_ROLE_BY_BACKEND_ROLE: Record<
  BackendUserRole,
  UserRole
> = {
  USUARIO: "USER",
  USUARIO_CLIENTE: "CLIENT_USER",
  ADMIN_CLIENTE: "CLIENT_ADMIN",
  PROFESIONAL: "PROFESSIONAL",
  COORDINADOR: "COORDINATOR",
  ADMIN: "ADMIN",
  PROPIETARIO: "OWNER",
  SUPERADMIN: "SUPERADMIN",
};

function normalizeUser(user: User): User {
  const role = user.rol
    ? USER_ROLE_BY_BACKEND_ROLE[user.rol]
    : user.role;

  return {
    ...user,
    role,
  };
}

function saveSession(user: User, token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(
    USER_STORAGE_KEY,
    JSON.stringify(user)
  );
}

function clearSession(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(USER_STORAGE_KEY);
}

function getStoredUser(): User | null {
  const storedUser = localStorage.getItem(USER_STORAGE_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return normalizeUser(
      JSON.parse(storedUser) as User
    );
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

// ======================================================
// PROVIDER
// ======================================================

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(
    () => getStoredUser()
  );

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_STORAGE_KEY)
  );

  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearSession();
  }, []);

  const login = useCallback(
    (userData: User, newToken: string) => {
      const normalizedUser =
        normalizeUser(userData);

      setUser(normalizedUser);
      setToken(newToken);
      saveSession(normalizedUser, newToken);
    },
    []
  );

  const refreshSession = useCallback(async () => {
    const storedToken =
      localStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      logout();
      return;
    }

    if (!API_URL) {
      console.error(
        "VITE_API_URL no está configurada."
      );
      logout();
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/api/auth/me`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) {
        logout();
        return;
      }

      const currentUser = normalizeUser(
        (await response.json()) as User
      );

      setUser(currentUser);
      setToken(storedToken);
      saveSession(currentUser, storedToken);
    } catch (error) {
      console.error(
        "No fue posible validar la sesión:",
        error
      );

      /*
       * No cerramos automáticamente la sesión por un error
       * temporal de red. Conservamos los datos almacenados
       * para evitar sacar al usuario por una caída momentánea.
       */
      const storedUser = getStoredUser();

      if (storedUser) {
        setUser(storedUser);
        setToken(storedToken);
      } else {
        logout();
      }
    }
  }, [logout]);

  useEffect(() => {
    let active = true;

    const initializeSession = async () => {
      try {
        await refreshSession();
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initializeSession();

    return () => {
      active = false;
    };
  }, [refreshSession]);

  const hasRole = useCallback(
    (...roles: UserRole[]): boolean => {
      if (!user) {
        return false;
      }

      return roles.includes(user.role);
    },
    [user]
  );

  const isInternalUser = useMemo(() => {
    return hasRole(
      "ADMIN",
      "OWNER",
      "SUPERADMIN"
    );
  }, [hasRole]);

  const isProfessional = useMemo(() => {
    return hasRole(
      "PROFESSIONAL",
      "COORDINATOR"
    );
  }, [hasRole]);

  const isClientUser = useMemo(() => {
    return hasRole(
      "CLIENT_USER",
      "CLIENT_ADMIN"
    );
  }, [hasRole]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(user && token),

      login,
      logout,
      refreshSession,

      hasRole,
      isInternalUser,
      isProfessional,
      isClientUser,
    }),
    [
      user,
      token,
      loading,
      login,
      logout,
      refreshSession,
      hasRole,
      isInternalUser,
      isProfessional,
      isClientUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ======================================================
// HOOK
// ======================================================

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth debe utilizarse dentro de AuthProvider."
    );
  }

  return context;
}