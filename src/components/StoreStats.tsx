import {
  Assessment,
  Store,
  TrendingDown,
  TrendingUp
} from '@mui/icons-material';
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  LinearProgress,
  Tooltip,
  Typography,
  type DialogProps
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getStoreHistoryStats, type StoreStat } from '../services/api/dashboard';
import { formatCurrency } from '../services/cartService';
import { Loading } from './Loading';
import { formatDate } from '../services/dateService';

interface StoreStatsProps {
  stores: StoreStat[]
  loading: boolean
}

const StoreStats = ({ stores, loading }: StoreStatsProps) => {
  const [selectedStore, setSelectedStore] = useState<StoreStat | null>(null)
  const [openHistoryStore, setOpenHistoryStore] = useState(false)



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
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store />
          Statistiques du mois, par Magasin
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

  const handleOpenHistoryDialog = (store: StoreStat) => {
    setSelectedStore(store)
    setOpenHistoryStore(true)
  }
  const handleCloseHistoryDialog = () => {
    setSelectedStore(null)
    setOpenHistoryStore(false)
  }
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Store />
        Statistiques du mois, par Magasin
      </Typography>

      <Grid container spacing={3}>
        {stores.map((store) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={store.id}>
            <StoreMonthlyStats store={store} handleOpenDialog={handleOpenHistoryDialog} />
          </Grid>
        ))}
      </Grid>
      {selectedStore &&
        <StoreHistorySales openDialog={openHistoryStore} store={selectedStore} handleCloseDialog={handleCloseHistoryDialog} />
      }

    </Box>
  );
};

export default StoreStats;

interface StoreMonthlyStatsProps {
  store: StoreStat
  handleOpenDialog?: (store: StoreStat) => void
}
const StoreMonthlyStats = ({ store, handleOpenDialog }: StoreMonthlyStatsProps) => {

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'success';
    if (value < 0) return 'error';
    return 'default';
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <TrendingUp fontSize="small" />;
    if (value < 0) return <TrendingDown fontSize="small" />;
    return undefined;
  };
  return (
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
          <Grid size={{ xs: 6 }}>
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
          <Grid size={{ xs: 6 }}>
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
          <Grid size={{ xs: 6 }}>
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
          <Grid size={{ xs: 6 }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="warning.main" fontWeight="bold">
                {store.stats.items.sold}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Articles vendus ce mois
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
            <Typography variant="body2" color="textSecondary" onClick={() => handleOpenDialog && handleOpenDialog(store)}>
              vs mois dernier
            </Typography>
          </Tooltip>
        </Box>

      </CardContent>
    </Card>
  )
}



interface StoreHistorySalesProps {
  openDialog: boolean
  store: StoreStat
  handleCloseDialog: DialogProps["onClose"]
}
const StoreHistorySales = ({ openDialog, store, handleCloseDialog }: StoreHistorySalesProps) => {

  const history = useQuery({
    queryKey: ["storeHistory", store.id],
    queryFn: () => getStoreHistoryStats(store.id).then(response => response.data)
  })
  return (
    <Loading isLoading={history.isLoading}>
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="xl"
        fullWidth
      >
        <DialogTitle>historique du magasin:{store.name}</DialogTitle>
        <DialogContent>
          {
            history.data && (
              history.data.data.stats.map((storeStat, index) => {
                const data = history.data.data

                return (
                  <>
                    <Typography sx={{mt:3,pl:3}}>{formatDate(new Date(storeStat.currentMonth.start))}  -  {formatDate(new Date(storeStat.currentMonth.end))}</Typography>
                    < StoreMonthlyStats store={{ id: data.id, name: data.name, address: data.address, phone: data.phone, email: data.email, stats: storeStat }} key={index} />
                  </>
                )
              })
            )
          }
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={() => handleCloseDialog()}>fermer</Button> */}
        </DialogActions>
      </Dialog>
    </Loading>

  )
}
