import {
  Assessment,
  Category,
  CheckCircle,
  Inventory,
  LocalShipping,
  People,
  QrCode,
  Refresh,
  ShoppingCart,
  Store,
  TrendingUp,
  VolunteerActivism,
} from "@mui/icons-material";
import {
  Alert,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  List,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

// Fonction pour obtenir l'icône par nom
// const getIconByName = (iconName) => {
//   const icons = {
//     ShoppingCart,
//     VolunteerActivism,
//     LocalShipping,
//     Inventory,
//     People,
//   };
//   return icons[iconName] || Info;
// };
import { ActivityItem } from "../components/dashboard/ActivityItem";
import { SimpleChart } from "../components/dashboard/SimpleChart";
import { StatCard } from "../components/dashboard/StatCard";
import DashboardNotifications from "../components/DashboardNotifications";
import QuickStats from "../components/QuickStats";
import StoreStats from "../components/StoreStats";
import WeatherWidget from "../components/WeatherWidget";
import { useAuth } from "../contexts/AuthContext";
import dashboardService from "../services/dashboardService";
import { getAllDashboardData, getStoreStats } from "../services/api/dashboard";
import SimpleBarChart from "../components/dashboard/SimpleBarChart";

// Composant de carte statistique amélioré
// const StatCard = ({
//   title,
//   value,
//   icon,
//   color,
//   subtitle,
//   trend,
//   trendValue,
//   onClick,
// }) => (
//   <Card
//     sx={{
//       height: "100%",
//       cursor: onClick ? "pointer" : "default",
//       transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
//       "&:hover": onClick
//         ? {
//             transform: "translateY(-4px)",
//             boxShadow: 4,
//           }
//         : {},
//     }}
//     onClick={onClick}
//   >
//     <CardContent>
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//           mb: 2,
//         }}
//       >
//         <Box sx={{ flexGrow: 1 }}>
//           <Typography
//             color="textSecondary"
//             gutterBottom
//             variant="overline"
//             sx={{ fontSize: "0.75rem" }}
//           >
//             {title}
//           </Typography>
//           <Typography
//             variant="h4"
//             component="div"
//             color={color}
//             sx={{ fontWeight: "bold" }}
//           >
//             {value}
//           </Typography>
//           {subtitle && (
//             <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
//               {subtitle}
//             </Typography>
//           )}
//         </Box>
//         <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
//           {icon}
//         </Avatar>
//       </Box>
//       {trend && (
//         <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//           {trend === "up" ? (
//             <TrendingUp color="success" fontSize="small" />
//           ) : (
//             <TrendingDown color="error" fontSize="small" />
//           )}
//           <Typography
//             variant="body2"
//             color={trend === "up" ? "success.main" : "error.main"}
//           >
//             {trendValue}
//           </Typography>
//           <Typography variant="body2" color="textSecondary">
//             vs mois dernier
//           </Typography>
//         </Box>
//       )}
//     </CardContent>
//   </Card>
// );

// Composant de graphique simple
// const SimpleChart = ({ data, title, color = "primary", labels }) => (
//   <Paper sx={{ p: 2, height: "100%" }}>
//     <Typography variant="h6" gutterBottom>
//       {title}
//     </Typography>
//     <Box
//       sx={{ display: "flex", alignItems: "end", gap: 1, height: 120, mt: 2 }}
//     >
//       {data.map((value, index) => (
//         <Box
//           key={index}
//           sx={{
//             flexGrow: 1,
//             height: `${(value / Math.max(...data)) * 100}%`,
//             bgcolor: `${color}.main`,
//             borderRadius: 1,
//             minHeight: 20,
//             display: "flex",
//             alignItems: "end",
//             justifyContent: "center",
//             color: "white",
//             fontSize: "0.75rem",
//             fontWeight: "bold",
//           }}
//         >
//           {value}
//         </Box>
//       ))}
//     </Box>
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "space-between",
//         mt: 1,
//         fontSize: "0.75rem",
//       }}
//     >
//       {labels ? (
//         labels.map((label, index) => (
//           <Typography key={index} variant="caption">
//             {label}
//           </Typography>
//         ))
//       ) : (
//         <>
//           <Typography variant="caption">Lun</Typography>
//           <Typography variant="caption">Mar</Typography>
//           <Typography variant="caption">Mer</Typography>
//           <Typography variant="caption">Jeu</Typography>
//           <Typography variant="caption">Ven</Typography>
//           <Typography variant="caption">Sam</Typography>
//           <Typography variant="caption">Dim</Typography>
//         </>
//       )}
//     </Box>
//   </Paper>
// );

// Composant d'activité récente amélioré
// const ActivityItem = ({ activity }) => {
//   const IconComponent = getIconByName(activity.icon);

//   return (
//     <ListItem sx={{ px: 0 }}>
//       <ListItemAvatar>
//         <Avatar
//           sx={{ bgcolor: `${activity.color}.main`, width: 40, height: 40 }}
//         >
//           <IconComponent />
//         </Avatar>
//       </ListItemAvatar>
//       <ListItemText
//         primary={
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <Typography variant="body1" sx={{ fontWeight: 500 }}>
//               {activity.description}
//             </Typography>
//             <Chip
//               label={activity.status}
//               size="small"
//               color={activity.statusColor}
//               variant="outlined"
//             />
//           </Box>
//         }
//         secondary={
//           <React.Fragment>
//             <Typography
//               variant="body2"
//               color="textSecondary"
//               component="span"
//               sx={{ display: "block" }}
//             >
//               {activity.time}
//             </Typography>
//             {activity.amount && (
//               <Typography
//                 variant="body2"
//                 color="primary"
//                 sx={{ fontWeight: 500, display: "block" }}
//                 component="span"
//               >
//                 {activity.amount}
//               </Typography>
//             )}
//           </React.Fragment>
//         }
//       />
//       <IconButton size="small">
//         <MoreVert />
//       </IconButton>
//     </ListItem>
//   );
// };

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState();
  const [activities, setActivities] = useState([]);
  const [charts, setCharts] = useState({ sales: [], revenue: [], labels: [] });
  const [storesStats, setStoresStats] = useState([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log(storesStats);
  }, [storesStats]);
  // Données simulées réalistes pour la démonstration
  const mockStats = {
    totalItems: 1247,
    availableItems: 892,
    soldThisMonth: 156,
    totalRevenue: 4580.5,
    pendingDonations: 23,
    scheduledCollections: 8,
    categoriesCount: 12,
    usersCount: 15,
    thisMonthRevenue: 4580.5,
    lastMonthRevenue: 3890.25,
    thisMonthSales: 156,
    lastMonthSales: 142,
  };

  const mockActivities = [
    {
      id: 1,
      type: "sale",
      description: "Vente d'un réfrigérateur Samsung",
      amount: "150€",
      time: "Il y a 2h",
      icon: <ShoppingCart />,
      color: "success",
      status: "Complété",
      statusColor: "success",
    },
    {
      id: 2,
      type: "donation",
      description: "Nouveau don de mobilier",
      amount: "5 articles",
      time: "Il y a 4h",
      icon: <VolunteerActivism />,
      color: "info",
      status: "En attente",
      statusColor: "warning",
    },
    {
      id: 3,
      type: "collection",
      description: "Collecte programmée",
      amount: "Demain 9h",
      time: "Il y a 1j",
      icon: <LocalShipping />,
      color: "warning",
      status: "Programmé",
      statusColor: "info",
    },
    {
      id: 4,
      type: "inventory",
      description: "Ajout de 12 articles électroniques",
      amount: "Catégorie: Électronique",
      time: "Il y a 2j",
      icon: <Inventory />,
      color: "primary",
      status: "Traité",
      statusColor: "success",
    },
    {
      id: 5,
      type: "user",
      description: "Nouvel employé ajouté",
      amount: "Marie Dubois",
      time: "Il y a 3j",
      icon: <People />,
      color: "secondary",
      status: "Actif",
      statusColor: "success",
    },
  ];

  // Données simulées pour les graphiques (fallback)
  const mockSalesData = [45, 52, 38, 67, 89, 72, 56];
  const mockRevenueData = [850, 920, 780, 1150, 1320, 980, 890];

  // Fonction pour charger les statistiques des magasins
  const loadStoresStats = async () => {
    setStoresLoading(true);
    try {
      // const token = localStorage.getItem("token");
      // const response = await fetch("/api/dashboard/stores-stats", {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      const data = await getStoreStats();
      //await response.json();
      setStoresStats(data.data.stores);
    } catch (error) {
      console.error("Erreur chargement stats magasins:", error);
    } finally {
      setStoresLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Récupération des vraies données depuis l'API
        const result = await getAllDashboardData();
        //  await dashboardService.getAllDashboardData();
        console.log(result)
        if (result.success) {
          setStats(result.data.stats);
          // setStats(mockStats);

          setActivities(result.data.activities);

          // Mettre à jour les données des graphiques
          if (result.data.charts) {
            setCharts(result.data.charts);
            // console.log("Données des graphiques:", result.data.charts);
          }
        } else {
          setError(result.error || "Erreur lors du chargement des données");
          // En cas d'erreur, utiliser les données simulées comme fallback
          setStats(mockStats);
          setActivities(mockActivities);
          setCharts({
            sales: mockSalesData,
            revenue: mockRevenueData,
            labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
          });
        }
      } catch (err) {
        setError("Erreur de connexion au serveur");
        console.error("Dashboard error:", err);
        // En cas d'erreur, utiliser les données simulées comme fallback
        setStats(mockStats);
        setActivities(mockActivities);
        setCharts({
          sales: mockSalesData,
          revenue: mockRevenueData,
          labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
    loadStoresStats();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getAllDashboardData();
      // await dashboardService.getAllDashboardData();

      if (result.success) {
        setStats(result.data.stats);
        setActivities(result.data.activities);
      } else {
        setError(result.error || "Erreur lors de l'actualisation");
      }

      // Actualiser aussi les statistiques des magasins
      await loadStoresStats();
    } catch (err) {
      setError("Erreur de connexion lors de l'actualisation");
      console.error("Refresh error:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (current, previous) => {
    if (!previous) return null;
    const percentage = (((current - previous) / previous) * 100).toFixed(1);
    return {
      direction: current > previous ? "up" : "down",
      value: `${Math.abs(percentage)}%`,
    };
  };

  const revenueTrend = calculateTrend(
    stats?.thisMonthRevenue,
    stats?.lastMonthRevenue
  );
  const salesTrend = calculateTrend(
    stats?.thisMonthSales,
    stats?.lastMonthSales
  );

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 400,
        }}
      >
        <CircularProgress size={60} />
        <Typography sx={{ ml: 2 }}>Chargement du tableau de bord...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* En-tête de bienvenue amélioré */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
              Bonjour, {user?.username} ! 👋
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Voici un aperçu complet de l'activité de votre recyclerie
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Tooltip title="Actualiser les données">
              <IconButton onClick={handleRefresh} color="primary">
                <Refresh />
              </IconButton>
            </Tooltip>
            <Chip
              icon={<CheckCircle />}
              label="En ligne"
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Statistiques principales améliorées */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Articles en stock"
            value={stats.availableItems?.toLocaleString() || "0"}
            subtitle={`sur ${stats.totalItems?.toLocaleString() || "0"} total`}
            icon={<Inventory />}
            color="primary"
            trend={salesTrend?.direction}
            trendValue={salesTrend?.value}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Ventes ce mois"
            value={stats.soldThisMonth?.toLocaleString() || "0"}
            subtitle="articles vendus"
            icon={<ShoppingCart />}
            color="success"
            trend={salesTrend?.direction}
            trendValue={salesTrend?.value}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Chiffre d'affaires"
            value={`${stats.totalRevenue?.toLocaleString() || "0"}€`}
            subtitle="ce mois"
            icon={<TrendingUp />}
            color="info"
            trend={revenueTrend?.direction}
            trendValue={revenueTrend?.value}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Dons en attente"
            value={stats.pendingDonations?.toLocaleString() || "0"}
            subtitle="à traiter"
            icon={<VolunteerActivism />}
            color="warning"
          />
        </Grid>
      </Grid>

      {/* Statistiques secondaires */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Collections programmées"
            value={stats.scheduledCollections || "0"}
            subtitle="ce mois"
            icon={<LocalShipping />}
            color="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Catégories actives"
            value={stats.categoriesCount || "0"}
            subtitle="types d'articles"
            icon={<Category />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Utilisateurs actifs"
            value={stats.usersCount || "0"}
            subtitle="employés"
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Taux de vente"
            value={`${(
              (stats.soldThisMonth / stats.availableItems) *
              100
            ).toFixed(1)}%`}
            subtitle="ce mois"
            icon={<Assessment />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Statistiques par magasin */}
      <StoreStats stores={storesStats} loading={storesLoading} />

      <Grid container spacing={3}>
        {/* Graphiques de performance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SimpleBarChart 
          pData={ mockSalesData}
          uData={ mockRevenueData}
          label1="Ventes cette semaine"
          label2="Revenus cette semaine (€)"
          xLabels={
            
                 ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
            }
          />

          {/* <SimpleChart
            data={charts.sales.length > 0 ? charts.sales : mockSalesData}
            title="Ventes cette semaine"
            color="success"
            labels={
              charts.labels && charts.labels.length > 0
                ? charts.labels
                : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
            }
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SimpleChart
            data={charts.revenue.length > 0 ? charts.revenue : mockRevenueData}
            title="Revenus cette semaine (€)"
            color="primary"
            labels={
              charts.labels && charts.labels.length > 0
                ? charts.labels
                : ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]
            }
          /> */}
        </Grid>

        {/* Activités récentes améliorées */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 3,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                Activités récentes
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Badge badgeContent={activities.length} color="primary">
                  <Button size="small" variant="outlined">
                    Voir tout
                  </Button>
                </Badge>
              </Box>
            </Box>

            <List sx={{ "& .MuiListItem-root": { px: 0 } }}>
              {activities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ActivityItem activity={activity} />
                  {index < activities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Colonne de droite avec widgets */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* Actions rapides améliorées */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Actions rapides
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<Inventory />}
                  fullWidth
                  sx={{ justifyContent: "flex-start", py: 1.5 }}
                >
                  Ajouter un article
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<VolunteerActivism />}
                  fullWidth
                  sx={{ justifyContent: "flex-start", py: 1.5 }}
                >
                  Enregistrer un don
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<LocalShipping />}
                  fullWidth
                  sx={{ justifyContent: "flex-start", py: 1.5 }}
                >
                  Programmer une collecte
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ShoppingCart />}
                  fullWidth
                  sx={{ justifyContent: "flex-start", py: 1.5 }}
                >
                  Nouvelle vente
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<QrCode />}
                  fullWidth
                  sx={{ justifyContent: "flex-start", py: 1.5 }}
                >
                  Générer des étiquettes
                </Button>
                {user?.role !== "employee" && (
                  <>
                    <Divider />
                    <Button
                      variant="outlined"
                      startIcon={<Assessment />}
                      fullWidth
                      sx={{ justifyContent: "flex-start", py: 1.5 }}
                    >
                      Voir les rapports
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<People />}
                      fullWidth
                      sx={{ justifyContent: "flex-start", py: 1.5 }}
                    >
                      Gérer les utilisateurs
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Store />}
                      fullWidth
                      sx={{ justifyContent: "flex-start", py: 1.5 }}
                    >
                      Paramètres recyclerie
                    </Button>
                  </>
                )}
              </Box>
            </Paper>

            {/* Widget météo */}
            <WeatherWidget />

            {/* Statistiques rapides */}
            <QuickStats stats={stats} />

            {/* Notifications */}
            <DashboardNotifications />
          </Stack>
        </Grid>
      </Grid>

      {/* Indicateurs de performance */}
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Objectif mensuel
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="h4" color="primary">
                {((stats.soldThisMonth / 200) * 100).toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                de l'objectif (200 ventes)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(stats.soldThisMonth / 200) * 100}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Stock critique
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h4" color="warning.main">
                {Math.max(0, 50 - Math.floor(stats.availableItems / 100))}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                catégories en rupture
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Efficacité des ventes
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Typography variant="h4" color="success.main">
                {((stats.soldThisMonth / stats.availableItems) * 100).toFixed(
                  1
                )}
                %
              </Typography>
              <Typography variant="body2" color="textSecondary">
                taux de conversion
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
