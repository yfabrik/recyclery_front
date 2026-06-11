import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar
} from '@mui/material';
import {
  CameraAlt,
  OpenInNew,
  Search,
  CloudUpload,
  Translate,
  Calculate,
  QrCode,
  Schedule,
  Assessment,
  Help,
  Info,
  CheckCircle,
  Launch,
  PhotoCamera,
  Visibility,
  ShoppingCart,
  PriceCheck,
  Category,
  Language,
  School,
  Build,
  Handyman,
  Lightbulb,
  RocketLaunch,
} from '@mui/icons-material';

const EmployeeTools = () => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [showToolDialog, setShowToolDialog] = useState(false);

  const handleToolClick = (tool) => {
    setSelectedTool(tool);
    setShowToolDialog(true);
  };

  const handleCloseDialog = () => {
    setShowToolDialog(false);
    setSelectedTool(null);
  };

  const handleOpenTool = (url) => {
    window.open(url, '_blank');
    handleCloseDialog();
  };

  const tools = [
    {
      id: 'google-lens',
      title: 'Google Lens',
      description: 'Reconnaissance d\'objets et recherche visuelle',
      icon: <CameraAlt />,
      color: '#4285f4',
      category: 'Reconnaissance',
      features: [
        'Reconnaissance d\'objets en temps réel',
        'Recherche de prix et comparaisons',
        'Traduction de textes',
        'Identification de lieux et monuments'
      ],
      url: 'https://lens.google.com/',
      instructions: [
        'Cliquez sur "Ouvrir Google Lens"',
        'Autorisez l\'accès à la caméra',
        'Pointez vers un objet ou du texte',
        'Obtenez des informations instantanées'
      ]
    },
    {
      id: 'azure-vision',
      title: 'Azure Vision Studio',
      description: 'Analyse d\'images avancée par Microsoft',
      icon: <CloudUpload />,
      color: '#0078d4',
      category: 'Reconnaissance',
      features: [
        'Analyse d\'images haute qualité',
        'Détection de texte (OCR)',
        'Analyse de contenu',
        'Détection de visages'
      ],
      url: 'https://vision.microsoft.com/',
      instructions: [
        'Ouvrez Azure Vision Studio',
        'Téléchargez ou prenez une photo',
        'L\'IA analyse automatiquement',
        'Consultez les résultats détaillés'
      ]
    },
    {
      id: 'google-translate',
      title: 'Google Traduction',
      description: 'Traduction de textes et conversations',
      icon: <Translate />,
      color: '#34a853',
      category: 'Communication',
      features: [
        'Traduction de 100+ langues',
        'Traduction par caméra',
        'Conversation en temps réel',
        'Traduction de documents'
      ],
      url: 'https://translate.google.com/',
      instructions: [
        'Sélectionnez les langues source et cible',
        'Tapez ou parlez votre texte',
        'Ou utilisez la caméra pour traduire',
        'Copiez le résultat traduit'
      ]
    },
    {
      id: 'calculator',
      title: 'Calculatrice Google',
      description: 'Calculs rapides et conversions',
      icon: <Calculate />,
      color: '#ea4335',
      category: 'Utilitaires',
      features: [
        'Calculs mathématiques',
        'Conversions d\'unités',
        'Calculs de pourcentages',
        'Historique des calculs'
      ],
      url: 'https://www.google.com/search?q=calculator',
      instructions: [
        'Tapez votre calcul dans la barre de recherche',
        'Ou utilisez l\'interface de calculatrice',
        'Obtenez le résultat instantanément',
        'Utilisez les fonctions avancées si besoin'
      ]
    },
    {
      id: 'qr-scanner',
      title: 'Lecteur QR Code',
      description: 'Scanner de codes QR et barres',
      icon: <QrCode />,
      color: '#9c27b0',
      category: 'Utilitaires',
      features: [
        'Scan de codes QR',
        'Lecture de codes-barres',
        'Historique des scans',
        'Partage de codes'
      ],
      url: 'https://www.qr-code-generator.com/qr-code-reader/',
      instructions: [
        'Ouvrez le lecteur QR Code',
        'Autorisez l\'accès à la caméra',
        'Pointez vers le code QR',
        'Consultez le contenu décodé'
      ]
    },
    {
      id: 'google-search',
      title: 'Recherche Google',
      description: 'Recherche d\'informations rapide',
      icon: <Search />,
      color: '#ff9800',
      category: 'Recherche',
      features: [
        'Recherche web complète',
        'Recherche d\'images',
        'Actualités',
        'Recherche locale'
      ],
      url: 'https://www.google.com/',
      instructions: [
        'Tapez votre recherche',
        'Utilisez des mots-clés précis',
        'Filtrez par type de contenu',
        'Consultez les résultats pertinents'
      ]
    }
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Handyman />
          Outils Salariés
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Accès rapide aux outils et services utiles pour votre travail quotidien.
          Ces outils vous aideront dans vos tâches de reconnaissance, traduction, calculs et recherches.
        </Typography>
      </Box>
      <Alert severity="info" sx={{ mb: 4 }}>
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
          <Lightbulb sx={{ fontSize: 20, mt: 0.25, flexShrink: 0 }} />
          <span><strong>Astuce :</strong> Tous ces outils s'ouvrent dans un nouvel onglet pour ne pas interrompre votre travail.
          Vous pouvez les utiliser simultanément avec l'application de recyclerie.</span>
        </Typography>
      </Alert>
      {categories.map((category) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            mb: 3
          }}>
            <Category />
            {category}
          </Typography>
          
          <Grid container spacing={3}>
            {tools
              .filter(tool => tool.category === category)
              .map((tool) => (
                <Grid size={{ xs: 12,sm:6,md:4}} key={tool.id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.2s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2 
                      }}>
                        <Avatar sx={{ 
                          bgcolor: tool.color, 
                          mr: 2,
                          width: 48,
                          height: 48
                        }}>
                          {tool.icon}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" component="h3">
                            {tool.title}
                          </Typography>
                          <Chip 
                            label={tool.category} 
                            size="small" 
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                          />
                        </Box>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {tool.description}
                      </Typography>
                      
                      <List dense>
                        {tool.features.slice(0, 3).map((feature, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <CheckCircle fontSize="small" color="success" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={feature}
                              slotProps={{
                                primary: { variant: 'caption' }
                              }}
                            />
                          </ListItem>
                        ))}
                        {tool.features.length > 3 && (
                          <ListItem sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              <Info fontSize="small" color="info" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={`+${tool.features.length - 3} autres fonctionnalités`}
                              slotProps={{
                                primary: { variant: 'caption' }
                              }}
                            />
                          </ListItem>
                        )}
                      </List>
                    </CardContent>
                    
                    <Divider />
                    
                    <CardActions sx={{ p: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Launch />}
                        onClick={() => handleOpenTool(tool.url)}
                        sx={{ 
                          flexGrow: 1,
                          bgcolor: tool.color,
                          '&:hover': {
                            bgcolor: tool.color,
                            filter: 'brightness(0.9)'
                          }
                        }}
                      >
                        Ouvrir
                      </Button>
                      <Tooltip title="Voir les instructions">
                        <IconButton 
                          onClick={() => handleToolClick(tool)}
                          color="primary"
                        >
                          <Help />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        </Box>
      ))}
      {/* Dialog pour les instructions */}
      <Dialog 
        open={showToolDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {selectedTool && (
              <>
                <Avatar sx={{ bgcolor: selectedTool.color }}>
                  {selectedTool.icon}
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedTool.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedTool.description}
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedTool && (
            <Box>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RocketLaunch fontSize="small" />
                Comment utiliser {selectedTool.title}
              </Typography>
              
              <List>
                {selectedTool.instructions.map((instruction, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <Avatar sx={{ 
                        bgcolor: selectedTool.color, 
                        width: 24, 
                        height: 24,
                        fontSize: '0.8rem'
                      }}>
                        {index + 1}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText primary={instruction} />
                  </ListItem>
                ))}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="h6" gutterBottom>
                ✨ Fonctionnalités principales
              </Typography>
              
              <Grid container spacing={2}>
                {selectedTool.features.map((feature, index) => (
                  <Grid size={{ xs: 12,sm:6}} key={index}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      p: 1,
                      bgcolor: 'grey.50',
                      borderRadius: 1
                    }}>
                      <CheckCircle fontSize="small" color="success" />
                      <Typography variant="body2">{feature}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            Fermer
          </Button>
          {selectedTool && (
            <Button
              variant="contained"
              startIcon={<Launch />}
              onClick={() => handleOpenTool(selectedTool.url)}
              sx={{ bgcolor: selectedTool.color }}
            >
              Ouvrir {selectedTool.title}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EmployeeTools;
