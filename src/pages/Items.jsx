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
} from '@mui/material';
import {
  Add,
  Inventory,
  Category,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const Items = () => {
  // Données simulées
  const items = [
    {
      id: 1,
      name: 'Réfrigérateur Samsung',
      category: 'Électroménager',
      price: 150,
      status: 'available',
      color: '#FF6B6B'
    },
    {
      id: 2,
      name: 'Canapé 3 places',
      category: 'Mobilier',
      price: 80,
      status: 'sold',
      color: '#4ECDC4'
    },
    {
      id: 3,
      name: 'Télévision LED 32"',
      category: 'Électronique',
      price: 120,
      status: 'available',
      color: '#45B7D1'
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'sold': return 'default';
      case 'reserved': return 'warning';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'available': return 'Disponible';
      case 'sold': return 'Vendu';
      case 'reserved': return 'Réservé';
      default: return 'Inconnu';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestion des Articles
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Gérez l'inventaire de vos articles
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => toast.info('Fonctionnalité en développement')}
        >
          Nouvel Article
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Article</TableCell>
                      <TableCell>Catégorie</TableCell>
                      <TableCell>Prix</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ bgcolor: 'primary.main' }}>
                              <Inventory />
                            </Avatar>
                            <Typography variant="subtitle2">
                              {item.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={item.category}
                            size="small"
                            sx={{ bgcolor: item.color, color: 'white' }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" color="success.main">
                            {item.price}€
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(item.status)}
                            color={getStatusColor(item.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">
                            Modifier
                          </Button>
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

export default Items;

