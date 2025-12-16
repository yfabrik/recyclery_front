import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  Divider,
  LinearProgress,
  Tooltip
} from '@mui/material';
import {
  Store,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  ShoppingCart,
  Inventory,
  Assessment
} from '@mui/icons-material';

const StoreStats = ({ stores, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value) => {
    if (value > 0) return 'success';
    if (value < 0) return 'error';
    return 'default';
  };

  const getGrowthIcon = (value) => {
    if (value > 0) return <TrendingUp fontSize="small" />;
    if (value < 0) return <TrendingDown fontSize="small" />;
    return null;
  };

  if (loading) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Statistiques par Magasin
        </Typography>
        <LinearProgress />
      </Box>
    );
  }

  if (!stores || stores.length === 0) {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Statistiques par Magasin
        </Typography>
        <Card>
          <CardContent>
            <Typography color="textSecondary" align="center">
              Aucun magasin trouvé
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Store />
        Statistiques par Magasin
      </Typography>
      
      <Grid container spacing={3}>
        {stores.map((store) => (
          <Grid item xs={12} md={6} lg={4} key={store.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                {/* En-tête du magasin */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                    <Store />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {store.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {store.address}
                    </Typography>
                  </Box>
                  <Chip
                    label={formatPercentage(store.stats.growth.revenue)}
                    color={getGrowthColor(store.stats.growth.revenue)}
                    size="small"
                    icon={getGrowthIcon(store.stats.growth.revenue)}
                  />
                </Box>

                <Divider sx={{ mb: 2 }} />

                {/* Statistiques principales */}
                <Grid container spacing={2}>
                  {/* Chiffre d'affaires */}
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="success.main" fontWeight="bold">
                        {formatCurrency(store.stats.currentMonth.revenue)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        CA ce mois
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Transactions */}
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h5" color="primary.main" fontWeight="bold">
                        {store.stats.currentMonth.transactions}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Transactions
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Panier moyen */}
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="info.main" fontWeight="bold">
                        {formatCurrency(store.stats.currentMonth.averageTransaction)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Panier moyen
                      </Typography>
                    </Box>
                  </Grid>

                  {/* Articles disponibles */}
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="warning.main" fontWeight="bold">
                        {store.stats.items.available}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Articles
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Détails supplémentaires */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Assessment fontSize="small" color="action" />
                    <Typography variant="body2" color="textSecondary">
                      {store.stats.currentMonth.sessions} sessions
                    </Typography>
                  </Box>
                  
                  <Tooltip title={`CA mois dernier: ${formatCurrency(store.stats.lastMonth.revenue)}`}>
                    <Typography variant="body2" color="textSecondary">
                      vs mois dernier
                    </Typography>
                  </Tooltip>
                </Box>

                {/* Graphique simple des 7 derniers jours */}
                {store.stats.weeklyData && store.stats.weeklyData.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Ventes des 7 derniers jours
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'end', gap: 0.5, height: 40 }}>
                      {store.stats.weeklyData.slice(-7).map((day, index) => {
                        const maxRevenue = Math.max(...store.stats.weeklyData.map(d => d.revenue));
                        const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
                        
                        return (
                          <Tooltip
                            key={index}
                            title={`${new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short' })}: ${formatCurrency(day.revenue)}`}
                          >
                            <Box
                              sx={{
                                flexGrow: 1,
                                height: `${Math.max(height, 10)}%`,
                                bgcolor: 'primary.main',
                                borderRadius: 0.5,
                                minHeight: 4
                              }}
                            />
                          </Tooltip>
                        );
                      })}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default StoreStats;










