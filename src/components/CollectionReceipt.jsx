import {
  Add,
  CalendarToday,
  Close,
  Delete,
  DirectionsCar,
  Download,
  LocationOn,
  Person,
  Receipt,
  Save,
  Scale
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import axios from 'axios';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { createCollectionReceipt, getCollectionReceipt } from '../services/api/collectionSchedules';

const CollectionReceipt = ({ open, onClose, schedule, onSaved }) => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    quantity: 1,
    weight: '',
    condition: 'bon',
    notes: ''
  });
  const [receiptData, setReceiptData] = useState({
    total_weight: '',
    notes: '',
    signature_data: '',
    collector_signature: '',
    donor_signature: ''
  });
  const receiptRef = useRef(null);

  useEffect(() => {
    if (open && schedule) {
      fetchReceipt();
    }
  }, [open, schedule]);

  const fetchReceipt = async () => {
    if (!schedule) return;
    
    setLoading(true);
    try {
     const response =  await getCollectionReceipt(schedule.id)
      // const token = localStorage.getItem('token');
      // const response = await axios.get(`/api/collection-schedules/${schedule.id}/receipt`, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      
      if (response.data.success) {
        setReceipt(response.data.receipt);
        setItems(response.data.receipt.items_collected || []);
        setReceiptData({
          total_weight: response.data.receipt.total_weight || '',
          notes: response.data.receipt.notes || '',
          signature_data: response.data.receipt.signature_data || '',
          collector_signature: response.data.receipt.collector_signature || '',
          donor_signature: response.data.receipt.donor_signature || ''
        });
        setEditing(false);
      } else {
        // Pas de bordereau existant, mode création
        setReceipt(null);
        setItems([]);
        setReceiptData({
          total_weight: '',
          notes: '',
          signature_data: '',
          collector_signature: '',
          donor_signature: ''
        });
        setEditing(true);
      }
    } catch (error) {
      if (error.response?.status === 404) {
        // Pas de bordereau existant, mode création
        setReceipt(null);
        setEditing(true);
      } else {
        toast.error('Erreur lors du chargement du bordereau');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) {
      toast.error('Le nom de l\'article est requis');
      return;
    }

    setItems([...items, { ...newItem, id: Date.now() }]);
    setNewItem({
      name: '',
      category: '',
      quantity: 1,
      weight: '',
      condition: 'bon',
      notes: ''
    });
  };

  const handleRemoveItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const handleSaveReceipt = async () => {
    if (items.length === 0) {
      toast.error('Veuillez ajouter au moins un article');
      return;
    }

    setLoading(true);
    try {
      // const token = localStorage.getItem('token');
      const payload = {
        items_collected: items,
        total_weight: receiptData.total_weight,
        notes: receiptData.notes,
        signature_data: receiptData.signature_data,
        collector_signature: receiptData.collector_signature,
        donor_signature: receiptData.donor_signature
      };

      
      const response = await createCollectionReceipt(schedule.id,payload)
      // await axios.post(`/api/collection-schedules/${schedule.id}/receipt`, payload, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      if (response.data.success) {
        setReceipt(response.data.receipt);
        setEditing(false);
        toast.success('Bordereau sauvegardé avec succès');
        if (onSaved) onSaved();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `bordereau-collecte-${receipt?.receipt_number || schedule.id}.pdf`;
      pdf.save(fileName);
      toast.success('PDF généré avec succès');
    } catch (error) {
      toast.error('Erreur lors de la génération du PDF');
      console.error('Erreur PDF:', error);
    }
  };

  const calculateTotalWeight = () => {
    return items.reduce((total, item) => {
      const weight = parseFloat(item.weight) || 0;
      return total + weight;
    }, 0).toFixed(2);
  };

  if (!schedule) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="lg" 
      fullWidth
      slotProps={{
        paper: { sx: { minHeight: '80vh' } }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Receipt color="primary" />
            <Typography variant="h6">
              {receipt ? `Bordereau ${receipt.receipt_number}` : 'Nouveau Bordereau'}
            </Typography>
            {receipt && (
              <Chip 
                label={receipt.status === 'completed' ? 'Finalisé' : 'Brouillon'} 
                color={receipt.status === 'completed' ? 'success' : 'warning'}
                size="small"
              />
            )}
          </Box>
          <Box>
            {receipt && !editing && (
              <>
                <IconButton onClick={generatePDF} title="Télécharger PDF">
                  <Download />
                </IconButton>
                <IconButton onClick={() => setEditing(true)} title="Modifier">
                  <Save />
                </IconButton>
              </>
            )}
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box ref={receiptRef} sx={{ p: 2, backgroundColor: 'white' }}>
          {/* En-tête du bordereau */}
          <Paper sx={{ p: 3, mb: 3, backgroundColor: '#f8f9fa' }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6}}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  BORDEREAU DE COLLECTE
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Receipt fontSize="small" />
                  <Typography variant="body2">
                    N° {receipt?.receipt_number || 'À générer'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday fontSize="small" />
                  <Typography variant="body2">
                    {new Date(schedule.scheduled_date).toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} à {schedule.scheduled_time}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6}}>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" gutterBottom>
                    Recyclerie Éco-Solutions
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    123 Rue de l'Environnement<br />
                    75000 Paris<br />
                    Tél: 01 23 45 67 89
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Informations de collecte */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, md: 6}}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn color="primary" />
                  Point de Collecte
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {schedule.collection_point_name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {schedule.collection_point_address}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {schedule.collection_point_city}
                </Typography>
                {schedule.contact_person && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Contact: {schedule.contact_person}
                  </Typography>
                )}
                {schedule.contact_phone && (
                  <Typography variant="body2">
                    Tél: {schedule.contact_phone}
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6}}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person color="primary" />
                  Collecteur
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {schedule.employee_name || 'Non assigné'}
                </Typography>
                {schedule.vehicle && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    <DirectionsCar fontSize="small" />
                    <Typography variant="body2">
                      Véhicule: {schedule.vehicle}
                    </Typography>
                  </Box>
                )}
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  Durée prévue: {schedule.estimated_duration} minutes
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Liste des articles collectés */}
          <Paper sx={{ mb: 3 }}>
            <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
              <Typography variant="h6" gutterBottom>
                Articles Collectés
              </Typography>
            </Box>
            
            {editing && (
              <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid size={{ xs: 12,md:3}}>
                    <TextField
                      fullWidth
                      label="Article"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12,md:2}}>
                    <TextField
                      fullWidth
                      label="Catégorie"
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md:1}}>
                    <TextField
                      fullWidth
                      label="Qté"
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({...newItem, quantity: parseInt(e.target.value) || 1})}
                      size="small"
                      slotProps={{
                        htmlInput: { min: 1 }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 6, md:1}}>
                    <TextField
                      fullWidth
                      label="Poids (kg)"
                      type="number"
                      value={newItem.weight}
                      onChange={(e) => setNewItem({...newItem, weight: e.target.value})}
                      size="small"
                      slotProps={{
                        htmlInput: { min: 0, step: 0.1 }
                      }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12,md:2}}>
                    <FormControl fullWidth size="small">
                      <InputLabel>État</InputLabel>
                      <Select
                        value={newItem.condition}
                        onChange={(e) => setNewItem({...newItem, condition: e.target.value})}
                        label="État"
                      >
                        <MenuItem value="excellent">Excellent</MenuItem>
                        <MenuItem value="bon">Bon</MenuItem>
                        <MenuItem value="moyen">Moyen</MenuItem>
                        <MenuItem value="mauvais">Mauvais</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid size={{ xs: 12,md:2}}>
                    <TextField
                      fullWidth
                      label="Notes"
                      value={newItem.notes}
                      onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
                      size="small"
                    />
                  </Grid>
                  <Grid size={{ xs: 12,md:1}}>
                    <IconButton onClick={handleAddItem} color="primary">
                      <Add />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            )}

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Article</TableCell>
                    <TableCell>Catégorie</TableCell>
                    <TableCell align="center">Quantité</TableCell>
                    <TableCell align="center">Poids (kg)</TableCell>
                    <TableCell>État</TableCell>
                    <TableCell>Notes</TableCell>
                    {editing && <TableCell align="center">Actions</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={editing ? 7 : 6} align="center">
                        <Typography color="textSecondary">
                          {editing ? 'Ajoutez des articles collectés' : 'Aucun article collecté'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, index) => (
                      <TableRow key={item.id || index}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="center">{item.weight || '-'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={item.condition} 
                            size="small"
                            color={
                              item.condition === 'excellent' ? 'success' :
                              item.condition === 'bon' ? 'primary' :
                              item.condition === 'moyen' ? 'warning' : 'error'
                            }
                          />
                        </TableCell>
                        <TableCell>{item.notes || '-'}</TableCell>
                        {editing && (
                          <TableCell align="center">
                            <IconButton 
                              onClick={() => handleRemoveItem(item.id)}
                              color="error"
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Résumé et signatures */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6}}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Scale color="primary" />
                  Résumé
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography>Nombre d'articles:</Typography>
                  <Typography fontWeight="bold">{items.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography>Poids total calculé:</Typography>
                  <Typography fontWeight="bold">{calculateTotalWeight()} kg</Typography>
                </Box>
                {editing ? (
                  <TextField
                    fullWidth
                    label="Poids total déclaré (kg)"
                    type="number"
                    value={receiptData.total_weight}
                    onChange={(e) => setReceiptData({...receiptData, total_weight: e.target.value})}
                    size="small"
                    slotProps={{
                      htmlInput: { min: 0, step: 0.1 }
                    }}
                  />
                ) : (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography>Poids total déclaré:</Typography>
                    <Typography fontWeight="bold">
                      {receiptData.total_weight || calculateTotalWeight()} kg
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6}}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Notes et Observations
                </Typography>
                {editing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={receiptData.notes}
                    onChange={(e) => setReceiptData({...receiptData, notes: e.target.value})}
                    placeholder="Notes, observations, conditions particulières..."
                  />
                ) : (
                  <Typography variant="body2">
                    {receiptData.notes || 'Aucune note particulière'}
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* Signatures */}
          <Paper sx={{ p: 2, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Signatures
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6}}>
                <Box sx={{ textAlign: 'center', minHeight: 100, border: '1px dashed #ccc', p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Signature du Collecteur
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {schedule.employee_name || 'Non assigné'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Date: {new Date().toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6}}>
                <Box sx={{ textAlign: 'center', minHeight: 100, border: '1px dashed #ccc', p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Signature du Donateur
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {schedule.contact_person || 'Représentant'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    Date: {new Date().toLocaleDateString('fr-FR')}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} startIcon={<Close />}>
          Fermer
        </Button>
        {editing && (
          <Button 
            onClick={handleSaveReceipt}
            variant="contained"
            disabled={loading || items.length === 0}
            startIcon={<Save />}
          >
            {loading ? 'Sauvegarde...' : 'Sauvegarder'}
          </Button>
        )}
        {receipt && !editing && (
          <Button 
            onClick={generatePDF}
            variant="contained"
            startIcon={<Download />}
          >
            Télécharger PDF
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CollectionReceipt;
