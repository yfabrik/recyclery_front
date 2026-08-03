import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { toast } from "react-toastify";
import {
  getApiErrorMessage,
  getApiSuccessMessage,
} from "../utils/apiToastMessage";
import { updateProfile as updateProfileApi } from "../services/api/profile";
import {
  getProfile,
  login as loginApi,
  register as registerApi,
} from "../services/api/auth";
import axiosInstance from "../services/api/axios";
import type { AuthUserModel } from "../interfaces/Models";
import type { ProfileFormPayload } from "../services/mapper/profile";

const PERMISSIONS = {
  admin: {
    dashboard: ["read", "write"],
    arrival: ["read", "write"],
    label: ["read", "write"],
    caisse: ["read", "write"],
    waste: ["read", "write"],
    administration: ["read", "write"],

    config: ["read", "write"],
    sales: ["read", "write"],
    dons: ["read", "write"],
    planning: ["read", "write"],
    users: ["read", "write"],
  },
  employee: {
    dashboard: ["read", "write"],
    arrival: ["read", "write"],
    label: ["read", "write"],
    caisse: ["read", "write"],
    waste: ["read", "write"],
    administration: [],
    config: [],
    sales: [],
    dons: [],
    planning: [],
    users: [],
  },
  manager: {
    dashboard: ["read", "write"],
    arrival: ["read", "write"],
    label: ["read", "write"],
    caisse: ["read", "write"],
    waste: ["read", "write"],
    administration: ["read", "write"],
    config: ["read", "write"],
    sales: ["read", "write"],
    dons: ["read", "write"],
    planning: ["read", "write"],
    users: ["read", "write"],
  },
} as const;

export type PermissionRole = keyof typeof PERMISSIONS;
export type PermissionModule = keyof (typeof PERMISSIONS)[PermissionRole];
export type PermissionAction =
  (typeof PERMISSIONS)[PermissionRole][PermissionModule][number];

interface AuthContextValue {
  user: AuthUserModel | null;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  hasModuleAccess: (
    module: PermissionModule,
    action?: PermissionAction,
  ) => boolean;
  isAuthenticated: boolean;
  updateProfile: (
    data: ProfileFormPayload,
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

interface AuthProps {
  children: ReactNode;
}
export const AuthProvider = ({ children }: AuthProps) => {
  const [user, setUser] = useState<AuthUserModel | null>(null);
  const [loading, setLoading] = useState(true);

  const setupAxiosInterceptors = (token: string | null) => {
    if (token) {
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axiosInstance.defaults.headers.common["Authorization"];
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setupAxiosInterceptors(token);
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      if (!token && user) logout();
      if (!token) return;
      const info = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      const timeUntilExpiry = info.exp - currentTime;
      if (timeUntilExpiry < 0) logout();
    };
    const intervalId = setInterval(checkToken, 60000);
    checkToken();
    return () => clearInterval(intervalId);
  }, [user]);

  const verifyToken = async () => {
    try {
      const response = await getProfile();
      const profile = response.data.data;
      setUser(profile.user);
    } catch (error) {
      console.error("Token invalide:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await loginApi({ email, password });
      const session = response.data.data;
      localStorage.setItem("token", session.token);
      setupAxiosInterceptors(session.token);
      setUser(session.user);

      try {
        const profileResponse = await getProfile();
        const profile = profileResponse.data.data;
        void profile.permissions;
        void profile.permissionsByModule;
      } catch (permError) {
        console.error("Erreur récupération permissions:", permError);
      }

      toast.success(getApiSuccessMessage(response, "Connexion réussie !"));
      return { success: true };
    } catch (error) {
      const message = getApiErrorMessage(error, "Erreur de connexion");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await registerApi({ ...userData, role: "employee" });
      const session = response.data.data;

      localStorage.setItem("token", session.token);
      setupAxiosInterceptors(session.token);
      setUser(session.user);

      toast.success(getApiSuccessMessage(response, "Inscription réussie !"));
      return { success: true };
    } catch (error) {
      const message = getApiErrorMessage(error, "Erreur d'inscription");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setupAxiosInterceptors(null);
    setUser(null);
    toast.info("Déconnexion réussie");
  };

  const hasModuleAccess = (
    module: PermissionModule,
    action: PermissionAction = "read",
  ) => {
    if (!user?.role) return false;
    const role = user.role as PermissionRole;
    return (PERMISSIONS[role][module] as readonly string[]).includes(action);
  };

  const updateProfile = async (data: ProfileFormPayload) => {
    try {
      const response = await updateProfileApi(data);
      setUser(response.data.data);
      toast.success(
        getApiSuccessMessage(response, "Profil mis à jour avec succès"),
      );
      return { success: true };
    } catch (error) {
      const message = getApiErrorMessage(error, "Erreur lors de la mise à jour");
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    hasModuleAccess,
    isAuthenticated: !!user,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
