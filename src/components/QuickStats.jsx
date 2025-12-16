import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Stack,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Inventory,
  ShoppingCart,
  AttachMoney,
} from '@mui/icons-material';

const QuickStat = ({ title, value, target, color = 'primary', icon }) => {
  const percentage = target ? (value / target) * 100 : 0;
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box>
            <Typography variant="overline" color="textSecondary">
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {target && (
              <Typography variant="body2" color="textSecondary">
                Objectif: {target}
              </Typography>
            )}
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
        {target && (
          <Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(percentage, 100)}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: `${color}.light`,
                '& .MuiLinearProgress-bar': {
                  bgcolor: `${color}.main`,
                },
              }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              {percentage.toFixed(1)}% complété
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const QuickStats = ({ stats }) => {
  return (
    <Stack spacing={2}>
      <QuickStat
        title="Ventes ce mois"
        value={stats.soldThisMonth || 0}
        target={200}
        color="success"
        icon={<ShoppingCart />}
      />
      <QuickStat
        title="Chiffre d'affaires"
        value={`${stats.totalRevenue || 0}€`}
        target={5000}
        color="info"
        icon={<AttachMoney />}
      />
      <QuickStat
        title="Articles en stock"
        value={stats.availableItems || 0}
        color="primary"
        icon={<Inventory />}
      />
    </Stack>
  );
};

export default QuickStats;











