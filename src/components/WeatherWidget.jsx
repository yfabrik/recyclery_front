import React from 'react';
import {
  Paper,
  Typography,
  Box,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  WbSunny,
  Cloud,
  WbCloudy,
  AcUnit,
  Air,
} from '@mui/icons-material';

const WeatherWidget = () => {
  // Données météo simulées
  const weather = {
    temperature: 22,
    condition: 'Ensoleillé',
    humidity: 65,
    windSpeed: 12,
    icon: <WbSunny color="warning" />,
  };

  const getWeatherIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'ensoleillé':
        return <WbSunny color="warning" />;
      case 'nuageux':
        return <WbCloudy color="info" />;
      case 'pluvieux':
        return <Cloud color="primary" />;
      case 'neige':
        return <AcUnit color="info" />;
      default:
        return <WbSunny color="warning" />;
    }
  };

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
        Météo du jour
      </Typography>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ fontSize: '2.5rem' }}>
          {getWeatherIcon(weather.condition)}
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            {weather.temperature}°C
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {weather.condition}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Air fontSize="small" color="action" />
          <Typography variant="body2">
            Vent: {weather.windSpeed} km/h
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            Humidité: {weather.humidity}%
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Conseils du jour
        </Typography>
        <Chip 
          label="Idéal pour les collectes extérieures" 
          color="success" 
          variant="outlined"
          size="small"
        />
      </Box>
    </Paper>
  );
};

export default WeatherWidget;











