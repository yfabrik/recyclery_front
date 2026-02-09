import {
  Category,
  FireTruck,
  LocationOn,
  Nature,
  People,
  Store,
} from "@mui/icons-material";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { Link, Navigate, Route, Routes, useLocation } from "react-router";
import { CategoriesTab } from "./config/CategorieTab";
import CollectionPointsTab from "./config/CollectionPointsTab";
import { CollectTab } from "./config/CollectTab";
import { EcoOrganismsTab } from "./config/EcoOrganismsTab";
import EmployeeManagement from "./config/EmployeeManagement";
import StoresTab from "./config/StoresTab";

const CONFIG_BASE = "/admin/config";

export const ConfigurationTab = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const tabValue = pathname === CONFIG_BASE ? `${CONFIG_BASE}/categories` : pathname;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          ⚙️ Configuration Logiciel
        </Typography>
      </Box>

      <Tabs
        value={tabValue}
        sx={{
          mb: 3,
          backgroundColor: "#f8f9fa",
          borderRadius: 2,
          border: "1px solid #e0e0e0",
          "& .MuiTab-root": {
            color: "#495057",
            fontWeight: 500,
            textTransform: "none",
            minHeight: 60,
            "&.Mui-selected": {
              color: "#2e7d32",
              backgroundColor: "#d4edda",
              fontWeight: 600,
              borderBottom: "3px solid #2e7d32",
            },
            "&:hover": {
              backgroundColor: "#e9ecef",
              color: "#2e7d32",
            },
          },
        }}
      >
        <Tab
          component={Link}
          label="Catégories"
          to={`${CONFIG_BASE}/categories`}
          value={`${CONFIG_BASE}/categories`}
          icon={<Category />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#1976d2", backgroundColor: "#e3f2fd" },
          }}
        />
        <Tab
          component={Link}
          label="Déchetteries"
          to={`${CONFIG_BASE}/collect-point`}
          value={`${CONFIG_BASE}/collect-point`}
          icon={<LocationOn />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#f57c00", backgroundColor: "#fff3e0" },
          }}
        />
        <Tab
          component={Link}
          label="Magasins"
          to={`${CONFIG_BASE}/store`}
          value={`${CONFIG_BASE}/store`}
          icon={<Store />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#7b1fa2", backgroundColor: "#f3e5f5" },
          }}
        />
        <Tab
          component={Link}
          label="Éco-organismes"
          to={`${CONFIG_BASE}/eco-orga`}
          value={`${CONFIG_BASE}/eco-orga`}
          icon={<Nature />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#388e3c", backgroundColor: "#e8f5e8" },
          }}
        />
        <Tab
          component={Link}
          label="Employés"
          to={`${CONFIG_BASE}/employees`}
          value={`${CONFIG_BASE}/employees`}
          icon={<People />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#d32f2f", backgroundColor: "#ffebee" },
          }}
        />
        <Tab
          component={Link}
          label="Logistique"
          to={`${CONFIG_BASE}/logistic`}
          value={`${CONFIG_BASE}/logistic`}
          icon={<FireTruck />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#f57c00", backgroundColor: "#fff3e0" },
          }}
        />
      </Tabs>

      <Box sx={{ p: 3 }}>
        <Routes>
          <Route index element={<Navigate to={`${CONFIG_BASE}/categories`} replace />} />
          <Route path="categories" element={<CategoriesTab />} />
          <Route path="collect-point" element={<CollectionPointsTab />} />
          <Route path="store" element={<StoresTab />} />
          <Route path="eco-orga" element={<EcoOrganismsTab />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="logistic" element={<CollectTab />} />
        </Routes>
      </Box>
    </Box>
  );
};
