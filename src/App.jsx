import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router";
import { Box, CircularProgress, Container } from "@mui/material";
import { useAuth } from "./contexts/AuthContext";

// Components
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Banner from "./components/Banner";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Recycleries from "./pages/Recycleries";
import Stores from "./pages/Stores";
import Items from "./pages/Items";
import Donations from "./pages/Donations";
import Collections from "./pages/Collections";
import Sales from "./pages/Sales";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import CollectionSchedule from "./pages/CollectionSchedule";
import CollectionReceipts from "./pages/CollectionReceipts";
import Arrivals from "./pages/Arrivals";
import Labels from "./pages/Labels";
import PointOfSale from "./pages/PointOfSale";
import WasteManagement from "./pages/WasteManagement";
import EmployeeTools from "./pages/EmployeeTools";
import EmployeeManagement from "./components/admin/config/EmployeeManagement";
import TaskManagement from "./components/admin/config/TaskManagement";
import Planning from "./pages/Planning";
import { TestPage } from "./pages/TestPage";

// Route protégée
const ProtectedRoute = ({ children }) => {
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

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Route publique (redirection si déjà connecté)
const PublicRoute = ({ children }) => {
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
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Dashboard />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/recycleries"
            element={
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Recycleries />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores"
            element={
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Stores />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/items"
            element={
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Items />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/donations"
            element={
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Donations />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/collections"
            element={
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Collections />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales"
            element={
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Sales />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <Users />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
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
              <ProtectedRoute>
                <Container maxWidth="xl" sx={{ py: 3 }}>
                  <WasteManagement />
                </Container>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection-schedule"
            element={
              <ProtectedRoute>
                <CollectionSchedule />
              </ProtectedRoute>
            }
          />
          <Route
            path="/collection-receipts"
            element={
              <ProtectedRoute>
                <CollectionReceipts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/arrivals"
            element={
              <ProtectedRoute>
                <Arrivals />
              </ProtectedRoute>
            }
          />
          <Route
            path="/labels"
            element={
              <ProtectedRoute>
                <Labels />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <PointOfSale />
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
              <ProtectedRoute>
                <EmployeeManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/task-management"
            element={
              <ProtectedRoute>
                <TaskManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/planning"
            element={
              <ProtectedRoute>
                <Planning />
              </ProtectedRoute>
            }
          />
          {import.meta.env.DEV && (
            <Route path="/test" element={<TestPage />} />
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
