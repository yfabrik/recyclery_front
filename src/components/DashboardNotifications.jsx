import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  Divider,
  Alert,
} from '@mui/material';
import {
  Warning,
  Info,
  CheckCircle,
  Error,
  Close,
  LocalShipping,
  VolunteerActivism,
  Inventory,
  Schedule,
} from '@mui/icons-material';

const NotificationItem = ({ notification }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return <Warning color="warning" />;
      case 'error':
        return <Error color="error" />;
      case 'success':
        return <CheckCircle color="success" />;
      case 'info':
      default:
        return <Info color="info" />;
    }
  };

  const getSeverity = (type) => {
    switch (type) {
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <ListItem sx={{ px: 0 }}>
      <ListItemIcon>
        {getIcon(notification.type)}
      </ListItemIcon>
      <ListItemText
        primary={notification.title}
        secondary={
          <React.Fragment>
            <Typography variant="body2" color="textSecondary" component="span" sx={{ display: 'block' }}>
              {notification.message}
            </Typography>
            <Typography variant="caption" color="textSecondary" component="span" sx={{ display: 'block' }}>
              {notification.time}
            </Typography>
          </React.Fragment>
        }
      />
      <Chip 
        label={notification.priority} 
        size="small"
        color={notification.priority === 'Urgent' ? 'error' : 'default'}
        variant="outlined"
      />
    </ListItem>
  );
};

const DashboardNotifications = ({ notifications = [], onDismiss }) => {
  // Notifications simulées pour la démo
  const defaultNotifications = [
    {
      id: 1,
      type: 'warning',
      title: 'Stock faible',
      message: 'La catégorie "Électronique" a moins de 10 articles en stock',
      time: 'Il y a 30min',
      priority: 'Moyen'
    },
    {
      id: 2,
      type: 'info',
      title: 'Collecte programmée',
      message: 'Collecte prévue demain à 9h pour le quartier Nord',
      time: 'Il y a 2h',
      priority: 'Normal'
    },
    {
      id: 3,
      type: 'success',
      title: 'Objectif atteint',
      message: 'L\'objectif de vente de la semaine est atteint !',
      time: 'Il y a 4h',
      priority: 'Normal'
    },
    {
      id: 4,
      type: 'error',
      title: 'Don en attente',
      message: '3 dons en attente de traitement depuis plus de 48h',
      time: 'Il y a 1j',
      priority: 'Urgent'
    }
  ];

  const displayNotifications = notifications.length > 0 ? notifications : defaultNotifications;

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Notifications
        </Typography>
        <Chip 
          label={displayNotifications.length} 
          color="primary" 
          size="small"
        />
      </Box>
      
      {displayNotifications.length === 0 ? (
        <Alert severity="success">
          Aucune notification en attente
        </Alert>
      ) : (
        <List sx={{ '& .MuiListItem-root': { px: 0 } }}>
          {displayNotifications.map((notification, index) => (
            <React.Fragment key={notification.id}>
              <NotificationItem notification={notification} />
              {index < displayNotifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Paper>
  );
};

export default DashboardNotifications;
