import React, { useState, type ReactNode } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Box, CircularProgress, Container } from "@mui/material";
import { useAuth, type PermissionModule } from "./contexts/AuthContext";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Banner from "./components/Banner";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import CollectionReceipts from "./pages/CollectionReceipts";
import Arrivals from "./pages/Arrivals";
import Labels from "./pages/Labels";
import PointOfSale from "./pages/PointOfSale";
import GiftCard from "./pages/GiftCard";
import WasteManagement from "./pages/WasteManagement";
import EmployeeTools from "./pages/EmployeeTools";
import EmployeeManagement from "./components/admin/config/EmployeeManagement";
import TaskManagement from "./components/admin/config/TaskManagement";
import Planning from "./pages/Planning";
import EcoOrganismStatsPage from "./pages/EcoOrganismStatsPage";

// Route protégée
const ProtectedRoute = ({ children, module }: { children: ReactNode, module?: PermissionModule }) => {
  const { isAuthenticated, loading, hasModuleAccess } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (module) {
    if (!hasModuleAccess(module, "read")) return <Navigate to="/dashboard" replace />;
  }
  return children;
};

// Route publique (redirection si déjà connecté)
const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {isAuthenticated && (
        <>
          <Navbar onMenuToggle={handleSidebarToggle} />
          <Sidebar open={sidebarOpen} onClose={handleSidebarClose} />
        </>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: "background.default",
          minHeight: "100vh",
          pt: isAuthenticated ? 8 : 0, // Padding pour la navbar
        }}
      >
        <Routes>
          {/* Routes publiques */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Routes protégées */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute module="dashboard">
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Dashboard />
                </Container>
              </ProtectedRoute>
            }
          />

       
          <Route
            path="/users"
            element={
              <ProtectedRoute module="users">
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Users />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute module="config">
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Settings />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Profile />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/waste-management"
            element={
              <ProtectedRoute module="waste">
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <WasteManagement />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute module="administration">
                <Admin />
              </ProtectedRoute>
            }
          />
         
          <Route
            path="/collection-receipts"
            element={
              <ProtectedRoute module="arrival">
                <CollectionReceipts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/arrivals"
            element={
              <ProtectedRoute module="arrival">
                <Arrivals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/labels"
            element={
              <ProtectedRoute module="label">
                <Labels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute module="caisse">
                <PointOfSale />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos/gift-card"
            element={
              <ProtectedRoute module="caisse">
                <GiftCard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-tools"
            element={
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <EmployeeTools />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-management"
            element={
              <ProtectedRoute module="config">
                <EmployeeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task-management"
            element={
              <ProtectedRoute module="config">
                <TaskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planning"
            element={
              <ProtectedRoute module="planning">
                <Planning />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/eco-organism-stats"
            element={
              <ProtectedRoute module="administration">
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <EcoOrganismStatsPage />
                </Container>
              </ProtectedRoute>
            }
          />
          {import.meta.env.DEV && (<></>
          )}

          {/* Redirection par défaut */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Box>
      <Banner />
    </Box>
  );
}

export default App;
