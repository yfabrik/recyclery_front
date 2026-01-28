import React from 'react';
import {
  Container,
  Typography,
  Box,
} from '@mui/material';
import {
  Schedule,
} from '@mui/icons-material';
import CollectionCalendar from '../components/CollectionCalendar';
/**
 * @deprecated
 * @returns 
 */
const CollectionSchedule = () => {

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <Schedule sx={{ mr: 1, verticalAlign: 'middle' }} />
          Planning des Collectes
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Vue calendrier pour la gestion des plannings et bordereaux de collecte
        </Typography>
      </Box>

      <CollectionCalendar />
    </Container>
  );
};

export default CollectionSchedule;
