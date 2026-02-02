import {
  Category,
  FireTruck,
  LocationOn,
  Nature,
  People,
  Store,
  Work
} from "@mui/icons-material";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";
import { useLocation } from "react-router";
import { CategoriesTab } from "./config/CategorieTab";
import CollectionPointPresenceTab from "./config/CollectionPointPresenceTab";
import CollectionPointsTab from "./config/CollectionPointsTab";
import { CollectTab } from "./config/CollectTab";
import { EcoOrganismsTab } from "./config/EcoOrganismsTab";
import EmployeeManagement from "./config/EmployeeManagement";
import StoresTab from "./config/StoresTab";
import TaskManagement from "./config/TaskManagement";

export const ConfigurationTab = () => {
  const location = useLocation();
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
        // value={location.pathname}
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
          // value="categories"
          // to="categories"
          // component={Link}
          icon={<Category />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#1976d2", backgroundColor: "#e3f2fd" },
          }}
        />
        <Tab
          label="Déchetteries"
          // value="collect-point"
          // to="collect-point"
          // component={Link}
          icon={<LocationOn />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#f57c00", backgroundColor: "#fff3e0" },
          }}
        />
        <Tab
          label="Magasins"
          // value="store"
          // to="store"
          // component={Link}
          icon={<Store />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#7b1fa2", backgroundColor: "#f3e5f5" },
          }}
        />
        <Tab
          label="Éco-organismes"
          // value="eco-orga"
          // to="eco-orga"
          // component={Link}
          icon={<Nature />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#388e3c", backgroundColor: "#e8f5e8" },
          }}
        />
        <Tab
          label="Employés"
          // value="employees"
          // to="employees"
          // component={Link}
          icon={<People />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#d32f2f", backgroundColor: "#ffebee" },
          }}
        />
        {/* <Tab
          label="Tâches"
          // value="tasks"
          // to="tasks"
          // component={Link}
          icon={<Work />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#f57c00", backgroundColor: "#fff3e0" },
          }}
        /> */}
         <Tab
          label="Collectes"
          // value="tasks"
          // to="tasks"
          // component={Link}
          icon={<FireTruck />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#f57c00", backgroundColor: "#fff3e0" },
          }}
        />
        {/* <Tab
          label="Horaires des magasins"
          // value="store-hour"
          // to="store-hour"
          // component={Link}
          icon={<AccessTime />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#9c27b0", backgroundColor: "#f3e5f5" },
          }}
        />
        <Tab
          label="Horaires de présence"
          // value="collect-presence"
          // to="collect-presence"
          // component={Link}
          icon={<Schedule />}
          iconPosition="start"
          sx={{
            "&.Mui-selected": { color: "#f57c00", backgroundColor: "#fff3e0" },
          }}
        /> */}
      </Tabs>

      <Box sx={{ p: 3 }}>
        {/* <Routes>
          <Route index element={<CategoriesTab />}></Route>
          <Route path="categories" element={<CategoriesTab />} />
          <Route path="collect-point" element={<CollectionPointsTab />} />
          <Route path="store" element={<StoresTab />} />
          <Route path="eco-orga" element={<EcoOrganismsTab />} />
          <Route path="employees" element={<EmployeeManagement />} />
          <Route path="tasks" element={<TaskManagement />} />
          <Route path="store-hour" element={<StoreHoursTab />} />
          <Route
            path="collect-presence"
            element={<CollectionPointPresenceTab />}
          />
        </Routes> */}
        {tabValue === 0 && <CategoriesTab />}
        {tabValue === 1 && <CollectionPointsTab />}
        {tabValue === 2 && <StoresTab />}
        {tabValue === 3 && <EcoOrganismsTab />}
        {tabValue === 4 && <EmployeeManagement />}
        {/* {tabValue === 5 && <TaskManagement />} */}
        {tabValue === 5 && <CollectTab />}
        {/* {tabValue === 7 && <CollectionPointPresenceTab />} */}
      </Box>
    </Box>
  );
};
