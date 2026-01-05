import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import {
  Schedule,
  Add,
  Remove,
  CheckCircle,
  AccessTime,
} from '@mui/icons-material';

const DurationPicker = ({ open, onClose, onSelect, initialValue = 60 }) => {
  const [selectedDuration, setSelectedDuration] = useState(initialValue);

  // Durées prédéfinies communes (en minutes)
  const quickDurations = [15, 30, 45, 60, 90, 120, 180, 240, 300, 480];
  
  // Durées par tranches de 15 minutes
  const generateDurations = () => {
    const durations = [];
    for (let i = 15; i <= 480; i += 15) {
      durations.push(i);
    }
    return durations;
  };

  const allDurations = generateDurations();

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const handleQuickSelect = (duration) => {
    setSelectedDuration(duration);
  };

  const handleManualAdjust = (change) => {
    const newDuration = Math.max(15, Math.min(480, selectedDuration + change));
    setSelectedDuration(newDuration);
  };

  const handleConfirm = () => {
    onSelect(selectedDuration);
    onClose();
  };

  useEffect(() => {
    if (open) {
      setSelectedDuration(initialValue);
    }
  }, [open, initialValue]);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      slotProps={{
        paper: {
          sx: { borderRadius: 3 }
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <Schedule color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Sélectionner la durée
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {/* Durée sélectionnée */}
        <Paper 
          elevation={3} 
          sx={{ 
            p: 3, 
            mb: 3, 
            textAlign: 'center',
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {formatDuration(selectedDuration)}
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Durée sélectionnée
          </Typography>
        </Paper>

        {/* Contrôles manuels */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton
            onClick={() => handleManualAdjust(-15)}
            disabled={selectedDuration <= 15}
            size="large"
            sx={{ 
              backgroundColor: 'error.light', 
              color: 'white',
              '&:hover': { backgroundColor: 'error.main' },
              '&:disabled': { backgroundColor: 'grey.300' }
            }}
          >
            <Remove />
          </IconButton>
          
          <Typography variant="h6" sx={{ minWidth: 100, textAlign: 'center' }}>
            -15 min
          </Typography>
          
          <Typography variant="h6" sx={{ minWidth: 100, textAlign: 'center' }}>
            +15 min
          </Typography>
          
          <IconButton
            onClick={() => handleManualAdjust(15)}
            disabled={selectedDuration >= 480}
            size="large"
            sx={{ 
              backgroundColor: 'success.light', 
              color: 'white',
              '&:hover': { backgroundColor: 'success.main' },
              '&:disabled': { backgroundColor: 'grey.300' }
            }}
          >
            <Add />
          </IconButton>
        </Box>

        {/* Durées rapides */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          <AccessTime sx={{ mr: 1, verticalAlign: 'middle' }} />
          Durées rapides
        </Typography>
        <Grid container spacing={1} sx={{ mb: 3 }}>
          {quickDurations.map((duration) => (
            <Grid size={{ xs:6 ,sm:4, md:2.4}} key={duration}>
              <Chip
                label={formatDuration(duration)}
                onClick={() => handleQuickSelect(duration)}
                variant={selectedDuration === duration ? 'filled' : 'outlined'}
                color={selectedDuration === duration ? 'primary' : 'default'}
                sx={{ 
                  width: '100%',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: selectedDuration === duration ? 'primary.dark' : 'primary.light',
                    color: 'white'
                  }
                }}
              />
            </Grid>
          ))}
        </Grid>

        {/* Grille complète par tranches de 15 minutes */}
        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Toutes les durées (par tranches de 15 min)
        </Typography>
        <Box sx={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: 1, p: 1 }}>
          <Grid container spacing={0.5}>
            {allDurations.map((duration) => (
              <Grid size={{xs:3, sm:2, md:1.5}}  key={duration}>
                <Chip
                  label={formatDuration(duration)}
                  size="small"
                  onClick={() => handleQuickSelect(duration)}
                  variant={selectedDuration === duration ? 'filled' : 'outlined'}
                  color={selectedDuration === duration ? 'primary' : 'default'}
                  sx={{ 
                    width: '100%',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    '&:hover': {
                      backgroundColor: selectedDuration === duration ? 'primary.dark' : 'primary.light',
                      color: 'white'
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Informations pratiques */}
        <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <strong>Conseils :</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            • 15-30 min : Collecte rapide<br/>
            • 60-90 min : Collecte standard<br/>
            • 120+ min : Collecte longue ou multiple points
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined">
          Annuler
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained"
          startIcon={<CheckCircle />}
          size="large"
        >
          Confirmer ({formatDuration(selectedDuration)})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DurationPicker;










