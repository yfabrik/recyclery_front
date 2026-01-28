/**
 * @deprecated
 */
import { Assessment, LocalShipping, Receipt, Schedule } from "@mui/icons-material";
import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";

export const LogisticsTab = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          🚚 Gestion Logistique
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Planning Collectes */}
        <Grid size={{ xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Schedule sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Planning Collectes
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Gérer les plannings de collecte et les créneaux horaires
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Schedule />}
                onClick={() => window.location.href = '/collection-schedule'}
                fullWidth
              >
                Accéder au Planning
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Bordereaux */}
        <Grid size={{ xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Receipt sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Bordereaux
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Consulter et gérer les bordereaux de collecte
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<Receipt />}
                onClick={() => window.location.href = '/collection-receipts'}
                fullWidth
              >
                Voir les Bordereaux
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Collectes */}
        <Grid size={{ xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Collectes
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Suivre et gérer les collectes en cours
              </Typography>
              <Button 
                variant="contained" 
                startIcon={<LocalShipping />}
                onClick={() => window.location.href = '/collections'}
                fullWidth
              >
                Gérer les Collectes
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistiques Logistiques */}
        <Grid size={{ xs: 12, md: 6}}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">
                  Statistiques Logistiques
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Consulter les statistiques et rapports logistiques
              </Typography>
              <Button 
                variant="outlined" 
                startIcon={<Assessment />}
                onClick={() => window.location.href = '/dashboard'}
                fullWidth
              >
                Voir les Statistiques
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};