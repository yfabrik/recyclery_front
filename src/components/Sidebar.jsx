import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Toolbar,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Dashboard,
  Inventory,
  LocalShipping,
  VolunteerActivism,
  PointOfSale,
  Store,
  Settings,
  People,
  Assessment,
  AdminPanelSettings,
  Schedule,
  Receipt,
  CalendarToday,
  Category,
  QrCode,
  DeleteSweep,
  Build,
  Assignment,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const Sidebar = ({ open, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isManager, isAdmin } = useAuth();

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { label: 'Tableau de bord', path: '/dashboard', icon: Dashboard, roles: ['employee', 'manager', 'admin'] },
        { label: 'Logiciel de caisse', path: '/pos', icon: PointOfSale, roles: ['employee', 'manager', 'admin'] },
        { label: 'Gestion des déchets', path: '/waste-management', icon: DeleteSweep, roles: ['admin'] },
        { label: 'Arrivages', path: '/arrivals', icon: Inventory, roles: ['employee', 'manager', 'admin'] },
        { label: 'Outils Salariés', path: '/employee-tools', icon: Build, roles: ['employee', 'manager', 'admin'] },
        { label: 'Étiquetage', path: '/labels', icon: QrCode, roles: ['employee', 'manager', 'admin'] },
        { label: 'Ventes', path: '/sales', icon: Assessment, roles: ['employee', 'manager', 'admin'] },
      ]
    },
    {
      title: 'Opérations',
      items: [
        { label: 'Apports', path: '/donations', icon: VolunteerActivism, roles: ['employee', 'manager', 'admin'] },
        { label: 'Collectes', path: '/collections', icon: LocalShipping, roles: ['employee', 'manager', 'admin'] },
        { label: 'Planning Collectes', path: '/collection-schedule', icon: Schedule, roles: ['employee', 'manager', 'admin'] },
        { label: 'Bordereaux', path: '/collection-receipts', icon: Receipt, roles: ['employee', 'manager', 'admin'] },
      ]
    },
    {
      title: 'Gestion',
      items: [
        { label: 'Recycleries', path: '/recycleries', icon: Store, roles: ['manager', 'admin'] },
        { label: 'Magasins', path: '/stores', icon: Store, roles: ['manager', 'admin'] },
        { label: 'Employés', path: '/employee-management', icon: People, roles: ['manager', 'admin'] },
        { label: 'Tâches', path: '/task-management', icon: Assignment, roles: ['manager', 'admin'] },
        { label: 'Planning', path: '/planning', icon: CalendarToday, roles: ['manager', 'admin'] },
        { label: 'Utilisateurs', path: '/users', icon: People, roles: ['admin'] },
        { label: 'Administration', path: '/admin', icon: AdminPanelSettings, roles: ['admin'] },
        { label: 'Rapports', path: '/reports', icon: Assessment, roles: ['manager', 'admin'] },
        { label: 'Paramètres', path: '/settings', icon: Settings, roles: ['manager', 'admin'] },
      ]
    }
  ];

  const handleItemClick = (path) => {
    navigate(path);
    if (open && window.innerWidth < 960) {
      onClose();
    }
  };

  const isItemActive = (path) => location.pathname === path;

  const canAccessItem = (roles) => roles.includes(user?.role);

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile.
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          boxSizing: 'border-box',
          width: drawerWidth,
        },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Store color="primary" />
          <Typography variant="h6" color="primary" fontWeight="bold">
            Recyclerie
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      {/* Informations utilisateur */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          {user?.username}
        </Typography>
        <Chip 
          label={user?.role === 'admin' ? 'Administrateur' : 
                user?.role === 'manager' ? 'Gestionnaire' : 'Employé'}
          size="small"
          color={user?.role === 'admin' ? 'error' : 
                 user?.role === 'manager' ? 'warning' : 'default'}
          variant="outlined"
        />
      </Box>
      <Divider />
      {/* Menu de navigation */}
      {menuSections.map((section) => (
        <Box key={section.title}>
          <Typography
            variant="overline"
            sx={{
              px: 2,
              pt: 2,
              pb: 1,
              display: 'block',
              color: 'text.secondary',
              fontWeight: 'bold'
            }}
          >
            {section.title}
          </Typography>
          
          <List dense>
            {section.items
              .filter(item => canAccessItem(item.roles))
              .map((item) => {
                const Icon = item.icon;
                const active = isItemActive(item.path);
                
                return (
                  <ListItem key={item.path} disablePadding>
                    <ListItemButton
                      onClick={() => handleItemClick(item.path)}
                      selected={active}
                      sx={{
                        mx: 1,
                        borderRadius: 1,
                        '&.Mui-selected': {
                          backgroundColor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            backgroundColor: 'primary.dark',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'inherit',
                          },
                        },
                      }}
                    >
                      <ListItemIcon>
                        <Icon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.label}
                        slotProps={{
                          primary: {
                            fontSize: '0.9rem',
                            fontWeight: active ? 'medium' : 'normal'
                          }
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
          </List>
        </Box>
      ))}
    </Drawer>
  );
};

export default Sidebar;