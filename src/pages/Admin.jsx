import {
  AdminPanelSettings,
  Assessment,
  CardGiftcard,
  LocalShipping,
  People,
  Schedule,
  Settings,
} from "@mui/icons-material";
import {
  Box,
  Container,
  Divider,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import Planning from "./Planning";

import { ConfigurationTab } from "../components/admin/ConfigurationTab";
import { DonationsTab } from "../components/admin/DonationsTab";
import { LogisticsTab } from "../components/admin/LogisticsTab";
import { SalesAnalyticsTab } from "../components/admin/SalesAnalyticsTab";
import { UsersTab } from "../components/admin/UsersTab";
import { Link, Navigate, Route, Routes, useLocation } from "react-router";

// // Composant pour l'onglet de suivi des ventes
// const SalesAnalyticsTab = () => {
//   const [salesData, setSalesData] = useState([]);
//   const [stores, setStores] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filters, setFilters] = useState({
//     store_id: '',
//     period: 'month', // 'week', 'month', 'custom'
//     date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
//     date_to: new Date().toISOString().split('T')[0],
//     transaction_number: '' // Recherche par numéro de transaction
//   });
//   const [statistics, setStatistics] = useState({
//     total_transactions: 0,
//     total_sales: 0,
//     total_sales_before_refunds: 0,
//     total_refunded: 0,
//     average_transaction: 0,
//     sessions_count: 0,
//     payment_methods: []
//   });
//   const [postalCodeStats, setPostalCodeStats] = useState([]);

//   // États pour la pop-up de remboursement
//   const [refundDialog, setRefundDialog] = useState(false);
//   const [selectedTransaction, setSelectedTransaction] = useState(null);
//   const [refundForm, setRefundForm] = useState({
//     refund_type: 'full', // 'full' ou 'partial'
//     refund_amount: '',
//     refund_reason: '',
//     refund_method: 'cash', // 'cash', 'card', 'check'
//     notes: ''
//   });

//   // États pour la pop-up des détails de transaction
//   const [transactionDetailsDialog, setTransactionDetailsDialog] = useState(false);
//   const [transactionRefunds, setTransactionRefunds] = useState([]);
//   const [loadingRefunds, setLoadingRefunds] = useState(false);

//   // État pour stocker tous les remboursements des transactions
//   const [allTransactionRefunds, setAllTransactionRefunds] = useState({});

//   // États pour la pop-up des avoirs
//   const [creditNoteDialog, setCreditNoteDialog] = useState(false);
//   const [selectedTransactionForCredit, setSelectedTransactionForCredit] = useState(null);
//   const [creditNoteForm, setCreditNoteForm] = useState({
//     reason: '',
//     credit_amount: '',
//     notes: ''
//   });

//   useEffect(() => {
//     fetchStores();
//     fetchSalesData();
//   }, []);

//   useEffect(() => {
//     fetchSalesData();
//   }, [filters]);

//   const fetchStores = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/stores', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setStores(response.data.stores?.filter(store => store.is_active) || []);
//     } catch (error) {
//       console.error('Erreur lors du chargement des magasins:', error);
//       toast.error('Erreur lors du chargement des magasins');
//     }
//   };

//   const fetchSalesData = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');

//       // Préparer les paramètres pour l'API (sans transaction_number pour l'instant)
//       const apiParams = {
//         store_id: filters.store_id,
//         period: filters.period,
//         date_from: filters.date_from,
//         date_to: filters.date_to
//       };

//       // Récupérer les transactions
//       console.log(apiParams)
//       const transactionsResponse = await axios.get('/api/sales-transactions', {
//         headers: { Authorization: `Bearer ${token}` },
//         params: apiParams
//       });

//       // Récupérer les statistiques
//       const statsResponse = await axios.get('/api/sales-transactions/stats/summary', {
//         headers: { Authorization: `Bearer ${token}` },
//         params: apiParams
//       });

//       // Récupérer les statistiques par code postal
//       const postalResponse = await axios.get('/api/sales-transactions/stats/postal-codes', {
//         headers: { Authorization: `Bearer ${token}` },
//         params: apiParams
//       });

//       let transactions = transactionsResponse.data.transactions || [];

//       // Filtrage côté client par numéro de transaction si spécifié
//       if (filters.transaction_number) {
//         transactions = transactions.filter(transaction =>
//           transaction.transaction_number &&
//           transaction.transaction_number.toLowerCase().includes(filters.transaction_number.toLowerCase())
//         );
//       }

//       setSalesData(transactions);
//       setStatistics(statsResponse.data.stats || {});
//       setPostalCodeStats(postalResponse.data.postal_codes || []);

//       // Récupérer les remboursements pour toutes les transactions
//       await fetchAllTransactionRefunds(transactions, token);

//     } catch (error) {
//       console.error('Erreur lors du chargement des données de vente:', error);
//       toast.error('Erreur lors du chargement des données');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePeriodChange = (period) => {
//     const today = new Date();
//     let date_from, date_to;

//     switch (period) {
//       case 'week':
//         const startOfWeek = new Date(today);
//         startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Lundi
//         date_from = startOfWeek.toISOString().split('T')[0];
//         date_to = today.toISOString().split('T')[0];
//         break;
//       case 'month':
//         date_from = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
//         date_to = today.toISOString().split('T')[0];
//         break;
//       default:
//         // Garder les dates actuelles pour 'custom'
//         return setFilters(prev => ({ ...prev, period }));
//     }

//     setFilters(prev => ({
//       ...prev,
//       period,
//       date_from,
//       date_to
//     }));
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'EUR'
//     }).format(amount || 0);
//   };

//   const getPaymentMethodLabel = (method) => {
//     const labels = {
//       cash: 'Espèces',
//       card: 'Carte bancaire',
//       check: 'Chèque'
//     };
//     return labels[method] || method;
//   };

//   // Fonctions de gestion des actions
//   const handleCreditNote = (transaction) => {
//     setSelectedTransactionForCredit(transaction);
//     setCreditNoteForm({
//       reason: '',
//       credit_amount: transaction.total_amount.toString(),
//       notes: ''
//     });
//     setCreditNoteDialog(true);
//   };

//   const handleReprintReceipt = (transactionId) => {
//     // Fonction pour réimprimer le ticket de caisse
//     toast.success(`Réimpression du ticket de caisse ${transactionId} en cours...`);
//     // Ici on pourrait ajouter la logique d'impression réelle
//   };

//   const handleRefund = (transaction) => {
//     // Ouvrir la pop-up de remboursement avec les données de la transaction
//     setSelectedTransaction(transaction);
//     setRefundForm({
//       refund_type: 'full',
//       refund_amount: transaction.total_amount.toString(),
//       refund_reason: '',
//       refund_method: transaction.payment_method || 'cash',
//       notes: ''
//     });
//     setRefundDialog(true);
//   };

//   const handleRefundFormChange = (field, value) => {
//     setRefundForm(prev => ({
//       ...prev,
//       [field]: value
//     }));

//     // Si le type de remboursement change vers "total", remettre le montant total
//     if (field === 'refund_type' && value === 'full' && selectedTransaction) {
//       setRefundForm(prev => ({
//         ...prev,
//         refund_amount: selectedTransaction.total_amount.toString()
//       }));
//     }
//   };

//   const handleProcessRefund = async () => {
//     if (!refundForm.refund_reason) {
//       toast.error('Veuillez sélectionner une raison de remboursement');
//       return;
//     }

//     if (refundForm.refund_type === 'partial' && (!refundForm.refund_amount || parseFloat(refundForm.refund_amount) <= 0)) {
//       toast.error('Veuillez saisir un montant de remboursement valide');
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const refundData = {
//         transaction_id: selectedTransaction.id,
//         refund_type: refundForm.refund_type,
//         refund_amount: refundForm.refund_type === 'full' ? selectedTransaction.total_amount : parseFloat(refundForm.refund_amount),
//         refund_reason: refundForm.refund_reason,
//         refund_method: refundForm.refund_method,
//         notes: refundForm.notes
//       };

//       await axios.post(`${apiConfig.baseURL}/api/sales-transactions/refund`, refundData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       toast.success('Remboursement effectué avec succès');
//       setRefundDialog(false);
//       setSelectedTransaction(null);
//       fetchSalesData(); // Recharger les données
//     } catch (error) {
//       console.error('Erreur lors du remboursement:', error);
//       toast.error('Erreur lors du remboursement');
//     }
//   };

//   const handleCloseRefundDialog = () => {
//     setRefundDialog(false);
//     setSelectedTransaction(null);
//     setRefundForm({
//       refund_type: 'full',
//       refund_amount: '',
//       refund_reason: '',
//       refund_method: 'cash',
//       notes: ''
//     });
//   };

//   // Fonction pour ouvrir les détails d'une transaction
//   const handleViewTransactionDetails = async (transaction) => {
//     setSelectedTransaction(transaction);
//     setTransactionDetailsDialog(true);
//     await fetchTransactionRefunds(transaction.id);
//   };

//   // Fonction pour récupérer les remboursements d'une transaction
//   const fetchTransactionRefunds = async (transactionId) => {
//     try {
//       setLoadingRefunds(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${apiConfig.baseURL}/api/sales-transactions/${transactionId}/refunds`, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       if (response.data.success) {
//         setTransactionRefunds(response.data.refunds || []);
//       }
//     } catch (error) {
//       console.error('Erreur lors du chargement des remboursements:', error);
//       setTransactionRefunds([]);
//     } finally {
//       setLoadingRefunds(false);
//     }
//   };

//   // Fonction pour fermer les détails de transaction
//   const handleCloseTransactionDetailsDialog = () => {
//     setTransactionDetailsDialog(false);
//     setSelectedTransaction(null);
//     setTransactionRefunds([]);
//   };

//   // Fonctions pour la pop-up des avoirs
//   const handleCreditNoteFormChange = (field, value) => {
//     setCreditNoteForm(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleProcessCreditNote = async () => {
//     if (!creditNoteForm.reason || !creditNoteForm.credit_amount) {
//       toast.error('Veuillez remplir tous les champs obligatoires');
//       return;
//     }

//     if (parseFloat(creditNoteForm.credit_amount) <= 0) {
//       toast.error('Le montant de l\'avoir doit être positif');
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       const creditNoteData = {
//         transaction_id: selectedTransactionForCredit.id,
//         reason: creditNoteForm.reason,
//         credit_amount: parseFloat(creditNoteForm.credit_amount),
//         notes: creditNoteForm.notes
//       };

//       await axios.post(`${apiConfig.baseURL}/api/sales-transactions/credit-note`, creditNoteData, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       toast.success('Avoir créé avec succès');
//       setCreditNoteDialog(false);
//       setSelectedTransactionForCredit(null);
//       fetchSalesData(); // Recharger les données
//     } catch (error) {
//       console.error('Erreur lors de la création de l\'avoir:', error);
//       toast.error('Erreur lors de la création de l\'avoir');
//     }
//   };

//   const handleCloseCreditNoteDialog = () => {
//     setCreditNoteDialog(false);
//     setSelectedTransactionForCredit(null);
//     setCreditNoteForm({
//       reason: '',
//       credit_amount: '',
//       notes: ''
//     });
//   };

//   // Fonction pour récupérer tous les remboursements des transactions
//   const fetchAllTransactionRefunds = async (transactions, token) => {
//     try {
//       const refundsPromises = transactions.map(async (transaction) => {
//         try {
//           const response = await axios.get(`${apiConfig.baseURL}/api/sales-transactions/${transaction.id}/refunds`, {
//             headers: { Authorization: `Bearer ${token}` }
//           });
//           return {
//             transactionId: transaction.id,
//             refunds: response.data.success ? response.data.refunds : []
//           };
//         } catch (error) {
//           console.error(`Erreur récupération remboursements transaction ${transaction.id}:`, error);
//           return {
//             transactionId: transaction.id,
//             refunds: []
//           };
//         }
//       });

//       const refundsResults = await Promise.all(refundsPromises);
//       const refundsMap = {};
//       refundsResults.forEach(result => {
//         refundsMap[result.transactionId] = result.refunds;
//       });

//       setAllTransactionRefunds(refundsMap);
//     } catch (error) {
//       console.error('Erreur lors du chargement des remboursements:', error);
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//         <Typography variant="h5" fontWeight="bold">
//           📊 Suivi des Ventes
//         </Typography>
//         <Button
//           variant="contained"
//           startIcon={<Refresh />}
//           onClick={fetchSalesData}
//           disabled={loading}
//           sx={{ minWidth: 140 }}
//         >
//           {loading ? 'Chargement...' : 'Actualiser'}
//         </Button>
//       </Box>

//       {/* Filtres */}
//       <Paper sx={{ p: 3, mb: 3 }}>
//         <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <FilterList />
//           Filtres
//         </Typography>

//         <Grid container spacing={2} alignItems="center">
//           {/* Filtre par magasin */}
//           <Grid size={{ xs: 12,md:3}}>
//             <FormControl fullWidth>
//               <InputLabel>Magasin</InputLabel>
//               <Select
//                 value={filters.store_id}
//                 label="Magasin"
//                 onChange={(e) => setFilters(prev => ({...prev, store_id: e.target.value}))}
//               >
//                 <MenuItem key="all-stores" value="">Tous les magasins</MenuItem>
//                 {stores.map(store => (
//                   <MenuItem key={store.id} value={store.id}>
//                     {store.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>
//           </Grid>

//           {/* Filtre par période */}
//           <Grid size={{ xs: 12,md:3}}>
//             <FormControl fullWidth>
//               <InputLabel>Période</InputLabel>
//               <Select
//                 value={filters.period}
//                 label="Période"
//                 onChange={(e) => handlePeriodChange(e.target.value)}
//               >
//                 <MenuItem key="week" value="week">Cette semaine</MenuItem>
//                 <MenuItem key="month" value="month">Ce mois</MenuItem>
//                 <MenuItem key="custom" value="custom">Personnalisée</MenuItem>
//               </Select>
//             </FormControl>
//           </Grid>

//           {/* Dates personnalisées */}
//           {filters.period === 'custom' && (
//             <>
//               <Grid size={{ xs: 12,md:3}}>
//                 <TextField
//                   fullWidth
//                   label="Date de début"
//                   type="date"
//                   value={filters.date_from}
//                   onChange={(e) => setFilters(prev => ({...prev, date_from: e.target.value}))}
//                   slotProps={{ inputLabel: { shrink: true } }}
//                 />
//               </Grid>
//               <Grid size={{ xs: 12,md:3}}>
//                 <TextField
//                   fullWidth
//                   label="Date de fin"
//                   type="date"
//                   value={filters.date_to}
//                   onChange={(e) => setFilters(prev => ({...prev, date_to: e.target.value}))}
//                   slotProps={{ inputLabel: { shrink: true } }}
//                 />
//               </Grid>
//             </>
//           )}

//           {/* Recherche par numéro de transaction */}
//           <Grid size={{ xs: 12,md:3}}>
//             <TextField
//               fullWidth
//               label="N° de transaction"
//               value={filters.transaction_number}
//               onChange={(e) => setFilters(prev => ({...prev, transaction_number: e.target.value}))}
//               placeholder="Ex: 20231215-001"
//               variant="outlined"
//               size="small"
//               InputProps={{
//                 endAdornment: filters.transaction_number && (
//                   <IconButton
//                     size="small"
//                     onClick={() => setFilters(prev => ({...prev, transaction_number: ''}))}
//                     edge="end"
//                   >
//                     <Clear />
//                   </IconButton>
//                 )
//               }}
//             />
//           </Grid>

//           {/* Bouton pour effacer tous les filtres */}
//           <Grid size={{ xs: 12}}>
//             <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
//               <Button
//                 variant="outlined"
//                 startIcon={<Clear />}
//                 onClick={() => setFilters({
//                   store_id: '',
//                   period: 'month',
//                   date_from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
//                   date_to: new Date().toISOString().split('T')[0],
//                   transaction_number: ''
//                 })}
//                 size="small"
//               >
//                 Effacer tous les filtres
//               </Button>
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* Statistiques principales */}
//       <Grid container spacing={3} sx={{ mb: 3 }}>
//         <Grid size={{ xs: 12,sm:6,md:3}}>
//           <Card>
//             <CardContent sx={{ textAlign: 'center' }}>
//               <Typography variant="h4" color="primary" fontWeight="bold">
//                 {statistics.total_transactions || 0}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Transactions totales
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid size={{ xs: 12,sm:6,md:3}}>
//           <Card>
//             <CardContent sx={{ textAlign: 'center' }}>
//               <Typography variant="h4" color="success.main" fontWeight="bold">
//                 {formatCurrency(statistics.total_sales)}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Chiffre d'affaires net
//               </Typography>
//               {statistics.total_refunded > 0 && (
//                 <Box sx={{ mt: 1 }}>
//                   <Typography variant="caption" color="textSecondary" display="block">
//                     Brut: {formatCurrency(statistics.total_sales_before_refunds || statistics.total_sales)}
//                   </Typography>
//                   <Typography variant="caption" color="error" display="block">
//                     Remboursé: -{formatCurrency(statistics.total_refunded)}
//                   </Typography>
//                 </Box>
//               )}
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid size={{ xs: 12,sm:6,md:3}}>
//           <Card>
//             <CardContent sx={{ textAlign: 'center' }}>
//               <Typography variant="h4" color="info.main" fontWeight="bold">
//                 {formatCurrency(statistics.average_transaction)}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Panier moyen
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid size={{ xs: 12,sm:6,md:3}}>
//           <Card>
//             <CardContent sx={{ textAlign: 'center' }}>
//               <Typography variant="h4" color="warning.main" fontWeight="bold">
//                 {statistics.sessions_count || 0}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Sessions de caisse
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Répartition par mode de paiement et codes postaux */}
//       <Grid container spacing={3} sx={{ mb: 3 }}>
//         {/* Répartition par mode de paiement */}
//         {statistics.payment_methods && statistics.payment_methods.length > 0 && (
//           <Grid size={{ xs: 12, md: 6}}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   💳 Répartition par mode de paiement
//                 </Typography>
//                 {statistics.payment_methods.map((method, index) => (
//                   <Box key={index} sx={{ mb: 2 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
//                       <Typography variant="body2">
//                         {getPaymentMethodLabel(method.payment_method)}
//                       </Typography>
//                       <Typography variant="body2" fontWeight="bold">
//                         {method.count} ({((method.count / statistics.total_transactions) * 100).toFixed(1)}%)
//                       </Typography>
//                     </Box>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Montant total
//                       </Typography>
//                       <Typography variant="body2" color="success.main" fontWeight="bold">
//                         {formatCurrency(method.total)}
//                       </Typography>
//                     </Box>
//                     <Divider sx={{ mt: 1 }} />
//                   </Box>
//                 ))}
//               </CardContent>
//             </Card>
//           </Grid>
//         )}

//         {/* Statistiques par code postal */}
//         {postalCodeStats.length > 0 && (
//           <Grid size={{ xs: 12, md: 6}}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   📍 Top des codes postaux
//                 </Typography>
//                 <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
//                   Les 10 codes postaux générant le plus de chiffre d'affaires
//                 </Typography>
//                 {postalCodeStats.slice(0, 10).map((postal, index) => (
//                   <Box key={index} sx={{ mb: 2 }}>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
//                       <Typography variant="body2" fontWeight="bold">
//                         📮 {postal.customer_postal_code}
//                       </Typography>
//                       <Typography variant="body2" color="success.main" fontWeight="bold">
//                         {formatCurrency(postal.total_sales)}
//                       </Typography>
//                     </Box>
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
//                       <Typography variant="body2" color="textSecondary">
//                         {postal.transaction_count} transaction{postal.transaction_count > 1 ? 's' : ''}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary">
//                         Panier moyen: {formatCurrency(postal.average_transaction)}
//                       </Typography>
//                     </Box>
//                     {index < postalCodeStats.slice(0, 10).length - 1 && <Divider sx={{ mt: 1 }} />}
//                   </Box>
//                 ))}
//               </CardContent>
//             </Card>
//           </Grid>
//         )}
//       </Grid>

//       {/* Liste des transactions */}
//       <Card>
//         <CardContent>
//           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//             <Typography variant="h6">
//               📋 Détail des transactions
//             </Typography>
//             {filters.transaction_number && (
//               <Chip
//                 label={`Filtré par: ${filters.transaction_number} (${salesData.length} résultat${salesData.length > 1 ? 's' : ''})`}
//                 color="primary"
//                 variant="outlined"
//                 onDelete={() => setFilters(prev => ({...prev, transaction_number: ''}))}
//                 deleteIcon={<Clear />}
//               />
//             )}
//           </Box>

//           {salesData.length === 0 ? (
//             <Alert severity="info">
//               Aucune transaction trouvée pour la période sélectionnée.
//             </Alert>
//           ) : (
//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>N° Transaction</TableCell>
//                     <TableCell>Date</TableCell>
//                     <TableCell>Magasin</TableCell>
//                     <TableCell>Caissier</TableCell>
//                     <TableCell>Mode de paiement</TableCell>
//                     <TableCell align="right">Montant</TableCell>
//                     <TableCell>Remboursements</TableCell>
//                     <TableCell>Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {salesData.map((transaction) => (
//                     <TableRow key={transaction.id}>
//                       <TableCell>
//                         <Typography variant="body2" fontWeight="bold">
//                           {transaction.transaction_number}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         {new Date(transaction.created_at).toLocaleDateString('fr-FR', {
//                           day: '2-digit',
//                           month: '2-digit',
//                           year: 'numeric',
//                           hour: '2-digit',
//                           minute: '2-digit'
//                         })}
//                       </TableCell>
//                       <TableCell>
//                         {transaction.store_name || 'N/A'}
//                       </TableCell>
//                       <TableCell>
//                         {transaction.cashier_name || 'N/A'}
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={getPaymentMethodLabel(transaction.payment_method)}
//                           size="small"
//                           color={transaction.payment_method === 'cash' ? 'success' : 'primary'}
//                         />
//                       </TableCell>
//                       <TableCell align="right">
//                         <Typography variant="body2" fontWeight="bold" color="success.main">
//                           {formatCurrency(transaction.total_amount)}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         {(() => {
//                           const refunds = allTransactionRefunds[transaction.id] || [];
//                           if (refunds.length === 0) {
//                             return (
//                               <Typography variant="body2" color="textSecondary">
//                                 Aucun
//                               </Typography>
//                             );
//                           }

//                           const totalRefunded = refunds.reduce((sum, refund) => sum + parseFloat(refund.refund_amount), 0);
//                           const isFullRefund = refunds.some(refund => refund.refund_type === 'full');
//                           const hasCreditNote = refunds.some(refund => refund.refund_type === 'credit_note');

//                           return (
//                             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
//                               <Typography variant="body2" color="error" fontWeight="bold">
//                                 -{formatCurrency(totalRefunded)}
//                               </Typography>
//                               <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
//                                 {refunds.map((refund, index) => (
//                                   <Chip
//                                     key={refund.id}
//                                     label={
//                                       refund.refund_type === 'full' ? 'Total' :
//                                       refund.refund_type === 'partial' ? 'Partiel' :
//                                       refund.refund_type === 'credit_note' ? 'Avoir' : refund.refund_type
//                                     }
//                                     size="small"
//                                     color={
//                                       refund.refund_type === 'full' ? 'error' :
//                                       refund.refund_type === 'partial' ? 'warning' :
//                                       refund.refund_type === 'credit_note' ? 'info' : 'default'
//                                     }
//                                     variant="outlined"
//                                   />
//                                 ))}
//                               </Box>
//                               {isFullRefund && (
//                                 <Chip
//                                   label="Remboursé"
//                                   size="small"
//                                   color="error"
//                                   variant="filled"
//                                 />
//                               )}
//                               {hasCreditNote && (
//                                 <Chip
//                                   label="Avoir"
//                                   size="small"
//                                   color="info"
//                                   variant="filled"
//                                 />
//                               )}
//                             </Box>
//                           );
//                         })()}
//                       </TableCell>
//                       <TableCell>
//                         <Box sx={{ display: 'flex', gap: 1 }}>
//                           <Tooltip title="Voir les détails">
//                             <IconButton
//                               size="small"
//                               color="primary"
//                               onClick={() => handleViewTransactionDetails(transaction)}
//                             >
//                               <Visibility />
//                             </IconButton>
//                           </Tooltip>

//                           <Tooltip title="Créer un avoir">
//                             <IconButton
//                               size="small"
//                               color="warning"
//                               onClick={() => handleCreditNote(transaction)}
//                             >
//                               <Receipt />
//                             </IconButton>
//                           </Tooltip>

//                           <Tooltip title="Réimprimer le ticket">
//                             <IconButton
//                               size="small"
//                               color="info"
//                               onClick={() => handleReprintReceipt(transaction.transaction_number)}
//                             >
//                               <Print />
//                             </IconButton>
//                           </Tooltip>

//                           <Tooltip title="Remboursement">
//                             <IconButton
//                               size="small"
//                               color="error"
//                               onClick={() => handleRefund(transaction)}
//                             >
//                               <Undo />
//                             </IconButton>
//                           </Tooltip>
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </CardContent>
//       </Card>

//       {/* Pop-up de remboursement */}
//       <Dialog open={refundDialog} onClose={handleCloseRefundDialog} maxWidth="md" fullWidth>
//         <DialogTitle>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <Undo color="error" />
//             <Typography variant="h6">
//               Remboursement - Transaction #{selectedTransaction?.transaction_number}
//             </Typography>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           {selectedTransaction && (
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               {/* Informations de la transaction */}
//               <Grid size={{ xs: 12}}>
//                 <Card variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Informations de la transaction
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid size={{ xs:6}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Montant total: <strong>{formatCurrency(selectedTransaction.total_amount)}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs:6}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Mode de paiement: <strong>{getPaymentMethodLabel(selectedTransaction.payment_method)}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs:6}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Date: <strong>{new Date(selectedTransaction.created_at).toLocaleDateString('fr-FR')}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs:6}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Caissier: <strong>{selectedTransaction.cashier_name || 'N/A'}</strong>
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </Card>
//               </Grid>

