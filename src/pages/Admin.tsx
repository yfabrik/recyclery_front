import {
  AdminPanelSettings,
  Assessment,
  CardGiftcard,
  People,
  Schedule,
  Settings,
} from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import Planning from "./Planning";

import { Link, Navigate, Route, Routes, useLocation } from "react-router";
import { ConfigurationTab } from "../components/admin/ConfigurationTab";
import { DonationsTab } from "../components/admin/DonationsTab";
import { LogisticsTab } from "../components/admin/LogisticsTab";
import { SalesAnalyticsTab } from "../components/admin/SalesAnalyticsTab";
import { UsersTab } from "../components/admin/UsersTab";

const Admin = () => {
  const location = useLocation();

  const tabValue =
    location.pathname === "/admin" ? "/admin/config" : location.pathname;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <AdminPanelSettings sx={{ mr: 1, verticalAlign: "middle" }} />
          Administration
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Paramétrage et configuration du système
        </Typography>
      </Box>

      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          // onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            // background: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 50%, #1976d2 100%)',
            // borderRadius: 1,
            // boxShadow: '0 4px 20px rgba(66, 165, 245, 0.3)',
            "& .MuiTab-root": {
              // color: 'rgba(255,255,255,0.8)',
              fontWeight: 500,
              borderRadius: "8px",
              margin: "4px",
              transition: "all 0.2s ease-in-out",
              "&.Mui-selected": {
                // color: '#ffffff',
                backgroundColor: "rgba(255,255,255,0.25)",
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(255,255,255,0.3)",
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.15)",
                transform: "translateY(-1px)",
              },
            },
          }}
        >
          <Tab
            component={Link}
            label="Configuration Logiciel"
            to="/admin/config"
            value="/admin/config"
            icon={<Settings />}
            iconPosition="start"
            sx={{
              minHeight: 72,
              // '&.Mui-selected': {
              //   color: '#ffffff',
              //   backgroundColor: 'rgba(255,255,255,0.25)',
              //   fontWeight: 700,
              //   boxShadow: '0 4px 12px rgba(255,255,255,0.3)',
              // }
            }}
          />
          <Tab
            component={Link}
            label="Suivi des Ventes"
            value="/admin/sales"
            to="/admin/sales"
            icon={<Assessment />}
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
          <Tab
            component={Link}
            label="Dons"
            value="/admin/don"
            to="/admin/don"
            icon={<CardGiftcard />}
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
          {/* <Tab
            component={Link}
            label="Logistique"
            value="/admin/logistic"
            to="/admin/logistic"
            icon={<LocalShipping />}
            iconPosition="start"
            sx={{ minHeight: 72 }}
          /> */}
          <Tab
            component={Link}
            label="Planning"
            value="/admin/planning"
            to="/admin/planning"
            icon={<Schedule />}
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
          <Tab
            component={Link}
            label="Utilisateurs"
            value="/admin/users"
            to="/admin/users"
            icon={<People />}
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
        </Tabs>

        <Divider />

        <Box sx={{ p: 3 }}>
          {/* FIXME y'a une erreur quand on essai d'aller juste sur /admin */}
          <Routes>
            <Route index element={<Navigate to="/admin/config" replace />} />
            <Route path="config/*" element={<ConfigurationTab />} />
            <Route path="sales" element={<SalesAnalyticsTab />} />
            <Route path="don" element={<DonationsTab />} />
            <Route path="logistic" element={<LogisticsTab />} />
            <Route path="planning" element={<Planning />} />
            <Route path="users" element={<UsersTab />} />
          </Routes>
        </Box>
      </Paper>
    </Container>
  );
};

export default Admin;
