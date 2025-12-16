import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé dans un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [permissionsByModule, setPermissionsByModule] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(user);
    if (user && user.role == "admin") {
      setPermissions(["*"]);
      setPermissionsByModule({
        dashboard: ["read", "write"],
        inventory: ["read", "write", "delete"],
        sales: ["read", "write", "delete"],
        logistics: ["read", "write", "delete"],
        management: ["read", "write", "delete"],
        planning: ["read", "write", "delete"],
        administration: ["read", "write", "delete"],
      });
    }
    if (user && user.role == "manager") {
      setPermissions(["read", "write"]);
      setPermissionsByModule({
        dashboard: ["read", "write"],
        inventory: ["read", "write"],
        sales: ["read", "write"],
        logistics: ["read", "write"],
        management: ["read", "write"],
        planning: ["read", "write"],
      });
    }
    if (user && user.role == "employee") {
      setPermissions(["read"]);
      setPermissionsByModule({
        dashboard: ["read"],
        inventory: ["read"],
        sales: ["read", "write"],
        logistics: ["read"],
      });
    }
  }, [user]);
  // Configuration d'axios avec le token
  const setupAxiosInterceptors = (token) => {
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

  const verifyToken = async (token) => {
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

  const login = async (email, password) => {
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
        console.log("profile", profileResponse);
        setPermissions(profileResponse.permissions || []);
        setPermissionsByModule(profileResponse.permissionsByModule || {});
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

  const register = async (userData) => {
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
  const hasPermission = (permission) => {
    if (permissions == "*" || permissions[0] == "*") return true;
    return permissions.some((p) => p.name === permission);
  };

  // Fonction pour vérifier si l'utilisateur a accès à un module
  const hasModuleAccess = (module, action = "view") => {
    return hasPermission(`${module}.${action}`);
  };

  const value = {
    user,
    permissions,
    permissionsByModule,
    login,
    register,
    logout,
    loading,
    hasPermission,
    hasModuleAccess,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    isManager: ["admin", "direction", "coordination", "encadrant"].includes(
      user?.role
    ),
    isDirection: ["admin", "direction"].includes(user?.role),
    roleLevel: user?.role_level || 0,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