//               {/* Type de remboursement */}
//               <Grid size={{ xs: 12}}>
//                 <FormControl fullWidth>
//                   <InputLabel>Type de remboursement</InputLabel>
//                   <Select
//                     value={refundForm.refund_type}
//                     label="Type de remboursement"
//                     onChange={(e) => handleRefundFormChange('refund_type', e.target.value)}
//                   >
//                     <MenuItem value="full">Remboursement total</MenuItem>
//                     <MenuItem value="partial">Remboursement partiel</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>

//               {/* Montant du remboursement */}
//               {refundForm.refund_type === 'partial' && (
//                 <Grid size={{ xs: 12}}>
//                   <TextField
//                     fullWidth
//                     type="number"
//                     label="Montant du remboursement (€)"
//                     value={refundForm.refund_amount}
//                     onChange={(e) => handleRefundFormChange('refund_amount', e.target.value)}
//                     inputProps={{
//                       min: 0.01,
//                       max: selectedTransaction.total_amount,
//                       step: 0.01
//                     }}
//                     helperText={`Maximum: ${formatCurrency(selectedTransaction.total_amount)}`}
//                   />
//                 </Grid>
//               )}

//               {/* Raison du remboursement */}
//               <Grid size={{ xs: 12}}>
//                 <FormControl fullWidth>
//                   <InputLabel>Raison du remboursement</InputLabel>
//                   <Select
//                     value={refundForm.refund_reason}
//                     label="Raison du remboursement"
//                     onChange={(e) => handleRefundFormChange('refund_reason', e.target.value)}
//                   >
//                     <MenuItem value="customer_request">Demande client</MenuItem>
//                     <MenuItem value="product_defect">Produit défectueux</MenuItem>
//                     <MenuItem value="wrong_product">Mauvais produit</MenuItem>
//                     <MenuItem value="overcharge">Surcharge</MenuItem>
//                     <MenuItem value="return_policy">Politique de retour</MenuItem>
//                     <MenuItem value="other">Autre</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>

