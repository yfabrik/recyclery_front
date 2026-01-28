/**
 * @deprecated
 */
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  TextField,
  Divider,
  Chip,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add,
  Remove,
  AttachMoney,
  Euro,
} from '@mui/icons-material';

/**
 * @deprecated
 */
const MoneyCounter = ({ onTotalChange=()=>console.log("changed"), initialAmount = 0 }) => {
  // Définition des pièces et billets français
  const denominations = [
    // Pièces
    { value: 0.01, label: '1 centime', type: 'coin', color: '#FFD700' },
    { value: 0.02, label: '2 centimes', type: 'coin', color: '#FFD700' },
    { value: 0.05, label: '5 centimes', type: 'coin', color: '#FFD700' },
    { value: 0.10, label: '10 centimes', type: 'coin', color: '#FFD700' },
    { value: 0.20, label: '20 centimes', type: 'coin', color: '#FFD700' },
    { value: 0.50, label: '50 centimes', type: 'coin', color: '#FFD700' },
    { value: 1, label: '1 €', type: 'coin', color: '#C0C0C0' },
    { value: 2, label: '2 €', type: 'coin', color: '#C0C0C0' },
    
    // Billets
    { value: 5, label: '5 €', type: 'bill', color: '#87CEEB' },
    { value: 10, label: '10 €', type: 'bill', color: '#98FB98' },
    { value: 20, label: '20 €', type: 'bill', color: '#F0E68C' },
    { value: 50, label: '50 €', type: 'bill', color: '#DDA0DD' },
    { value: 100, label: '100 €', type: 'bill', color: '#F4A460' },
    { value: 200, label: '200 €', type: 'bill', color: '#CD853F' },
    { value: 500, label: '500 €', type: 'bill', color: '#B0C4DE' },
  ];

  const [counts, setCounts] = useState({});
  const [total, setTotal] = useState(initialAmount);

  // Calculer le total à chaque changement
  useEffect(() => {
    const newTotal = denominations.reduce((sum, denom) => {
      const count = counts[denom.value] || 0;
      return sum + (count * denom.value);
    }, 0);
    
    setTotal(newTotal);
    onTotalChange(newTotal);
  }, [counts, onTotalChange]);

  const updateCount = (value, change) => {
    setCounts(prev => ({
      ...prev,
      [value]: Math.max(0, (prev[value] || 0) + change)
    }));
  };

  const setCount = (value, newCount) => {
    setCounts(prev => ({
      ...prev,
      [value]: Math.max(0, parseInt(newCount) || 0)
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getTotalByType = (type) => {
    return denominations
      .filter(denom => denom.type === type)
      .reduce((sum, denom) => {
        const count = counts[denom.value] || 0;
        return sum + (count * denom.value);
      }, 0);
  };

  const coinsTotal = getTotalByType('coin');
  const billsTotal = getTotalByType('bill');

  return (
    <Box>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AttachMoney color="primary" />
        Comptage de la caisse
      </Typography>
      <Grid container spacing={2}>
        {/* Pièces */}
        <Grid size={{ xs: 12, md: 6}}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Euro color="primary" />
                Pièces
              </Typography>
              <Stack spacing={1}>
                {denominations.filter(d => d.type === 'coin').map(denom => (
                  <Box key={denom.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        backgroundColor: denom.color,
                        border: '2px solid #333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        color: '#333'
                      }}
                    >
                      {denom.value < 1 ? `${denom.value * 100}c` : `${denom.value}€`}
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      {denom.label}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateCount(denom.value, -1)}
                      disabled={!counts[denom.value]}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <TextField
                      size="small"
                      value={counts[denom.value] || 0}
                      onChange={(e) => setCount(denom.value, e.target.value)}
                      type="number"
                      slotProps={{
                        htmlInput: { 
                          style: { textAlign: 'center', width: 50 },
                          min: 0
                        }
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => updateCount(denom.value, 1)}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'right' }}>
                      {formatCurrency((counts[denom.value] || 0) * denom.value)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold">
                  Total pièces:
                </Typography>
                <Chip 
                  label={formatCurrency(coinsTotal)} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Billets */}
        <Grid size={{ xs: 12, md: 6}}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney color="success" />
                Billets
              </Typography>
              <Stack spacing={1}>
                {denominations.filter(d => d.type === 'bill').map(denom => (
                  <Box key={denom.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 20,
                        backgroundColor: denom.color,
                        border: '1px solid #333',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '8px',
                        fontWeight: 'bold',
                        color: '#333'
                      }}
                    >
                      {denom.value}€
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 80 }}>
                      {denom.label}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => updateCount(denom.value, -1)}
                      disabled={!counts[denom.value]}
                    >
                      <Remove fontSize="small" />
                    </IconButton>
                    <TextField
                      size="small"
                      value={counts[denom.value] || 0}
                      onChange={(e) => setCount(denom.value, e.target.value)}
                      type="number"
                      slotProps={{
                        htmlInput: { 
                          style: { textAlign: 'center', width: 50 },
                          min: 0
                        }
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => updateCount(denom.value, 1)}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                    <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'right' }}>
                      {formatCurrency((counts[denom.value] || 0) * denom.value)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" fontWeight="bold">
                  Total billets:
                </Typography>
                <Chip 
                  label={formatCurrency(billsTotal)} 
                  color="success" 
                  variant="outlined"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      {/* Total général */}
      <Paper 
        elevation={3} 
        sx={{ 
          mt: 2, 
          p: 2, 
          backgroundColor: 'primary.main', 
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Total: {formatCurrency(total)}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {formatCurrency(coinsTotal)} en pièces + {formatCurrency(billsTotal)} en billets
        </Typography>
      </Paper>
    </Box>
  );
};

export default MoneyCounter;










