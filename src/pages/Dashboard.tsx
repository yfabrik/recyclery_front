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
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import React from "react";

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
import { BarChart, PieChart } from "@mui/x-charts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { ActivityItem } from "../components/dashboard/ActivityItem";
import { StatCard } from "../components/dashboard/StatCard";
import DashboardNotifications from "../components/DashboardNotifications";
import EcoOrganismStats from "../components/EcoOrganismStats";
import QuickStats from "../components/QuickStats";
import StoreStats from "../components/StoreStats";
import WeatherWidget from "../components/WeatherWidget";
import { useAuth } from "../contexts/AuthContext";
import type { StoreModel } from "../interfaces/Models";
import {
  getActivities,
  getChartsData,
  getStats,
  getStoreStats,
  type Activity,
  type Stats,
} from "../services/api/dashboard";
import { fetchEcoOrganismQuarterStats } from "../services/api/ecoOrganism";
import {
  getTranscationStats,
  type transactionsFilters,
} from "../services/api/transactions";
import { formatCurrency, formatPercentage } from "../services/cartService";

const Dashboard = () => {
  const { user } = useAuth();

  type ViewType = "week" | "month" | "year";
  const [view, setView] = React.useState<ViewType>("week");
  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: ViewType,
  ) => {
    if (newView !== null) {
      setView(newView);
    }
  };
  const [viewStore, setViewStore] = React.useState<StoreModel["id"] | null>(
    null,
  );

  const handleStatsFilter = (): transactionsFilters => {
    const saleFilter: transactionsFilters = {};
    if (viewStore) saleFilter.store_id = viewStore;
    switch (view) {
      case "week":
        saleFilter.date_from = dayjs().startOf("week").toISOString();
        break;
      case "month":
        saleFilter.date_from = dayjs().startOf("month").toISOString();
        break;
      case "year":
        saleFilter.date_from = dayjs().startOf("year").toISOString();
        break;
      default:
        view satisfies never;
        break;
    }
    return saleFilter;
  };

  const handleViewStoreChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: StoreModel["id"] | null,
  ) => {
    setViewStore(newView);
  };

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
  } satisfies Stats;

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
  ] satisfies Activity[];

  // Données simulées pour les graphiques (fallback)
  const mockSalesData = [45, 52, 38, 67, 89, 72, 56];
  const mockRevenueData = [850, 920, 780, 1150, 1320, 980, 890];

  const queryClient = useQueryClient();

  const activities = useQuery({
    queryKey: ["activities"],
    queryFn: () => getActivities().then((response) => response.data.data),
    placeholderData: mockActivities,
  });
  const charts = useQuery({
    queryKey: ["charts"],
    queryFn: () => getChartsData().then((response) => response.data.data),
    placeholderData: {
      sales: mockSalesData,
      revenue: mockRevenueData,
      labels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    },
  });
  const stats = useQuery({
    queryKey: ["stats"],
    queryFn: () => getStats().then((response) => response.data.data),
    placeholderData: mockStats,
  });
  const storesStats = useQuery({
    queryKey: ["storesStats"],
    queryFn: () => getStoreStats().then((response) => response.data.stores),
  });
  const ecoOrganismQuarterStats = useQuery({
    queryKey: ["ecoOrganismQuarterStats"],
    queryFn: () =>
      fetchEcoOrganismQuarterStats().then((response) => response.data.stats),
  });

  const salesStats = useQuery({
    queryKey: ["salesStats", handleStatsFilter()],
    queryFn: () => getTranscationStats(handleStatsFilter()),
  });

  const handleRefresh = async () => {
    queryClient.invalidateQueries({
      predicate: (query) =>
        ["charts", "storesStats", "activities", "stats"].includes(
          query.queryKey[0] as string,
        ),
    });
  };

  const calculateTrend = (current: number = 0, previous: number = 0) => {
    if (!previous) return null;
    const percentage = formatPercentage((current - previous) / previous);
    return {
      direction: current > previous ? "up" : "down",
      value: percentage,
    };
  };

  const revenueTrend = calculateTrend(
    stats.data?.thisMonthRevenue,
    stats.data?.lastMonthRevenue,
  );
  const salesTrend = calculateTrend(
    stats.data?.thisMonthSales,
    stats.data?.lastMonthSales,
  );

  if (
    activities.isLoading ||
    storesStats.isLoading ||
    stats.isLoading ||
    charts.isLoading
  ) {
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

        {activities.isError ||
          storesStats.isError ||
          stats.isError ||
          (charts.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {activities.error}
              {storesStats.isError}
              {stats.isError}
              {charts.isError}
            </Alert>
          ))}
      </Box>

      {/* Statistiques principales améliorées */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          {/* article en stock / total item  */}
          <StatCard
            title="Articles en stock"
            value={stats.data?.availableItems?.toLocaleString() || "0"}
            subtitle={`sur ${stats.data?.totalItems?.toLocaleString() || "0"} total`}
            icon={<Inventory />}
            color="primary"
            // trend={salesTrend?.direction}
            // trendValue={salesTrend?.value}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Ventes ce mois"
            value={stats.data?.soldThisMonth?.toLocaleString() || "0"}
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
            value={formatCurrency(stats.data?.totalRevenue ?? 0)}
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
            value={stats.data?.pendingDonations?.toLocaleString() || "0"}
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
            value={stats.data?.scheduledCollections.toString() || "0"}
            subtitle="ce mois"
            icon={<LocalShipping />}
            color="secondary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Catégories actives"
            value={stats.data?.categoriesCount.toString() || "0"}
            subtitle="types d'articles"
            icon={<Category />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Utilisateurs actifs"
            value={stats.data?.usersCount.toString() || "0"}
            subtitle="employés"
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard
            title="Taux de vente"
            value={`${(
              (stats.data?.soldThisMonth ||
                0 / (stats.data?.availableItems || 0)) * 100
            ).toFixed(1)}%`}
            subtitle="ce mois"
            icon={<Assessment />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Statistiques par magasin */}

      <StoreStats
        stores={storesStats.data || []}
        loading={storesStats.isLoading}
      />

      <Grid container spacing={3}>
        {/* Graphiques de performance */}
        <Grid size={{ xs: 12, md: 6 }}>
          {/* <SimpleBarChart
            pData={charts.data?.sales || mockSalesData}
            uData={charts.data?.revenue || mockRevenueData}
            label1="Ventes cette semaine"
            label2="Revenus cette semaine (€)"
            xLabels={
              charts.data?.labels || [
                "Lun",
                "Mar",
                "Mer",
                "Jeu",
                "Ven",
                "Sam",
                "Dim",
              ]
            }
          /> */}

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

        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 3,
              mb: 2,
            }}
          >
            <ToggleButtonGroup
              color="primary"
              size="small"
              value={view}
              exclusive
              onChange={handleViewChange}
            >
              <ToggleButton value="week">semaine</ToggleButton>
              <ToggleButton value="month">mois</ToggleButton>
              <ToggleButton value="year">année</ToggleButton>
            </ToggleButtonGroup>

            <ToggleButtonGroup
              color="primary"
              size="small"
              value={viewStore}
              exclusive
              onChange={handleViewStoreChange}
            >
              <ToggleButton value={null}>TOUT</ToggleButton>
              {storesStats.data?.map((store) => (
                <ToggleButton value={store.id}>{store.name}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          {salesStats.isSuccess && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "flex-start",
                gap: 2,
              }}
            >
              <Box sx={{ flex: "1 1 400px", minWidth: 0 }}>
                <BarChart
                  height={350}
                  series={[
                    {
                      data:
                        salesStats.data?.data.stats.by_day.map(
                          (cat) => cat.total_amount,
                        ) ?? [],
                      label: "Chiffre d'affaires",
                      id: "money",
                    },
                    {
                      data:
                        salesStats.data?.data.stats.by_day.map(
                          (cat) => cat.transaction_count,
                        ) ?? [],
                      label: "nombre de transactions",
                      id: "quantity",
                    },
                  ]}
                  xAxis={[
                    {
                      data: salesStats.data?.data.stats.by_day.map(
                        (cat) => cat.date,
                      ),
                      height: 28,
                    },
                  ]}
                  yAxis={[{ width: 50 }]}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Quantité par catégorie
                </Typography>
                <PieChart
                  series={[
                    {
                      data:
                        salesStats.data?.data.stats.by_category.map(
                          (cat, index) => ({
                            id: index,
                            label: cat.category_name,
                            value: cat.total_quantity,
                          }),
                        ) || [],
                    },
                  ]}
                  width={200}
                  height={200}
                />
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 0.5 }}
                >
                  Montant par catégorie
                </Typography>
                <PieChart
                  series={[
                    {
                      data:
                        salesStats.data?.data.stats.by_category.map(
                          (cat, index) => ({
                            id: index,
                            label: cat.category_name,
                            value: cat.total_price_sum,
                          }),
                        ) || [],
                      valueFormatter: (item) =>
                        `${item.label} ${formatCurrency(item.value as number)}`,
                    },
                  ]}
                  width={200}
                  height={200}
                />
              </Box>
            </Box>
          )}
        </Box>
        <Box>
          <EcoOrganismStats
            title="Statistiques sortant par éco-organisme"
            stats={ecoOrganismQuarterStats.data || []}
            loading={ecoOrganismQuarterStats.isLoading}
            valueLabel="Tonnage sortant (kg)"
            metricSource="quarterOut"
          />
          <EcoOrganismStats
            title="Statistiques entrant par éco-organisme"
            stats={ecoOrganismQuarterStats.data || []}
            loading={ecoOrganismQuarterStats.isLoading}
            valueLabel="Tonnage entrant (kg)"
            metricSource="quarterIn"
          />
          <EcoOrganismStats
            title="Statistiques vente par éco-organisme"
            stats={ecoOrganismQuarterStats.data || []}
            loading={ecoOrganismQuarterStats.isLoading}
            valueLabel="Tonnage vendu (kg)"
            metricSource="quarterSell"
          />
        </Box>

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
                <Badge badgeContent={activities.data?.length} color="primary">
                  <Button size="small" variant="outlined">
                    Voir tout
                  </Button>
                </Badge>
              </Box>
            </Box>

            <List sx={{ "& .MuiListItem-root": { px: 0 } }}>
              {activities.data?.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ActivityItem activity={activity} />
                  {index < activities.data?.length - 1 && <Divider />}
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
            <DashboardNotifications onDismiss={() => {}} />
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
                {((stats.data?.soldThisMonth || 0 / 200) * 100).toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                de l'objectif (200 ventes)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(stats.data?.soldThisMonth || 0 / 200) * 100}
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
                {Math.max(
                  0,
                  50 - Math.floor(stats.data?.availableItems || 0 / 100),
                )}
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
                {(
                  ((stats.data?.soldThisMonth || 0) /
                    (stats.data?.availableItems || 0)) *
                  100
                ).toFixed(1)}
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