//               {/* Mode de remboursement */}
//               <Grid size={{ xs: 12, md: 6}}>
//                 <FormControl fullWidth>
//                   <InputLabel>Mode de remboursement</InputLabel>
//                   <Select
//                     value={refundForm.refund_method}
//                     label="Mode de remboursement"
//                     onChange={(e) => handleRefundFormChange('refund_method', e.target.value)}
//                   >
//                     <MenuItem value="cash">Espèces</MenuItem>
//                     <MenuItem value="card">Carte bancaire</MenuItem>
//                     <MenuItem value="check">Chèque</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>

//               {/* Notes */}
//               <Grid size={{ xs: 12}}>
//                 <TextField
//                   fullWidth
//                   multiline
//                   rows={3}
//                   label="Notes (optionnel)"
//                   value={refundForm.notes}
//                   onChange={(e) => handleRefundFormChange('notes', e.target.value)}
//                   placeholder="Informations supplémentaires..."
//                 />
//               </Grid>

//               {/* Résumé du remboursement */}
//               <Grid size={{ xs: 12}}>
//                 <Card variant="outlined" sx={{ p: 2, bgcolor: '#e3f2fd' }}>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Résumé du remboursement
//                   </Typography>
//                   <Typography variant="body2">
//                     Montant à rembourser: <strong>{formatCurrency(refundForm.refund_type === 'full' ? selectedTransaction.total_amount : parseFloat(refundForm.refund_amount || 0))}</strong>
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     Mode de remboursement: <strong>{getPaymentMethodLabel(refundForm.refund_method)}</strong>
//                   </Typography>
//                 </Card>
//               </Grid>
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseRefundDialog}>
//             Annuler
//           </Button>
//           <Button
//             onClick={handleProcessRefund}
//             variant="contained"
//             color="error"
//             startIcon={<Undo />}
//           >
//             Procéder au remboursement
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Dialog des détails de transaction */}
//       <Dialog open={transactionDetailsDialog} onClose={handleCloseTransactionDetailsDialog} maxWidth="lg" fullWidth>
//         <DialogTitle>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <Visibility color="primary" />
//             <Typography variant="h6">
//               Détails de la Transaction #{selectedTransaction?.transaction_number}
//             </Typography>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           {selectedTransaction && (
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               {/* Informations de la transaction */}
//               <Grid size={{ xs: 12}}>
//                 <Card variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
//                   <Typography variant="subtitle1" gutterBottom fontWeight="bold">
//                     📋 Informations de la transaction
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid size={{ xs: 6, md: 3}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Numéro: <strong>#{selectedTransaction.transaction_number}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6, md: 3}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Montant: <strong>{formatCurrency(selectedTransaction.total_amount)}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6, md: 3}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Mode de paiement: <strong>{getPaymentMethodLabel(selectedTransaction.payment_method)}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6, md: 3}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Date: <strong>{new Date(selectedTransaction.created_at).toLocaleDateString('fr-FR')}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6, md: 3}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Heure: <strong>{new Date(selectedTransaction.created_at).toLocaleTimeString('fr-FR')}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6, md: 3}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Caissier: <strong>{selectedTransaction.cashier_name || 'N/A'}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6, md: 3}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Magasin: <strong>{selectedTransaction.store_name || 'N/A'}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs: 6, md: 3}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Statut: <strong>
//                           {selectedTransaction.refunded_at ?
//                             <Chip label="Remboursé" color="error" size="small" /> :
//                             <Chip label="Actif" color="success" size="small" />
//                           }
//                         </strong>
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </Card>
//               </Grid>

//               {/* Historique des remboursements */}
//               <Grid size={{ xs: 12}}>
//                 <Card variant="outlined" sx={{ p: 2 }}>
//                   <Typography variant="subtitle1" gutterBottom fontWeight="bold">
//                     💰 Historique des remboursements
//                   </Typography>

//                   {loadingRefunds ? (
//                     <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
//                       <CircularProgress />
//                     </Box>
//                   ) : transactionRefunds.length > 0 ? (
//                     <TableContainer>
//                       <Table size="small">
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>Type</TableCell>
//                             <TableCell>Montant</TableCell>
//                             <TableCell>Raison</TableCell>
//                             <TableCell>Mode</TableCell>
//                             <TableCell>Date</TableCell>
//                             <TableCell>Créé par</TableCell>
//                             <TableCell>Statut</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {transactionRefunds.map((refund) => (
//                             <TableRow key={refund.id}>
//                               <TableCell>
//                                 <Chip
//                                   label={refund.refund_type === 'full' ? 'Total' : 'Partiel'}
//                                   color={refund.refund_type === 'full' ? 'error' : 'warning'}
//                                   size="small"
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="bold" color="error">
//                                   -{formatCurrency(refund.refund_amount)}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Typography variant="body2">
//                                   {refund.refund_reason === 'customer_request' && 'Demande client'}
//                                   {refund.refund_reason === 'product_defect' && 'Produit défectueux'}
//                                   {refund.refund_reason === 'wrong_product' && 'Mauvais produit'}
//                                   {refund.refund_reason === 'overcharge' && 'Surcharge'}
//                                   {refund.refund_reason === 'return_policy' && 'Politique de retour'}
//                                   {refund.refund_reason === 'other' && 'Autre'}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Chip
//                                   label={getPaymentMethodLabel(refund.refund_method)}
//                                   color="info"
//                                   size="small"
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Typography variant="body2">
//                                   {new Date(refund.created_at).toLocaleString('fr-FR')}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Typography variant="body2">
//                                   {refund.created_by_name || 'N/A'}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Chip
//                                   label={refund.status === 'completed' ? 'Terminé' : refund.status}
//                                   color={refund.status === 'completed' ? 'success' : 'default'}
//                                   size="small"
//                                 />
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   ) : (
//                     <Box sx={{ textAlign: 'center', py: 3 }}>
//                       <Typography variant="body2" color="textSecondary">
//                         Aucun remboursement pour cette transaction
//                       </Typography>
//                     </Box>
//                   )}
//                 </Card>
//               </Grid>

//               {/* Résumé financier */}
//               <Grid size={{ xs: 12}}>
//                 <Card variant="outlined" sx={{ p: 2, bgcolor: '#e3f2fd' }}>
//                   <Typography variant="subtitle1" gutterBottom fontWeight="bold">
//                     💼 Résumé financier
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid size={{ xs:4}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Montant initial:
//                       </Typography>
//                       <Typography variant="h6" color="success.main">
//                         {formatCurrency(selectedTransaction.total_amount)}
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs:4}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Total remboursé:
//                       </Typography>
//                       <Typography variant="h6" color="error">
//                         -{formatCurrency(transactionRefunds.reduce((sum, refund) => sum + parseFloat(refund.refund_amount), 0))}
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs:4}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Solde restant:
//                       </Typography>
//                       <Typography variant="h6" color="primary">
//                         {formatCurrency(
//                           selectedTransaction.total_amount -
//                           transactionRefunds.reduce((sum, refund) => sum + parseFloat(refund.refund_amount), 0)
//                         )}
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </Card>
//               </Grid>
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseTransactionDetailsDialog}>
//             Fermer
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Dialog de création d'avoir */}
//       <Dialog open={creditNoteDialog} onClose={handleCloseCreditNoteDialog} maxWidth="md" fullWidth>
//         <DialogTitle>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <Receipt color="warning" />
//             <Typography variant="h6">
//               Créer un avoir - Transaction #{selectedTransactionForCredit?.transaction_number}
//             </Typography>
//           </Box>
//         </DialogTitle>
//         <DialogContent>
//           {selectedTransactionForCredit && (
//             <Grid container spacing={3} sx={{ mt: 1 }}>
//               {/* Informations de la transaction */}
//               <Grid size={{ xs: 12}}>
//                 <Card variant="outlined" sx={{ p: 2, bgcolor: '#f8f9fa' }}>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Informations de la transaction
//                   </Typography>
//                   <Grid container spacing={2}>
//                     <Grid size={{ xs:6}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Montant total: <strong>{formatCurrency(selectedTransactionForCredit.total_amount)}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs:6}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Mode de paiement: <strong>{getPaymentMethodLabel(selectedTransactionForCredit.payment_method)}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs:6}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Date: <strong>{new Date(selectedTransactionForCredit.created_at).toLocaleDateString('fr-FR')}</strong>
//                       </Typography>
//                     </Grid>
//                     <Grid size={{ xs:6}}>
//                       <Typography variant="body2" color="textSecondary">
//                         Caissier: <strong>{selectedTransactionForCredit.cashier_name || 'N/A'}</strong>
//                       </Typography>
//                     </Grid>
//                   </Grid>
//                 </Card>
//               </Grid>

