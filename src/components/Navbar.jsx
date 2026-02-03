import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle,
  Notifications,
  Store,
  Dashboard,
  Inventory,
  LocalShipping,
  VolunteerActivism,
  PointOfSale,
  DeleteSweep,
  Settings,
  ExitToApp,
  AdminPanelSettings,
  Schedule,
  Receipt,
  Category,
  QrCode,
  Build,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const Navbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isManager, hasModuleAccess } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };


  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    navigate('/login');
  };

  const mainMenuItems = [
    { label: 'Tableau de bord', path: '/dashboard', icon: Dashboard, permission: 'dashboard.read' },
    { label: 'Arrivages', path: '/arrivals', icon: Inventory, permission: 'arrivals.read' },
    { label: 'Étiquetage', path: '/labels', icon: QrCode, permission: 'inventory.read' },
    { label: 'Logiciel de caisse', path: '/pos', icon: PointOfSale, permission: 'sales.read' },
    { label: 'Gestion des déchets', path: '/waste-management', icon: DeleteSweep, permission: 'admin.read' },
    { label: 'Outils Salariés', path: '/employee-tools', icon: Build, permission: 'inventory.read' },
  ];

  const otherMenuItems = [
    { label: 'Ventes', path: '/sales', icon: PointOfSale, permission: 'reports.sales' },
    { label: 'Recycleries', path: '/recycleries', icon: Store, permission: 'admin.stores' },
    { label: 'Paramètres', path: '/settings', icon: Settings, permission: 'admin.users' },
  ];

  const filteredMainMenuItems = mainMenuItems.filter(item => {
    if (!item.permission) return true;
    const [module, action] = item.permission.split('.');
    return hasModuleAccess(module, action);
  });


  if (!isAuthenticated) {
    return null;
  }
//TODO ADD DRAWER FOR RESPONSIVE 
  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        // background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 50%, #0d47a1 100%)',
        boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)',
      }}
    >
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onMenuToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography
          variant="h6"
          component="div"
          sx={{ 
            flexGrow: 1,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <Store />
          Recyclerie Management
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Navigation rapide */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            {/* Éléments principaux */}
            {filteredMainMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Tooltip key={item.path} title={item.label}>
                  <Button
                    color="inherit"
                    onClick={() => navigate(item.path)}
                    startIcon={<Icon />}
                    sx={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                      borderRadius: '8px',
                      fontWeight: isActive ? 'bold' : 'normal',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.25)',
                        transform: 'translateY(-1px)',
                        boxShadow: '0 2px 8px rgba(255,255,255,0.2)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {item.label}
                  </Button>
                </Tooltip>
              );
            })}
            
            {/* Administration - Lien direct */}
            <Tooltip title="Administration">
              <Button
                color="inherit"
                onClick={() => navigate('/admin')}
                startIcon={<AdminPanelSettings />}
                sx={{
                  backgroundColor: location.pathname === '/admin' 
                    ? 'rgba(255,255,255,0.15)' 
                    : 'transparent',
                  borderRadius: '8px',
                  fontWeight: location.pathname === '/admin' ? 'bold' : 'normal',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 2px 8px rgba(255,255,255,0.2)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Administration
              </Button>
            </Tooltip>
          </Box>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease-in-out',
                borderRadius: '8px',
              }}
            >
              <Badge badgeContent={42} color="error">
                <Notifications />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Menu utilisateur */}
          <Tooltip title="Profil utilisateur">
            <IconButton
              size="large"
              edge="end"
              aria-label="compte utilisateur"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleUserMenuOpen}
              color="inherit"
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
                borderRadius: '50%',
              }}
            >
              <Avatar sx={{ 
                width: 32, 
                height: 32, 
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 'bold',
                border: '2px solid rgba(255,255,255,0.3)',
              }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
          >
            <MenuItem disabled>
              <Box>
                <Typography variant="subtitle2">{user?.username}</Typography>
                <Typography variant="caption" color="textSecondary">
                  {user?.role === 'admin' ? 'Administrateur' : 
                   user?.role === 'manager' ? 'Gestionnaire' : 'Employé'}
                </Typography>
              </Box>
            </MenuItem>
            
            <MenuItem onClick={() => { navigate('/profile'); handleUserMenuClose(); }}>
              <AccountCircle sx={{ mr: 1 }} />
              Mon profil
            </MenuItem>
            
            <MenuItem onClick={() => { navigate('/settings'); handleUserMenuClose(); }}>
              <Settings sx={{ mr: 1 }} />
              Paramètres
            </MenuItem>
            
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Déconnexion
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

