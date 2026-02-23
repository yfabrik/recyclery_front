import axios from "axios";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { toast } from "react-toastify";
import type { UserModel } from "../interfaces/Models";

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

  }
} as const;

export type PermissionRole = keyof typeof PERMISSIONS;
export type PermissionModule = keyof (typeof PERMISSIONS)[PermissionRole];
export type PermissionAction = (typeof PERMISSIONS)[PermissionRole][PermissionModule][number];

interface AuthContextValue {
  user: UserModel | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: { username: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  loading: boolean;
  hasModuleAccess: (module: PermissionModule, action?: PermissionAction) => boolean;
  isAuthenticated: boolean;
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
  children: ReactNode
}
export const AuthProvider = ({ children }: AuthProps) => {
  const [user, setUser] = useState<UserModel | null>(null);
  const [permissions, setPermissions] = useState([]);
  const [permissionsByModule, setPermissionsByModule] = useState({});
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   console.log(user);
  //   if (user && user.role == "admin") {
  //     setPermissions(["*"]);
  //     setPermissionsByModule({
  //       dashboard: ["read", "write"],
  //       inventory: ["read", "write", "delete"],
  //       sales: ["read", "write", "delete"],
  //       logistics: ["read", "write", "delete"],
  //       management: ["read", "write", "delete"],
  //       planning: ["read", "write", "delete"],
  //       administration: ["read", "write", "delete"],
  //     });
  //   }
  //   if (user && user.role == "manager") {
  //     setPermissions(["read", "write"]);
  //     setPermissionsByModule({
  //       dashboard: ["read", "write"],
  //       inventory: ["read", "write"],
  //       sales: ["read", "write"],
  //       logistics: ["read", "write"],
  //       management: ["read", "write"],
  //       planning: ["read", "write"],
  //     });
  //   }
  //   if (user && user.role == "employee") {
  //     setPermissions(["read"]);
  //     setPermissionsByModule({
  //       dashboard: ["read"],
  //       inventory: ["read"],
  //       sales: ["read", "write"],
  //       logistics: ["read"],
  //     });
  //   }
  // }, [user]);
  // Configuration d'axios avec le token
  const setupAxiosInterceptors = (token: string) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  };

  // Vérifier le token au chargement
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setupAxiosInterceptors(token);
      verifyToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const verifyToken = async (token: string) => {
    try {
      const response = await axios.get("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      setPermissions(response.data.permissions || []);
      setPermissionsByModule(response.data.permissionsByModule || {});
    } catch (error) {
      console.error("Token invalide:", error);
      localStorage.removeItem("token");
      setupAxiosInterceptors(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      setupAxiosInterceptors(token);
      setUser(user);

      //FIXME database call telement a chier que quand ça essaye /profile  la requete de login est pas fini et le server est busy et peut pas handle la request
      // Récupérer les permissions
      try {
        const profileResponse = await axios.get("/api/auth/profile", {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        setPermissions(profileResponse.data.permissions || []);
        setPermissionsByModule(profileResponse.data.permissionsByModule || {});
      } catch (permError) {
        console.error("Erreur récupération permissions:", permError);
      }

      toast.success("Connexion réussie !");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Erreur de connexion";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData: { username: string, email: string, password: string }) => {
    try {
      const response = await axios.post("/api/auth/register", userData);
      const { token, user } = response.data;

      localStorage.setItem("token", token);
      setupAxiosInterceptors(token);
      setUser(user);

      toast.success("Inscription réussie !");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || "Erreur d'inscription";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setupAxiosInterceptors(null);
    setUser(null);
    setPermissions([]);
    setPermissionsByModule({});
    toast.info("Déconnexion réussie");
  };

  // Fonction pour vérifier si l'utilisateur a une permission spécifique
  // const hasPermission = (permission: string) => {
  //   if (permissions == "*" || permissions[0] == "*") return true;
  //   return permissions.some((p) => p.name === permission);
  // };

  // Fonction pour vérifier si l'utilisateur a accès à un module
  const hasModuleAccess = (module: PermissionModule, action: PermissionAction = "read") => {
    if (!user?.role) return false
    const role = user.role as PermissionRole
    return (PERMISSIONS[role][module] as readonly string[]).includes(action)
    // if (permissionsByModule[module])
    //   return permissionsByModule[module].includes(action)
    // return hasPermission(`${module}.${action}`);
  };

  const value = {
    user,
    // permissions,
    // permissionsByModule,
    login,
    register,
    logout,
    loading,
    // hasPermission,
    hasModuleAccess,
    isAuthenticated: !!user,
    // isAdmin: user?.role === "admin",
    // isManager: ["admin", "direction", "coordination", "encadrant"].includes(
    //   user?.role
    // ),
    // isDirection: ["admin", "direction"].includes(user?.role),
    // roleLevel: user?.role_level || 0,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