//               {/* Raison de l'avoir */}
//               <Grid size={{ xs: 12}}>
//                 <FormControl fullWidth>
//                   <InputLabel>Raison de l'avoir</InputLabel>
//                   <Select
//                     value={creditNoteForm.reason}
//                     label="Raison de l'avoir"
//                     onChange={(e) => handleCreditNoteFormChange('reason', e.target.value)}
//                   >
//                     <MenuItem value="customer_request">Demande client</MenuItem>
//                     <MenuItem value="product_defect">Produit défectueux</MenuItem>
//                     <MenuItem value="wrong_product">Mauvais produit</MenuItem>
//                     <MenuItem value="overcharge">Surcharge</MenuItem>
//                     <MenuItem value="return_policy">Politique de retour</MenuItem>
//                     <MenuItem value="price_error">Erreur de prix</MenuItem>
//                     <MenuItem value="other">Autre</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>

//               {/* Montant de l'avoir */}
//               <Grid size={{ xs: 12}}>
//                 <TextField
//                   fullWidth
//                   type="number"
//                   label="Montant de l'avoir (€)"
//                   value={creditNoteForm.credit_amount}
//                   onChange={(e) => handleCreditNoteFormChange('credit_amount', e.target.value)}
//                   inputProps={{
//                     min: 0.01,
//                     max: selectedTransactionForCredit.total_amount,
//                     step: 0.01
//                   }}
//                   helperText={`Maximum: ${formatCurrency(selectedTransactionForCredit.total_amount)}`}
//                 />
//               </Grid>

//               {/* Notes */}
//               <Grid size={{ xs: 12}}>
//                 <TextField
//                   fullWidth
//                   multiline
//                   rows={3}
//                   label="Notes (optionnel)"
//                   value={creditNoteForm.notes}
//                   onChange={(e) => handleCreditNoteFormChange('notes', e.target.value)}
//                   placeholder="Informations supplémentaires sur cet avoir..."
//                 />
//               </Grid>

//               {/* Résumé de l'avoir */}
//               <Grid size={{ xs: 12}}>
//                 <Card variant="outlined" sx={{ p: 2, bgcolor: '#fff3e0' }}>
//                   <Typography variant="subtitle2" gutterBottom>
//                     Résumé de l'avoir
//                   </Typography>
//                   <Typography variant="body2">
//                     Montant de l'avoir: <strong>{formatCurrency(creditNoteForm.credit_amount || 0)}</strong>
//                   </Typography>
//                   <Typography variant="body2" color="textSecondary">
//                     Raison: <strong>
//                       {creditNoteForm.reason === 'customer_request' && 'Demande client'}
//                       {creditNoteForm.reason === 'product_defect' && 'Produit défectueux'}
//                       {creditNoteForm.reason === 'wrong_product' && 'Mauvais produit'}
//                       {creditNoteForm.reason === 'overcharge' && 'Surcharge'}
//                       {creditNoteForm.reason === 'return_policy' && 'Politique de retour'}
//                       {creditNoteForm.reason === 'price_error' && 'Erreur de prix'}
//                       {creditNoteForm.reason === 'other' && 'Autre'}
//                       {!creditNoteForm.reason && 'Non spécifiée'}
//                     </strong>
//                   </Typography>
//                 </Card>
//               </Grid>
//             </Grid>
//           )}
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseCreditNoteDialog}>
//             Annuler
//           </Button>
//           <Button
//             onClick={handleProcessCreditNote}
//             variant="contained"
//             color="warning"
//             startIcon={<Receipt />}
//             disabled={!creditNoteForm.reason || !creditNoteForm.credit_amount}
//           >
//             Créer l'avoir
//           </Button>
//         </DialogActions>
//       </Dialog>

//     </Box>
//   );
// };

// // Composant pour l'onglet de gestion des dons
// const DonationsTab = () => {
//   const [donations, setDonations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [donationDialog, setDonationDialog] = useState(false);
//   const [editingDonation, setEditingDonation] = useState(null);
//   const [donationForm, setDonationForm] = useState({
//     donor_name: '',
//     donor_contact: '',
//     item_description: '',
//     estimated_value: '',
//     status: 'pending'
//   });
//   const [donationStats, setDonationStats] = useState(null);

//   useEffect(() => {
//     fetchDonations();
//     fetchDonationStats();
//   }, []);

//   const fetchDonations = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/donations', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setDonations(response.data.donations || []);
//     } catch (error) {
//       console.error('Erreur lors du chargement des dons:', error);
//       toast.error('Erreur lors du chargement des dons');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchDonationStats = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/donations/stats', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setDonationStats(response.data.stats);
//     } catch (error) {
//       console.error('Erreur lors du chargement des statistiques:', error);
//     }
//   };

//   const handleOpenDonationDialog = (donation = null) => {
//     if (donation) {
//       setEditingDonation(donation);
//       setDonationForm({
//         donor_name: donation.donor_name || '',
//         donor_contact: donation.donor_contact || '',
//         item_description: donation.item_description || '',
//         estimated_value: donation.estimated_value?.toString() || '',
//         status: donation.status || 'pending'
//       });
//     } else {
//       setEditingDonation(null);
//       setDonationForm({
//         donor_name: '',
//         donor_contact: '',
//         item_description: '',
//         estimated_value: '',
//         status: 'pending'
//       });
//     }
//     setDonationDialog(true);
//   };

//   const handleCloseDonationDialog = () => {
//     setDonationDialog(false);
//     setEditingDonation(null);
//   };

//   const handleSaveDonation = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const url = editingDonation
//         ? `/api/donations/${editingDonation.id}`
//         : '/api/donations';

//       const method = editingDonation ? 'put' : 'post';

//       console.log('Données envoyées:', donationForm);

//       await axios[method](url, donationForm, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       toast.success(editingDonation
//         ? 'Don mis à jour avec succès'
//         : 'Don enregistré avec succès'
//       );

//       handleCloseDonationDialog();
//       fetchDonations();
//       fetchDonationStats();
//     } catch (error) {
//       console.error('Erreur lors de la sauvegarde:', error);
//       toast.error('Erreur lors de la sauvegarde');
//     }
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'pending': return 'warning';
//       case 'accepted': return 'success';
//       case 'rejected': return 'error';
//       default: return 'default';
//     }
//   };

//   const getStatusLabel = (status) => {
//     switch (status) {
//       case 'pending': return 'En attente';
//       case 'accepted': return 'Accepté';
//       case 'rejected': return 'Refusé';
//       default: return status;
//     }
//   };

//   const formatCurrency = (value) => {
//     return new Intl.NumberFormat('fr-FR', {
//       style: 'currency',
//       currency: 'EUR'
//     }).format(value || 0);
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       {/* Statistiques des dons */}
//       {donationStats && (
//         <Grid container spacing={3} sx={{ mb: 3 }}>
//           <Grid size={{ xs: 12,sm:6,md:3}}>
//             <Card>
//               <CardContent>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <Box>
//                     <Typography color="text.secondary" gutterBottom>
//                       Total Dons
//                     </Typography>
//                     <Typography variant="h4">
//                       {donationStats.total_donations || 0}
//                     </Typography>
//                   </Box>
//                   <CardGiftcard color="primary" sx={{ fontSize: 40 }} />
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid size={{ xs: 12,sm:6,md:3}}>
//             <Card>
//               <CardContent>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <Box>
//                     <Typography color="text.secondary" gutterBottom>
//                       En Attente
//                     </Typography>
//                     <Typography variant="h4">
//                       {donationStats.pending_donations || 0}
//                     </Typography>
//                   </Box>
//                   <ScheduleIcon color="warning" sx={{ fontSize: 40 }} />
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid size={{ xs: 12,sm:6,md:3}}>
//             <Card>
//               <CardContent>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <Box>
//                     <Typography color="text.secondary" gutterBottom>
//                       Acceptés
//                     </Typography>
//                     <Typography variant="h4">
//                       {donationStats.accepted_donations || 0}
//                     </Typography>
//                   </Box>
//                   <CheckCircle color="success" sx={{ fontSize: 40 }} />
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//           <Grid size={{ xs: 12,sm:6,md:3}}>
//             <Card>
//               <CardContent>
//                 <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                   <Box>
//                     <Typography color="text.secondary" gutterBottom>
//                       Valeur Estimée
//                     </Typography>
//                     <Typography variant="h4">
//                       {formatCurrency(donationStats.total_estimated_value)}
//                     </Typography>
//                   </Box>
//                   <TrendingUp color="info" sx={{ fontSize: 40 }} />
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       )}

//       {/* Bouton d'ajout */}
//       <Box sx={{ mb: 3 }}>
//         <Button
//           variant="contained"
//           startIcon={<Add />}
//           onClick={() => handleOpenDonationDialog()}
//         >
//           Nouveau Don
//         </Button>
//       </Box>

//       {/* Liste des dons */}
//       <Paper>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Date</TableCell>
//               <TableCell>Bénéficiaire</TableCell>
//               <TableCell>Description</TableCell>
//               <TableCell>Valeur Estimée</TableCell>
//               <TableCell>Statut</TableCell>
//               <TableCell>Donné par</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {donations.map((donation) => (
//               <TableRow key={donation.id}>
//                 <TableCell>
//                   {new Date(donation.created_at).toLocaleDateString('fr-FR')}
//                 </TableCell>
//                 <TableCell>
//                   <Box>
//                     <Typography variant="subtitle2">
//                       {donation.donor_name}
//                     </Typography>
//                     {donation.donor_contact && (
//                       <Typography variant="caption" color="text.secondary">
//                         {donation.donor_contact}
//                       </Typography>
//                     )}
//                   </Box>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="body2">
//                     {donation.item_description}
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="body2" fontWeight="bold">
//                     {formatCurrency(donation.estimated_value)}
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Chip
//                     label={getStatusLabel(donation.status)}
//                     color={getStatusColor(donation.status)}
//                     size="small"
//                   />
//                 </TableCell>
//                 <TableCell>
//                   {donation.received_by_name || '-'}
//                 </TableCell>
//                 <TableCell>
//                   <IconButton
//                     size="small"
//                     onClick={() => handleOpenDonationDialog(donation)}
//                     title="Modifier"
//                   >
//                     <Edit />
//                   </IconButton>
//                   <IconButton
//                     size="small"
//                     onClick={() => handleOpenDonationDialog(donation)}
//                     title="Voir les détails"
//                   >
//                     <Visibility />
//                   </IconButton>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </Paper>

