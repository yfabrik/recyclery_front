import React from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
} from '@mui/material';
import {
  Backspace,
  Clear,
  Check,
} from '@mui/icons-material';

const NumericKeypad = ({ 
  value, 
  onChange, 
  onClose, 
  maxValue = 9999,
  decimalPlaces = 1,
  unit = 'kg'
}) => {
  const handleNumberClick = (number) => {
    const currentValue = value.toString();
    
    // Si c'est "0", remplacer par le nouveau chiffre
    if (currentValue === '0') {
      onChange(number.toString());
      return;
    }

    // Vérifier si on peut ajouter un décimal
    if (number === '.' || number === ',') {
      if (currentValue.includes('.') || currentValue.includes(',')) {
        return; // Déjà un décimal
      }
      onChange(currentValue + '.');
      return;
    }

    // Vérifier la limite de décimales
    if (currentValue.includes('.')) {
      const decimalPart = currentValue.split('.')[1];
      if (decimalPart && decimalPart.length >= decimalPlaces) {
        return;
      }
    }

    const newValue = currentValue + number.toString();
    const numericValue = parseFloat(newValue);
    
    if (numericValue <= maxValue) {
      onChange(newValue);
    }
  };

  const handleBackspace = () => {
    const currentValue = value.toString();
    if (currentValue.length > 1) {
      onChange(currentValue.slice(0, -1));
    } else {
      onChange('0');
    }
  };

  const handleClear = () => {
    onChange('0');
  };

  const formatDisplayValue = () => {
    if (!value || value === '0') return '0';
    return value.toString();
  };

  return (
    <Box sx={{ minWidth: 280 }}>
      {/* Affichage de la valeur */}
      <Box 
        sx={{ 
          mb: 3, 
          p: 3, 
          backgroundColor: '#f8f9fa', 
          borderRadius: 2,
          border: '2px solid #e3f2fd',
          textAlign: 'center'
        }}
      >
        <Typography variant="h3" fontWeight="bold" color="primary.main">
          {formatDisplayValue()}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          {unit}
        </Typography>
      </Box>

      {/* Clavier numérique */}
      <Grid container spacing={1}>
        {/* Ligne 1: 7, 8, 9 */}
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick(7)}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            7
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick(8)}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            8
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick(9)}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            9
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleBackspace}
            sx={{ 
              minHeight: 50,
              color: 'error.main',
              borderColor: 'error.main',
              '&:hover': { 
                backgroundColor: '#ffebee',
                borderColor: 'error.main'
              }
            }}
          >
            <Backspace />
          </Button>
        </Grid>

        {/* Ligne 2: 4, 5, 6 */}
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick(4)}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            4
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick(5)}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            5
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick(6)}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            6
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={handleClear}
            sx={{ 
              minHeight: 50,
              color: 'warning.main',
              borderColor: 'warning.main',
              '&:hover': { 
                backgroundColor: '#fff3e0',
                borderColor: 'warning.main'
              }
            }}
          >
            <Clear />
          </Button>
        </Grid>

        {/* Ligne 3: 1, 2, 3 */}
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick(1)}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            1
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick(2)}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            2
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick(3)}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            3
          </Button>
        </Grid>
        <Grid item xs={3}>
          {/* Espace réservé */}
        </Grid>

        {/* Ligne 4: 0, . */}
        <Grid item xs={6}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick(0)}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            0
          </Button>
        </Grid>
        <Grid item xs={3}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => handleNumberClick('.')}
            sx={{ 
              minHeight: 50, 
              fontSize: '1.3rem',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#e3f2fd' }
            }}
          >
            ,
          </Button>
        </Grid>
        <Grid item xs={3}>
          {/* Espace pour l'alignement */}
        </Grid>
      </Grid>

      {/* Boutons de raccourci pour poids courants */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="caption" color="textSecondary" gutterBottom display="block">
          Poids fréquents :
        </Typography>
        <Grid container spacing={1}>
          {[0.5, 1, 2, 5, 10, 20].map((weight) => (
            <Grid item xs={2} key={weight}>
              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={() => onChange(weight.toString())}
                sx={{ 
                  minHeight: 35,
                  fontSize: '0.8rem',
                  color: 'primary.main',
                  border: '1px solid transparent',
                  '&:hover': { 
                    backgroundColor: '#e3f2fd',
                    border: '1px solid #1976d2'
                  }
                }}
              >
                {weight}kg
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Bouton fermer en bas */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<Check />}
          sx={{ 
            minWidth: 120,
            '&:hover': { backgroundColor: '#e8f5e8' }
          }}
        >
          Valider
        </Button>
      </Box>
    </Box>
  );
};

export default NumericKeypad;