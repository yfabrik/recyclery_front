import {
  AccessTime,
  Category,
  LocationOn,
  Nature,
  People,
  Schedule,
  Store,
  Work,
} from "@mui/icons-material";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { CategoriesTab } from "./config/CategorieTab";
import CollectionPointsTab from "../CollectionPointsTab";
import StoresTab from "../StoresTab";
import { EcoOrganismsTab } from "./EcoOrganismsTab";
import EmployeeManagement from "../../pages/EmployeeManagement";
import TaskManagement from "../../pages/TaskManagement";
import StoreHoursTab from "../StoreHoursTab";
import CollectionPointPresenceTab from "../CollectionPointPresenceTab";
import { useState } from "react";

export const ConfigurationTab = () => {
  const [tabValue, setTabValue] = useState(0);

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
        onChange={(e, newValue) => setTabValue(newValue)}
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
          label="Catégories"
          icon={<Category />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#1976d2", backgroundColor: "#e3f2fd" },
          }}
        />
        <Tab
          label="Lieux de collecte"
          icon={<LocationOn />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#f57c00", backgroundColor: "#fff3e0" },
          }}
        />
        <Tab
          label="Magasins"
          icon={<Store />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#7b1fa2", backgroundColor: "#f3e5f5" },
          }}
        />
        <Tab
          label="Éco-organismes"
          icon={<Nature />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#388e3c", backgroundColor: "#e8f5e8" },
          }}
        />
        <Tab
          label="Employés"
          icon={<People />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#d32f2f", backgroundColor: "#ffebee" },
          }}
        />
        <Tab
          label="Tâches"
          icon={<Work />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#f57c00", backgroundColor: "#fff3e0" },
          }}
        />
        <Tab
          label="Horaires des magasins"
          icon={<AccessTime />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#9c27b0", backgroundColor: "#f3e5f5" },
          }}
        />
        <Tab
          label="Horaires de présence"
          icon={<Schedule />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#f57c00", backgroundColor: "#fff3e0" },
          }}
        />
      </Tabs>

      <Box sx={{ p: 3 }}>
        {tabValue === 0 && <CategoriesTab />}
        {tabValue === 1 && <CollectionPointsTab />}
        {tabValue === 2 && <StoresTab />}
        {tabValue === 3 && <EcoOrganismsTab />}
        {tabValue === 4 && <EmployeeManagement />}
        {tabValue === 5 && <TaskManagement />}
        {tabValue === 6 && <StoreHoursTab />}
        {tabValue === 7 && <CollectionPointPresenceTab />}
      </Box>
    </Box>
  );
};