//       {/* Dialog pour créer/modifier un don */}
//       <Dialog open={donationDialog} onClose={handleCloseDonationDialog} maxWidth="md" fullWidth>
//         <DialogTitle>
//           {editingDonation ? 'Modifier le Don' : 'Nouveau Don'}
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid size={{ xs: 12,sm:6}}>
//               <TextField
//                 fullWidth
//                 label="Nom du Bénéficiaire"
//                 value={donationForm.donor_name}
//                 onChange={(e) => setDonationForm(prev => ({ ...prev, donor_name: e.target.value }))}
//                 required
//               />
//             </Grid>
//             <Grid size={{ xs: 12,sm:6}}>
//               <TextField
//                 fullWidth
//                 label="Contact (email/téléphone)"
//                 value={donationForm.donor_contact}
//                 onChange={(e) => setDonationForm(prev => ({ ...prev, donor_contact: e.target.value }))}
//               />
//             </Grid>
//             <Grid size={{ xs: 12}}>
//               <TextField
//                 fullWidth
//                 label="Description du Don"
//                 value={donationForm.item_description}
//                 onChange={(e) => setDonationForm(prev => ({ ...prev, item_description: e.target.value }))}
//                 multiline
//                 rows={3}
//                 required
//               />
//             </Grid>
//             <Grid size={{ xs: 12,sm:6}}>
//               <TextField
//                 fullWidth
//                 label="Valeur Estimée (€)"
//                 type="number"
//                 value={donationForm.estimated_value}
//                 onChange={(e) => setDonationForm(prev => ({ ...prev, estimated_value: e.target.value }))}
//               />
//             </Grid>
//             <Grid size={{ xs: 12,sm:6}}>
//               <FormControl fullWidth>
//                 <InputLabel>Statut</InputLabel>
//                 <Select
//                   value={donationForm.status}
//                   onChange={(e) => setDonationForm(prev => ({ ...prev, status: e.target.value }))}
//                   label="Statut"
//                 >
//                   <MenuItem value="pending">En Attente</MenuItem>
//                   <MenuItem value="accepted">Accepté</MenuItem>
//                   <MenuItem value="rejected">Refusé</MenuItem>
//                 </Select>
//               </FormControl>
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDonationDialog}>
//             Annuler
//           </Button>
//           <Button onClick={handleSaveDonation} variant="contained">
//             {editingDonation ? 'Mettre à jour' : 'Enregistrer'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// // Composant EcoOrganismsTab
// const EcoOrganismsTab = () => {
//   const [ecoOrganisms, setEcoOrganisms] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [ecoOrganismDialog, setEcoOrganismDialog] = useState(false);
//   const [editingEcoOrganism, setEditingEcoOrganism] = useState(null);
//   const [ecoOrganismForm, setEcoOrganismForm] = useState({
//     name: '',
//     description: '',
//     contact_email: '',
//     contact_phone: '',
//     address: '',
//     website: '',
//     is_active: true
//   });
//   const [ecoOrganismStats, setEcoOrganismStats] = useState(null);

//   useEffect(() => {
//     fetchEcoOrganisms();
//     fetchEcoOrganismStats();
//   }, []);

//   const fetchEcoOrganisms = async () => {
//     try {
//       const response = await axios.get('/api/eco-organisms');
//       setEcoOrganisms(response.data.eco_organisms || []);
//     } catch (error) {
//       console.error('Erreur lors du chargement des éco-organismes:', error);
//       toast.error('Erreur lors du chargement des éco-organismes');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchEcoOrganismStats = async () => {
//     try {
//       const response = await axios.get('/api/eco-organisms/stats/summary');
//       setEcoOrganismStats(response.data.stats);
//     } catch (error) {
//       console.error('Erreur lors du chargement des statistiques:', error);
//     }
//   };

//   const handleOpenEcoOrganismDialog = (ecoOrganism = null) => {
//     if (ecoOrganism) {
//       setEditingEcoOrganism(ecoOrganism);
//       setEcoOrganismForm({
//         name: ecoOrganism.name,
//         description: ecoOrganism.description || '',
//         contact_email: ecoOrganism.contact_email || '',
//         contact_phone: ecoOrganism.contact_phone || '',
//         address: ecoOrganism.address || '',
//         website: ecoOrganism.website || '',
//         is_active: ecoOrganism.is_active
//       });
//     } else {
//       setEditingEcoOrganism(null);
//       setEcoOrganismForm({
//         name: '',
//         description: '',
//         contact_email: '',
//         contact_phone: '',
//         address: '',
//         website: '',
//         is_active: true
//       });
//     }
//     setEcoOrganismDialog(true);
//   };

//   const handleCloseEcoOrganismDialog = () => {
//     setEcoOrganismDialog(false);
//     setEditingEcoOrganism(null);
//   };

//   const handleSaveEcoOrganism = async () => {
//     try {
//       const url = editingEcoOrganism
//         ? `/api/eco-organisms/${editingEcoOrganism.id}`
//         : '/api/eco-organisms';

//       const method = editingEcoOrganism ? 'put' : 'post';

//       await axios[method](url, ecoOrganismForm);

//       toast.success(editingEcoOrganism
//         ? 'Éco-organisme mis à jour avec succès'
//         : 'Éco-organisme créé avec succès'
//       );

//       handleCloseEcoOrganismDialog();
//       fetchEcoOrganisms();
//       fetchEcoOrganismStats();
//     } catch (error) {
//       console.error('Erreur lors de la sauvegarde:', error);
//       toast.error('Erreur lors de la sauvegarde');
//     }
//   };

//   const handleDeleteEcoOrganism = async (id) => {
//     if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet éco-organisme ?')) {
//       return;
//     }

//     try {
//       await axios.delete(`/api/eco-organisms/${id}`);
//       toast.success('Éco-organisme supprimé avec succès');
//       fetchEcoOrganisms();
//       fetchEcoOrganismStats();
//     } catch (error) {
//       console.error('Erreur lors de la suppression:', error);
//       toast.error('Erreur lors de la suppression');
//     }
//   };

//   if (loading) {
//     return (
//       <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
//         <Typography variant="h5">
//           🌱 Gestion des Éco-organismes
//         </Typography>
//         <Button
//           variant="contained"
//           startIcon={<Add />}
//           onClick={() => handleOpenEcoOrganismDialog()}
//         >
//           Nouvel Éco-organisme
//         </Button>
//       </Box>

//       {/* Statistiques */}
//       {ecoOrganismStats && (
//         <Grid container spacing={3} sx={{ mb: 4 }}>
//           <Grid size={{ xs: 12,sm:4}}>
//             <Card>
//               <CardContent>
//                 <Box display="flex" alignItems="center" justifyContent="space-between">
//                   <Box>
//                     <Typography color="text.secondary" gutterBottom>
//                       Total Éco-organismes
//                     </Typography>
//                     <Typography variant="h4">
//                       {ecoOrganismStats.total_eco_organisms || 0}
//                     </Typography>
//                   </Box>
//                   <Nature color="primary" sx={{ fontSize: 40 }} />
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>

//           <Grid size={{ xs: 12,sm:4}}>
//             <Card>
//               <CardContent>
//                 <Box display="flex" alignItems="center" justifyContent="space-between">
//                   <Box>
//                     <Typography color="text.secondary" gutterBottom>
//                       Actifs
//                     </Typography>
//                     <Typography variant="h4">
//                       {ecoOrganismStats.active_eco_organisms || 0}
//                     </Typography>
//                   </Box>
//                   <CheckCircle color="success" sx={{ fontSize: 40 }} />
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>

//           <Grid size={{ xs: 12,sm:4}}>
//             <Card>
//               <CardContent>
//                 <Box display="flex" alignItems="center" justifyContent="space-between">
//                   <Box>
//                     <Typography color="text.secondary" gutterBottom>
//                       Inactifs
//                     </Typography>
//                     <Typography variant="h4">
//                       {ecoOrganismStats.inactive_eco_organisms || 0}
//                     </Typography>
//                   </Box>
//                   <Block color="error" sx={{ fontSize: 40 }} />
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       )}

//       {/* Table des éco-organismes */}
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Nom</TableCell>
//               <TableCell>Description</TableCell>
//               <TableCell>Contact</TableCell>
//               <TableCell>Site Web</TableCell>
//               <TableCell>Statut</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {ecoOrganisms.map((org) => (
//               <TableRow key={org.id}>
//                 <TableCell>
//                   <Typography variant="body1" fontWeight="bold">
//                     {org.name}
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Typography variant="body2" color="text.secondary">
//                     {org.description || 'Aucune description'}
//                   </Typography>
//                 </TableCell>
//                 <TableCell>
//                   <Box>
//                     {org.contact_email && (
//                       <Typography variant="body2">
//                         📧 {org.contact_email}
//                       </Typography>
//                     )}
//                     {org.contact_phone && (
//                       <Typography variant="body2">
//                         📞 {org.contact_phone}
//                       </Typography>
//                     )}
//                   </Box>
//                 </TableCell>
//                 <TableCell>
//                   {org.website && (
//                     <Button
//                       size="small"
//                       href={org.website}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                     >
//                       Visiter
//                     </Button>
//                   )}
//                 </TableCell>
//                 <TableCell>
//                   <Chip
//                     label={org.is_active ? 'Actif' : 'Inactif'}
//                     color={org.is_active ? 'success' : 'default'}
//                     size="small"
//                   />
//                 </TableCell>
//                 <TableCell>
//                   <Box display="flex" gap={1}>
//                     <Tooltip title="Modifier">
//                       <IconButton
//                         size="small"
//                         onClick={() => handleOpenEcoOrganismDialog(org)}
//                       >
//                         <Edit />
//                       </IconButton>
//                     </Tooltip>
//                     <Tooltip title="Supprimer">
//                       <IconButton
//                         size="small"
//                         color="error"
//                         onClick={() => handleDeleteEcoOrganism(org.id)}
//                       >
//                         <Delete />
//                       </IconButton>
//                     </Tooltip>
//                   </Box>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Dialogue de création/modification */}
//       <Dialog
//         open={ecoOrganismDialog}
//         onClose={handleCloseEcoOrganismDialog}
//         maxWidth="md"
//         fullWidth
//       >
//         <DialogTitle>
//           {editingEcoOrganism ? 'Modifier l\'Éco-organisme' : 'Nouvel Éco-organisme'}
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid size={{ xs: 12}}>
//               <TextField
//                 fullWidth
//                 label="Nom *"
//                 value={ecoOrganismForm.name}
//                 onChange={(e) => setEcoOrganismForm(prev => ({ ...prev, name: e.target.value }))}
//                 required
//               />
//             </Grid>

//             <Grid size={{ xs: 12}}>
//               <TextField
//                 fullWidth
//                 label="Description"
//                 multiline
//                 rows={3}
//                 value={ecoOrganismForm.description}
//                 onChange={(e) => setEcoOrganismForm(prev => ({ ...prev, description: e.target.value }))}
//               />
//             </Grid>

//             <Grid size={{ xs: 12,sm:6}}>
//               <TextField
//                 fullWidth
//                 label="Email de contact"
//                 type="email"
//                 value={ecoOrganismForm.contact_email}
//                 onChange={(e) => setEcoOrganismForm(prev => ({ ...prev, contact_email: e.target.value }))}
//               />
//             </Grid>

//             <Grid size={{ xs: 12,sm:6}}>
//               <TextField
//                 fullWidth
//                 label="Téléphone"
//                 value={ecoOrganismForm.contact_phone}
//                 onChange={(e) => setEcoOrganismForm(prev => ({ ...prev, contact_phone: e.target.value }))}
//               />
//             </Grid>

