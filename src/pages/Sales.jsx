import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add,
  ShoppingCart,
  Person,
  Payment,
  Schedule,
  Receipt,
  Print,
  Undo,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Sales = () => {
  const sales = [
    {
      id: 1,
      customer_name: 'Antoine Moreau',
      total_amount: 150.00,
      payment_method: 'cash',
      created_at: '2023-12-15T14:30:00',
      items_count: 2,
      sold_by_name: 'Marie Dupont'
    },
    {
      id: 2,
      customer_name: 'Lucie Bernard',
      total_amount: 85.50,
      payment_method: 'card',
      created_at: '2023-12-15T11:15:00',
      items_count: 1,
      sold_by_name: 'Jean Martin'
    },
    {
      id: 3,
      customer_name: 'Client anonyme',
      total_amount: 25.00,
      payment_method: 'cash',
      created_at: '2023-12-14T16:45:00',
      items_count: 3,
      sold_by_name: 'Sophie Bernard'
    },
  ];

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cash': return 'Espèces';
      case 'card': return 'Carte';
      case 'check': return 'Chèque';
      default: return 'Autre';
    }
  };

  const getPaymentMethodColor = (method) => {
    switch (method) {
      case 'cash': return 'success';
      case 'card': return 'info';
      case 'check': return 'warning';
      default: return 'default';
    }
  };

  // Fonctions de gestion des actions
  const handleCreditNote = (saleId) => {
    // Redirection vers la page avoirs
    window.location.href = '/refunds';
    toast.info('Redirection vers la page des avoirs...');
  };

  const handleReprintReceipt = (saleId) => {
    // Fonction pour réimprimer le ticket de caisse
    toast.success(`Réimpression du ticket de caisse #${saleId} en cours...`);
    // Ici on pourrait ajouter la logique d'impression réelle
  };

  const handleRefund = (saleId) => {
    // Fonction pour procéder au remboursement
    toast.info(`Module de remboursement pour la transaction #${saleId} - À développer`);
    // Ici on pourrait ouvrir une modal ou rediriger vers un module de remboursement
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestion des Ventes
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Suivez et gérez les ventes d'articles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => toast.info('Fonctionnalité en développement')}
        >
          Nouvelle Vente
        </Button>
      </Box>

      <Grid container spacing={3}>
        {/* Statistiques rapides */}
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4">
                    {sales.reduce((sum, sale) => sum + sale.total_amount, 0).toFixed(2)}€
                  </Typography>
                  <Typography variant="body2">
                    Chiffre d'affaires total
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Payment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'info.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4">
                    {sales.length}
                  </Typography>
                  <Typography variant="body2">
                    Ventes totales
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <ShoppingCart />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4">
                    {sales.reduce((sum, sale) => sum + sale.items_count, 0)}
                  </Typography>
                  <Typography variant="body2">
                    Articles vendus
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
                  <Person />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tableau des ventes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Historique des ventes
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>N° Vente</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Montant</TableCell>
                      <TableCell>Paiement</TableCell>
                      <TableCell>Articles</TableCell>
                      <TableCell>Vendeur</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sales.map((sale) => (
                      <TableRow key={sale.id}>
                        <TableCell>
                          <Typography variant="subtitle2" color="primary">
                            #{sale.id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                              <Person />
                            </Avatar>
                            {sale.customer_name}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="success.main">
                            {sale.total_amount.toFixed(2)}€
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getPaymentMethodLabel(sale.payment_method)}
                            color={getPaymentMethodColor(sale.payment_method)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${sale.items_count} article${sale.items_count > 1 ? 's' : ''}`}
                            variant="outlined"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{sale.sold_by_name}</TableCell>
                        <TableCell>
                          {new Date(sale.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Créer un avoir">
                              <IconButton 
                                size="small" 
                                color="warning" 
                                onClick={() => handleCreditNote(sale.id)}
                              >
                                <Receipt />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Réimprimer le ticket">
                              <IconButton 
                                size="small" 
                                color="info" 
                                onClick={() => handleReprintReceipt(sale.id)}
                              >
                                <Print />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Remboursement">
                              <IconButton 
                                size="small" 
                                color="error" 
                                onClick={() => handleRefund(sale.id)}
                              >
                                <Undo />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Sales;