//             <Grid size={{ xs: 12}}>
//               <TextField
//                 fullWidth
//                 label="Adresse"
//                 multiline
//                 rows={2}
//                 value={ecoOrganismForm.address}
//                 onChange={(e) => setEcoOrganismForm(prev => ({ ...prev, address: e.target.value }))}
//               />
//             </Grid>

//             <Grid size={{ xs: 12}}>
//               <TextField
//                 fullWidth
//                 label="Site Web"
//                 value={ecoOrganismForm.website}
//                 onChange={(e) => setEcoOrganismForm(prev => ({ ...prev, website: e.target.value }))}
//               />
//             </Grid>

//             <Grid size={{ xs: 12}}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={ecoOrganismForm.is_active}
//                     onChange={(e) => setEcoOrganismForm(prev => ({ ...prev, is_active: e.target.checked }))}
//                   />
//                 }
//                 label="Éco-organisme actif"
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseEcoOrganismDialog}>
//             Annuler
//           </Button>
//           <Button onClick={handleSaveEcoOrganism} variant="contained">
//             {editingEcoOrganism ? 'Mettre à jour' : 'Créer'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// // Composant pour l'onglet de gestion des utilisateurs
// const UsersTab = () => {
//   const [users, setUsers] = useState([]);
//   const [roles, setRoles] = useState([]);
//   const [stores, setStores] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [userDialog, setUserDialog] = useState(false);
//   const [passwordDialog, setPasswordDialog] = useState(false);
//   const [editingUser, setEditingUser] = useState(null);
//   const [userStats, setUserStats] = useState({
//     total_users: 0,
//     users_by_role: [],
//     active_last_30_days: 0
//   });
//   const [userForm, setUserForm] = useState({
//     username: '',
//     email: '',
//     password: '',
//     first_name: '',
//     last_name: '',
//     phone: '',
//     role: '',
//     recyclery_id: '',
//     is_active: true
//   });
//   const [passwordForm, setPasswordForm] = useState({
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });

//   useEffect(() => {
//     fetchUsers();
//     fetchRoles();
//     fetchStores();
//     fetchUserStats();
//   }, []);

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/users', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setUsers(response.data.users || []);
//     } catch (error) {
//       console.error('Erreur lors du chargement des utilisateurs:', error);
//       toast.error('Erreur lors du chargement des utilisateurs');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchRoles = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/users/roles', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setRoles(response.data.roles || []);
//     } catch (error) {
//       console.error('Erreur lors du chargement des rôles:', error);
//     }
//   };

//   const fetchStores = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/stores', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setStores(response.data.stores?.filter(store => store.is_active) || []);
//     } catch (error) {
//       console.error('Erreur lors du chargement des magasins:', error);
//     }
//   };

//   const fetchUserStats = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/users/stats', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       setUserStats(response.data.stats || {});
//     } catch (error) {
//       console.error('Erreur lors du chargement des statistiques:', error);
//     }
//   };

//   const handleOpenUserDialog = (user = null) => {
//     if (user) {
//       setEditingUser(user);
//       setUserForm({
//         username: user.username,
//         email: user.email,
//         password: '',
//         first_name: user.first_name || '',
//         last_name: user.last_name || '',
//         phone: user.phone || '',
//         role: user.role || '',
//         recyclery_id: user.recyclery_id || '',
//         is_active: user.is_active !== 0
//       });
//     } else {
//       setEditingUser(null);
//       setUserForm({
//         username: '',
//         email: '',
//         password: '',
//         first_name: '',
//         last_name: '',
//         phone: '',
//         role: '',
//         recyclery_id: '',
//         is_active: true
//       });
//     }
//     setUserDialog(true);
//   };

//   const handleCloseUserDialog = () => {
//     setUserDialog(false);
//     setEditingUser(null);
//     setUserForm({
//       username: '',
//       email: '',
//       password: '',
//       first_name: '',
//       last_name: '',
//       phone: '',
//       role: '',
//       recyclery_id: '',
//       is_active: true
//     });
//   };

//   const handleSaveUser = async () => {
//     try {
//       const token = localStorage.getItem('token');

//       if (editingUser) {
//         // Mise à jour
//         const updateData = { ...userForm };
//         delete updateData.password; // Ne pas envoyer le mot de passe lors de la mise à jour

//         await axios.put(`/api/users/${editingUser.id}`, updateData, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('Utilisateur mis à jour avec succès');
//       } else {
//         // Création
//         if (!userForm.password) {
//           toast.error('Le mot de passe est requis pour un nouvel utilisateur');
//           return;
//         }

//         await axios.post('/api/users', userForm, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('Utilisateur créé avec succès');
//       }

//       handleCloseUserDialog();
//       fetchUsers();
//       fetchUserStats();
//     } catch (error) {
//       console.error('Erreur lors de la sauvegarde:', error);
//       toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
//     }
//   };

//   const handleOpenPasswordDialog = (user) => {
//     setEditingUser(user);
//     setPasswordForm({
//       currentPassword: '',
//       newPassword: '',
//       confirmPassword: ''
//     });
//     setPasswordDialog(true);
//   };

//   const handleClosePasswordDialog = () => {
//     setPasswordDialog(false);
//     setEditingUser(null);
//     setPasswordForm({
//       currentPassword: '',
//       newPassword: '',
//       confirmPassword: ''
//     });
//   };

//   const handleChangePassword = async () => {
//     if (passwordForm.newPassword !== passwordForm.confirmPassword) {
//       toast.error('Les mots de passe ne correspondent pas');
//       return;
//     }

//     if (passwordForm.newPassword.length < 6) {
//       toast.error('Le mot de passe doit contenir au moins 6 caractères');
//       return;
//     }

//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(`/api/users/${editingUser.id}/password`, {
//         currentPassword: passwordForm.currentPassword,
//         newPassword: passwordForm.newPassword
//       }, {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       toast.success('Mot de passe mis à jour avec succès');
//       handleClosePasswordDialog();
//     } catch (error) {
//       console.error('Erreur lors du changement de mot de passe:', error);
//       toast.error(error.response?.data?.error || 'Erreur lors du changement de mot de passe');
//     }
//   };

//   const handleToggleUserStatus = async (user) => {
//     try {
//       const token = localStorage.getItem('token');
//       const newStatus = !user.is_active;

//       if (newStatus) {
//         // Réactiver l'utilisateur
//         await axios.put(`/api/users/${user.id}`, { is_active: true }, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('Utilisateur réactivé');
//       } else {
//         // Désactiver l'utilisateur
//         await axios.delete(`/api/users/${user.id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('Utilisateur désactivé');
//       }

//       fetchUsers();
//       fetchUserStats();
//     } catch (error) {
//       console.error('Erreur lors du changement de statut:', error);
//       toast.error(error.response?.data?.error || 'Erreur lors du changement de statut');
//     }
//   };

//   const getRoleBadgeColor = (role) => {
//     const colors = {
//       admin: 'error',
//       direction: 'warning',
//       coordination: 'info',
//       encadrant: 'primary',
//       salarie: 'default'
//     };
//     return colors[role] || 'default';
//   };

//   const formatLastLogin = (lastLogin) => {
//     if (!lastLogin) return 'Jamais connecté';
//     return new Date(lastLogin).toLocaleDateString('fr-FR', {
//       day: '2-digit',
//       month: '2-digit',
//       year: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//         <Typography variant="h5" fontWeight="bold">
//           👥 Gestion des Utilisateurs
//         </Typography>
//         <Button
//           variant="contained"
//           startIcon={<PersonAdd />}
//           onClick={() => handleOpenUserDialog()}
//         >
//           Nouvel Utilisateur
//         </Button>
//       </Box>

//       {/* Statistiques des utilisateurs */}
//       <Grid container spacing={3} sx={{ mb: 3 }}>
//         <Grid size={{ xs: 12,sm:6,md:4}}>
//           <Card>
//             <CardContent sx={{ textAlign: 'center' }}>
//               <Typography variant="h4" color="primary" fontWeight="bold">
//                 {userStats.total_users}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Utilisateurs actifs
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid size={{ xs: 12,sm:6,md:4}}>
//           <Card>
//             <CardContent sx={{ textAlign: 'center' }}>
//               <Typography variant="h4" color="success.main" fontWeight="bold">
//                 {userStats.active_last_30_days}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Connectés (30j)
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>

//         <Grid size={{ xs: 12,sm:6,md:4}}>
//           <Card>
//             <CardContent sx={{ textAlign: 'center' }}>
//               <Typography variant="h4" color="info.main" fontWeight="bold">
//                 {userStats.users_by_role?.length || 0}
//               </Typography>
//               <Typography variant="body2" color="textSecondary">
//                 Rôles différents
//               </Typography>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>

//       {/* Répartition par rôles */}
//       {userStats.users_by_role && userStats.users_by_role.length > 0 && (
//         <Card sx={{ mb: 3 }}>
//           <CardContent>
//             <Typography variant="h6" gutterBottom>
//               📊 Répartition par Rôles
//             </Typography>
//             <Grid container spacing={2}>
//               {userStats.users_by_role.map((rolestat) => (
//                 <Grid size={{ xs:6,sm:4,md:2}} key={rolestat.role}>
//                   <Box sx={{ textAlign: 'center' }}>
//                     <Chip
//                       label={rolestat.role}
//                       color={getRoleBadgeColor(rolestat.role)}
//                       sx={{ mb: 1 }}
//                     />
//                     <Typography variant="h6">{rolestat.count}</Typography>
//                   </Box>
//                 </Grid>
//               ))}
//             </Grid>
//           </CardContent>
//         </Card>
//       )}

//       {/* Liste des utilisateurs */}
//       <Card>
//         <CardContent>
//           <Typography variant="h6" gutterBottom>
//             📋 Liste des Utilisateurs ({users.length})
//           </Typography>

//           {users.length === 0 ? (
//             <Alert severity="info">
//               Aucun utilisateur trouvé.
//             </Alert>
//           ) : (
//             <TableContainer>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Utilisateur</TableCell>
//                     <TableCell>Email</TableCell>
//                     <TableCell>Rôle</TableCell>
//                     <TableCell>Magasin</TableCell>
//                     <TableCell>Dernière connexion</TableCell>
//                     <TableCell>Statut</TableCell>
//                     <TableCell>Actions</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {users.map((user) => (
//                     <TableRow key={user.id}>
//                       <TableCell>
//                         <Box>
//                           <Typography variant="body2" fontWeight="bold">
//                             {user.first_name && user.last_name
//                               ? `${user.first_name} ${user.last_name}`
//                               : user.username}
//                           </Typography>
//                           {user.first_name && user.last_name && (
//                             <Typography variant="caption" color="textSecondary">
//                               @{user.username}
//                             </Typography>
//                           )}
//                           {user.phone && (
//                             <Typography variant="caption" display="block" color="textSecondary">
//                               📞 {user.phone}
//                             </Typography>
//                           )}
//                         </Box>
//                       </TableCell>
//                       <TableCell>{user.email}</TableCell>
//                       <TableCell>
//                         <Chip
//                           label={user.role_name || user.role}
//                           color={getRoleBadgeColor(user.role)}
//                           size="small"
//                         />
//                       </TableCell>
//                       <TableCell>{user.recyclery_name || 'Non assigné'}</TableCell>
//                       <TableCell>
//                         <Typography variant="body2">
//                           {formatLastLogin(user.last_login)}
//                         </Typography>
//                       </TableCell>
//                       <TableCell>
//                         <Chip
//                           label={user.is_active ? 'Actif' : 'Inactif'}
//                           color={user.is_active ? 'success' : 'default'}
//                           size="small"
//                         />
//                       </TableCell>
//                       <TableCell>
//                         <Box sx={{ display: 'flex', gap: 1 }}>
//                           <Tooltip title="Modifier">
//                             <IconButton
//                               size="small"
//                               color="primary"
//                               onClick={() => handleOpenUserDialog(user)}
//                             >
//                               <Edit />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title="Changer le mot de passe">
//                             <IconButton
//                               size="small"
//                               color="warning"
//                               onClick={() => handleOpenPasswordDialog(user)}
//                             >
//                               <VpnKey />
//                             </IconButton>
//                           </Tooltip>
//                           <Tooltip title={user.is_active ? 'Désactiver' : 'Réactiver'}>
//                             <IconButton
//                               size="small"
//                               color={user.is_active ? 'error' : 'success'}
//                               onClick={() => handleToggleUserStatus(user)}
//                             >
//                               {user.is_active ? <Block /> : <CheckCircle />}
//                             </IconButton>
//                           </Tooltip>
//                         </Box>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           )}
//         </CardContent>
//       </Card>

//       {/* Dialog de création/modification d'utilisateur */}
//       <Dialog open={userDialog} onClose={handleCloseUserDialog} maxWidth="md" fullWidth>
//         <DialogTitle>
//           {editingUser ? '✏️ Modifier l\'utilisateur' : '👤 Nouvel utilisateur'}
//         </DialogTitle>
//         <DialogContent>
//           <Grid container spacing={2} sx={{ mt: 1 }}>
//             <Grid size={{ xs: 12, md: 6}}>
//               <TextField
//                 fullWidth
//                 label="Nom d'utilisateur *"
//                 value={userForm.username}
//                 onChange={(e) => setUserForm(prev => ({...prev, username: e.target.value}))}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, md: 6}}>
//               <TextField
//                 fullWidth
//                 label="Email *"
//                 type="email"
//                 value={userForm.email}
//                 onChange={(e) => setUserForm(prev => ({...prev, email: e.target.value}))}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, md: 6}}>
//               <TextField
//                 fullWidth
//                 label="Prénom"
//                 value={userForm.first_name}
//                 onChange={(e) => setUserForm(prev => ({...prev, first_name: e.target.value}))}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, md: 6}}>
//               <TextField
//                 fullWidth
//                 label="Nom"
//                 value={userForm.last_name}
//                 onChange={(e) => setUserForm(prev => ({...prev, last_name: e.target.value}))}
//               />
//             </Grid>
//             <Grid size={{ xs: 12, md: 6}}>
//               <TextField
//                 fullWidth
//                 label="Téléphone"
//                 value={userForm.phone}
//                 onChange={(e) => setUserForm(prev => ({...prev, phone: e.target.value}))}
//               />
//             </Grid>
//             {!editingUser && (
//               <Grid size={{ xs: 12, md: 6}}>
//                 <TextField
//                   fullWidth
//                   label="Mot de passe *"
//                   type="password"
//                   value={userForm.password}
//                   onChange={(e) => setUserForm(prev => ({...prev, password: e.target.value}))}
//                 />
//               </Grid>
//             )}
//             <Grid size={{ xs: 12, md: 6}}>
//               <FormControl fullWidth>
//                 <InputLabel>Rôle *</InputLabel>
//                 <Select
//                   value={userForm.role}
//                   label="Rôle *"
//                   onChange={(e) => setUserForm(prev => ({...prev, role: e.target.value}))}
//                 >
//                   {roles.map(role => (
//                     <MenuItem key={role.name} value={role.name}>
//                       {role.display_name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid size={{ xs: 12, md: 6}}>
//               <FormControl fullWidth>
//                 <InputLabel>Magasin</InputLabel>
//                 <Select
//                   value={userForm.recyclery_id}
//                   label="Magasin"
//                   onChange={(e) => setUserForm(prev => ({...prev, recyclery_id: e.target.value}))}
//                 >
//                   <MenuItem key="no-store" value="">Aucun magasin assigné</MenuItem>
//                   {stores.map(store => (
//                     <MenuItem key={store.id} value={store.id}>
//                       {store.name}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid size={{ xs: 12}}>
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={userForm.is_active}
//                     onChange={(e) => setUserForm(prev => ({...prev, is_active: e.target.checked}))}
//                   />
//                 }
//                 label="Utilisateur actif"
//               />
//             </Grid>
//           </Grid>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseUserDialog}>Annuler</Button>
//           <Button
//             onClick={handleSaveUser}
//             variant="contained"
//             disabled={!userForm.username || !userForm.email || !userForm.role || (!editingUser && !userForm.password)}
//           >
//             {editingUser ? 'Mettre à jour' : 'Créer'}
//           </Button>
//         </DialogActions>
//       </Dialog>

//       {/* Dialog de changement de mot de passe */}
//       <Dialog open={passwordDialog} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
//         <DialogTitle>
//           🔐 Changer le mot de passe
//         </DialogTitle>
//         <DialogContent>
//           {editingUser && (
//             <Alert severity="info" sx={{ mb: 2 }}>
//               Changement de mot de passe pour : <strong>{editingUser.username}</strong>
//             </Alert>
//           )}
//           <TextField
//             fullWidth
//             margin="normal"
//             label="Mot de passe actuel"
//             type="password"
//             value={passwordForm.currentPassword}
//             onChange={(e) => setPasswordForm(prev => ({...prev, currentPassword: e.target.value}))}
//           />
//           <TextField
//             fullWidth
//             margin="normal"
//             label="Nouveau mot de passe"
//             type="password"
//             value={passwordForm.newPassword}
//             onChange={(e) => setPasswordForm(prev => ({...prev, newPassword: e.target.value}))}
//           />
//           <TextField
//             fullWidth
//             margin="normal"
//             label="Confirmer le nouveau mot de passe"
//             type="password"
//             value={passwordForm.confirmPassword}
//             onChange={(e) => setPasswordForm(prev => ({...prev, confirmPassword: e.target.value}))}
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClosePasswordDialog}>Annuler</Button>
//           <Button
//             onClick={handleChangePassword}
//             variant="contained"
//             color="warning"
//             disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
//           >
//             Changer le mot de passe
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// // Composant pour l'onglet des catégories
// const CategoriesTab = () => {
//   const [categories, setCategories] = useState([]);
//   const [availableIcons, setAvailableIcons] = useState([]);
//   const [openDialog, setOpenDialog] = useState(false);
//   const [editingCategory, setEditingCategory] = useState(null);
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     icon: '',
//     parent_id: null,
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchCategories();
//     fetchAvailableIcons();
//   }, []);

//   const fetchCategories = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/categories', {
//         headers: { Authorization: `Bearer ${token}` }
//       });

//       // Organiser les catégories en structure hiérarchique
//       const allCategories = response.data.categories || [];
//       const mainCategories = allCategories.filter(cat => !cat.parent_id);
//       const subcategories = allCategories.filter(cat => cat.parent_id);

//       // Ajouter les sous-catégories à leurs catégories parentes
//       const organizedCategories = mainCategories.map(category => ({
//         ...category,
//         subcategories: subcategories.filter(sub => sub.parent_id === category.id)
//       }));

//       setCategories(organizedCategories);
//     } catch (error) {
//       toast.error('Erreur lors du chargement des catégories');
//       console.error('Erreur:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchAvailableIcons = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get('/api/categories/icons', {
//         headers: { Authorization: `Bearer ${token}` }
//       });
//       const icons = response.data.icons || [];
//       setAvailableIcons(icons.map(icon => ({
//         name: icon,
//         label: icon
//       })));
//     } catch (error) {
//       console.error('Erreur lors du chargement des icônes:', error);
//     }
//   };

//   const handleOpenDialog = (category = null, parentId = null) => {
//     if (category) {
//       setEditingCategory(category);
//       setFormData({
//         name: category.name,
//         description: category.description || '',
//         icon: category.icon || '',
//         parent_id: category.parent_id || null,
//       });
//     } else {
//       setEditingCategory(null);
//       setFormData({
//         name: '',
//         description: '',
//         icon: '',
//         parent_id: parentId,
//       });
//     }
//     setOpenDialog(true);
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false);
//     setEditingCategory(null);
//     setFormData({ name: '', description: '', icon: '', parent_id: null });
//   };

//   const handleSave = async () => {
//     try {
//       const token = localStorage.getItem('token');

//       if (editingCategory) {
//         await axios.put(`/api/categories/${editingCategory.id}`, formData, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('Catégorie mise à jour avec succès');
//       } else {
//         await axios.post('/api/categories', formData, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('Catégorie créée avec succès');
//       }

//       handleCloseDialog();
//       fetchCategories();
//     } catch (error) {
//       toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde');
//     }
//   };

//   const handleDelete = async (category) => {
//     if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${category.name}" ?`)) {
//       try {
//         const token = localStorage.getItem('token');
//         await axios.delete(`/api/categories/${category.id}`, {
//           headers: { Authorization: `Bearer ${token}` }
//         });
//         toast.success('Catégorie supprimée avec succès');
//         fetchCategories();
//       } catch (error) {
//         toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
//       }
//     }
//   };

//   const getIconComponent = (iconName) => {
//     // Import dynamique des icônes Material-UI
//     const iconMap = {
//       Category,
//       Inventory,
//       Settings,
//       Palette,
//       AdminPanelSettings,
//     };

//     const IconComponent = iconMap[iconName] || Category;
//     return <IconComponent />;
//   };

//   const renderCategoryCard = (category, isSubcategory = false) => (
//     <Card
//       key={category.id}
//       variant={isSubcategory ? "outlined" : "elevation"}
//       sx={{
//         mb: 1,
//         ml: isSubcategory ? 3 : 0,
//         backgroundColor: isSubcategory ? 'grey.50' : 'white'
//       }}
//     >
//       <CardContent>
//         <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
//               {category.icon ? getIconComponent(category.icon) : <Category />}
//             </Avatar>
//             <Box>
//               <Typography variant={isSubcategory ? "subtitle1" : "h6"} fontWeight="bold">
//                 {category.name}
//               </Typography>
//               {category.description && (
//                 <Typography variant="body2" color="text.secondary">
//                   {category.description}
//                 </Typography>
//               )}
//               <Chip
//                 label={isSubcategory ? "Sous-catégorie" : "Catégorie principale"}
//                 size="small"
//                 color={isSubcategory ? "secondary" : "primary"}
//                 variant="outlined"
//                 sx={{ mt: 0.5 }}
//               />
//             </Box>
//           </Box>
//           <Box>
//             <Tooltip title="Modifier">
//               <IconButton onClick={() => handleOpenDialog(category)} color="primary">
//                 <Edit />
//               </IconButton>
//             </Tooltip>
//             <Tooltip title="Supprimer">
//               <IconButton onClick={() => handleDelete(category)} color="error">
//                 <Delete />
//               </IconButton>
//             </Tooltip>
//             {!isSubcategory && (
//               <Tooltip title="Ajouter une sous-catégorie">
//                 <IconButton
//                   onClick={() => handleOpenDialog(null, category.id)}
//                   color="success"
//                 >
//                   <Add />
//                 </IconButton>
//               </Tooltip>
//             )}
//           </Box>
//         </Box>
//       </CardContent>
//     </Card>
//   );

//   if (loading) {
//     return <Typography>Chargement...</Typography>;
//   }

//   return (
//     <Box>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//         <Typography variant="h5" fontWeight="bold">
//           Gestion des Catégories
//         </Typography>
//         <Button
//           variant="contained"
//           startIcon={<Add />}
//           onClick={() => handleOpenDialog()}
//         >
//           Nouvelle Catégorie
//         </Button>
//       </Box>

//       {categories.length === 0 ? (
//         <Alert severity="info" sx={{ mt: 2 }}>
//           Aucune catégorie trouvée. Créez votre première catégorie pour commencer.
//         </Alert>
//       ) : (
//         <Box>
//           {categories.map(category => (
//             <Box key={category.id} sx={{ mb: 2 }}>
//               {renderCategoryCard(category)}
//               {category.subcategories && category.subcategories.length > 0 && (
//                 <Box sx={{ ml: 2, mt: 1 }}>
//                   {category.subcategories.map(subcategory =>
//                     <Box key={subcategory.id}>
//                       {renderCategoryCard(subcategory, true)}
//                     </Box>
//                   )}
//                 </Box>
//               )}
//             </Box>
//           ))}
//         </Box>
//       )}

//       {/* Dialog pour créer/modifier une catégorie */}
//       <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
//         <DialogTitle>
//           {editingCategory
//             ? 'Modifier la catégorie'
//             : formData.parent_id
//               ? 'Nouvelle sous-catégorie'
//               : 'Nouvelle catégorie'
//           }
//         </DialogTitle>
//         <DialogContent>
//           <Box sx={{ pt: 1 }}>
//             {formData.parent_id && !editingCategory && (
//               <Alert severity="info" sx={{ mb: 2 }}>
//                 Cette catégorie sera créée comme sous-catégorie de : <strong>
//                   {categories.find(cat => cat.id === formData.parent_id)?.name || 'Catégorie parente'}
//                 </strong>
//               </Alert>
//             )}

//             <TextField
//               fullWidth
//               label="Nom de la catégorie"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               margin="normal"
//               required
//             />

//             <TextField
//               fullWidth
//               label="Description"
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               margin="normal"
//               multiline
//               rows={3}
//             />

//             <FormControl fullWidth margin="normal">
//               <InputLabel>Icône</InputLabel>
//               <Select
//                 value={formData.icon}
//                 onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
//                 label="Icône"
//               >
//                 <MenuItem key="no-icon" value="">
//                   <em>Aucune icône</em>
//                 </MenuItem>
//                 {availableIcons.map((icon) => (
//                   <MenuItem key={icon.name} value={icon.name}>
//                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//                       {getIconComponent(icon.name)}
//                       {icon.label}
//                     </Box>
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>

//             {formData.parent_id && (
//               <Alert severity="info" sx={{ mt: 2 }}>
//                 Cette catégorie sera créée comme sous-catégorie.
//               </Alert>
//             )}
//           </Box>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
//             Annuler
//           </Button>
//           <Button
//             onClick={handleSave}
//             variant="contained"
//             startIcon={<Save />}
//             disabled={!formData.name.trim()}
//           >
//             Sauvegarder
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

const Admin = () => {
  // const [tabValue, setTabValue] = useState(0);

  // const handleTabChange = (event, newValue) => {
  //   setTabValue(newValue);
  // };
  const location = useLocation();

  const tabValue =
    location.pathname === "/admin"
      ? "/admin/config"
      : location.pathname;

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <AdminPanelSettings sx={{ mr: 1, verticalAlign: "middle" }} />
          Administration
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Paramétrage et configuration du système
        </Typography>
      </Box>

      <Paper sx={{ width: "100%" }}>
        <Tabs
          value={tabValue}
          // onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            // background: 'linear-gradient(135deg, #42a5f5 0%, #1e88e5 50%, #1976d2 100%)',
            // borderRadius: 1,
            // boxShadow: '0 4px 20px rgba(66, 165, 245, 0.3)',
            "& .MuiTab-root": {
              // color: 'rgba(255,255,255,0.8)',
              fontWeight: 500,
              borderRadius: "8px",
              margin: "4px",
              transition: "all 0.2s ease-in-out",
              "&.Mui-selected": {
                // color: '#ffffff',
                backgroundColor: "rgba(255,255,255,0.25)",
                fontWeight: 700,
                boxShadow: "0 2px 8px rgba(255,255,255,0.3)",
              },
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.15)",
                transform: "translateY(-1px)",
              },
            },
          }}
        >
          <Tab
            component={Link}
            label="Configuration Logiciel"
            to="/admin/config"
            value="/admin/config"

            icon={<Settings />}
            iconPosition="start"
            sx={{
              minHeight: 72,
              // '&.Mui-selected': {
              //   color: '#ffffff',
              //   backgroundColor: 'rgba(255,255,255,0.25)',
              //   fontWeight: 700,
              //   boxShadow: '0 4px 12px rgba(255,255,255,0.3)',
              // }
            }}
          />
          <Tab
            component={Link}
            label="Suivi des Ventes"
            value="/admin/sales"
            to="/admin/sales"
            icon={<Assessment />}
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
          <Tab
            component={Link}
            label="Dons"
            value="/admin/don"
            to="/admin/don"
            icon={<CardGiftcard />}
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
          {/* <Tab
            component={Link}
            label="Logistique"
            value="/admin/logistic"
            to="/admin/logistic"
            icon={<LocalShipping />}
            iconPosition="start"
            sx={{ minHeight: 72 }}
          /> */}
          <Tab
            component={Link}
            label="Planning"
            value="/admin/planning"
            to="/admin/planning"
            icon={<Schedule />}
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
          <Tab
            component={Link}
            label="Utilisateurs"
            value="/admin/users"
            to="/admin/users"
            icon={<People />}
            iconPosition="start"
            sx={{ minHeight: 72 }}
          />
        </Tabs>

        <Divider />

        <Box sx={{ p: 3 }}>
          {/* FIXME y'a une erreur quand on essai d'aller juste sur /admin */}
          <Routes>
            <Route index element={<Navigate to="/admin/config" replace />} />
            <Route path="config/*" element={<ConfigurationTab />} />
            <Route path="sales" element={<SalesAnalyticsTab />} />
            <Route path="don" element={<DonationsTab />} />
            <Route path="logistic" element={<LogisticsTab />} />
            <Route path="planning" element={<Planning />} />
            <Route path="users" element={<UsersTab />} />
          </Routes>
        </Box>
      </Paper>
    </Container>
  );
};

// // Composant pour l'onglet Configuration Logiciel
// const ConfigurationTab = () => {
//   const [tabValue, setTabValue] = useState(0);

//   return (
//     <Box>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//         <Typography variant="h5" fontWeight="bold">
//           ⚙️ Configuration Logiciel
//         </Typography>
//       </Box>

//       <Tabs
//         value={tabValue}
//         onChange={(e, newValue) => setTabValue(newValue)}
//         sx={{
//           mb: 3,
//           backgroundColor: '#f8f9fa',
//           borderRadius: 2,
//           border: '1px solid #e0e0e0',
//           '& .MuiTab-root': {
//             color: '#495057',
//             fontWeight: 500,
//             textTransform: 'none',
//             minHeight: 60,
//             '&.Mui-selected': {
//               color: '#2e7d32',
//               backgroundColor: '#d4edda',
//               fontWeight: 600,
//               borderBottom: '3px solid #2e7d32',
//             },
//             '&:hover': {
//               backgroundColor: '#e9ecef',
//               color: '#2e7d32',
//             }
//           }
//         }}
//       >
//         <Tab
//           label="Catégories"
//           icon={<Category />}
//           iconPosition="start"
//           sx={{ '&.Mui-selected': { color: '#1976d2', backgroundColor: '#e3f2fd' } }}
//         />
//         <Tab
//           label="Lieux de collecte"
//           icon={<LocationOn />}
//           iconPosition="start"
//           sx={{ '&.Mui-selected': { color: '#f57c00', backgroundColor: '#fff3e0' } }}
//         />
//         <Tab
//           label="Magasins"
//           icon={<Store />}
//           iconPosition="start"
//           sx={{ '&.Mui-selected': { color: '#7b1fa2', backgroundColor: '#f3e5f5' } }}
//         />
//         <Tab
//           label="Éco-organismes"
//           icon={<Nature />}
//           iconPosition="start"
//           sx={{ '&.Mui-selected': { color: '#388e3c', backgroundColor: '#e8f5e8' } }}
//         />
//         <Tab
//           label="Employés"
//           icon={<People />}
//           iconPosition="start"
//           sx={{ '&.Mui-selected': { color: '#d32f2f', backgroundColor: '#ffebee' } }}
//         />
//         <Tab
//           label="Tâches"
//           icon={<Work />}
//           iconPosition="start"
//           sx={{ '&.Mui-selected': { color: '#f57c00', backgroundColor: '#fff3e0' } }}
//         />
//         <Tab
//           label="Horaires des magasins"
//           icon={<AccessTime />}
//           iconPosition="start"
//           sx={{ '&.Mui-selected': { color: '#9c27b0', backgroundColor: '#f3e5f5' } }}
//         />
//         <Tab
//           label="Horaires de présence"
//           icon={<Schedule />}
//           iconPosition="start"
//           sx={{ '&.Mui-selected': { color: '#f57c00', backgroundColor: '#fff3e0' } }}
//         />
//       </Tabs>

//       <Box sx={{ p: 3 }}>
//         {tabValue === 0 && <CategoriesTab />}
//         {tabValue === 1 && <CollectionPointsTab />}
//         {tabValue === 2 && <StoresTab />}
//         {tabValue === 3 && <EcoOrganismsTab />}
//         {tabValue === 4 && <EmployeeManagement />}
//         {tabValue === 5 && <TaskManagement />}
//         {tabValue === 6 && <StoreHoursTab />}
//         {tabValue === 7 && <CollectionPointPresenceTab />}
//       </Box>
//     </Box>
//   );
// };

// // Composant pour l'onglet Logistique
// const LogisticsTab = () => {
//   return (
//     <Box>
//       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
//         <Typography variant="h5" fontWeight="bold">
//           🚚 Gestion Logistique
//         </Typography>
//       </Box>

//       <Grid container spacing={3}>
//         {/* Planning Collectes */}
//         <Grid size={{ xs: 12, md: 6}}>
//           <Card>
//             <CardContent>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <Schedule sx={{ mr: 1, color: 'primary.main' }} />
//                 <Typography variant="h6">
//                   Planning Collectes
//                 </Typography>
//               </Box>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                 Gérer les plannings de collecte et les créneaux horaires
//               </Typography>
//               <Button
//                 variant="contained"
//                 startIcon={<Schedule />}
//                 onClick={() => window.location.href = '/collection-schedule'}
//                 fullWidth
//               >
//                 Accéder au Planning
//               </Button>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Bordereaux */}
//         <Grid size={{ xs: 12, md: 6}}>
//           <Card>
//             <CardContent>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <Receipt sx={{ mr: 1, color: 'primary.main' }} />
//                 <Typography variant="h6">
//                   Bordereaux
//                 </Typography>
//               </Box>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                 Consulter et gérer les bordereaux de collecte
//               </Typography>
//               <Button
//                 variant="contained"
//                 startIcon={<Receipt />}
//                 onClick={() => window.location.href = '/collection-receipts'}
//                 fullWidth
//               >
//                 Voir les Bordereaux
//               </Button>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Collectes */}
//         <Grid size={{ xs: 12, md: 6}}>
//           <Card>
//             <CardContent>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <LocalShipping sx={{ mr: 1, color: 'primary.main' }} />
//                 <Typography variant="h6">
//                   Collectes
//                 </Typography>
//               </Box>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                 Suivre et gérer les collectes en cours
//               </Typography>
//               <Button
//                 variant="contained"
//                 startIcon={<LocalShipping />}
//                 onClick={() => window.location.href = '/collections'}
//                 fullWidth
//               >
//                 Gérer les Collectes
//               </Button>
//             </CardContent>
//           </Card>
//         </Grid>

//         {/* Statistiques Logistiques */}
//         <Grid size={{ xs: 12, md: 6}}>
//           <Card>
//             <CardContent>
//               <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//                 <Assessment sx={{ mr: 1, color: 'primary.main' }} />
//                 <Typography variant="h6">
//                   Statistiques Logistiques
//                 </Typography>
//               </Box>
//               <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                 Consulter les statistiques et rapports logistiques
//               </Typography>
//               <Button
//                 variant="outlined"
//                 startIcon={<Assessment />}
//                 onClick={() => window.location.href = '/dashboard'}
//                 fullWidth
//               >
//                 Voir les Statistiques
//               </Button>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     </Box>
//   );
// };

export default Admin;
