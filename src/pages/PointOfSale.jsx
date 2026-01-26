import {
  AccountBalance,
  Add,
  Close,
  Payment,
  PointOfSale as PosIcon,
  QrCodeScanner,
  Remove,
  ShoppingCart
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { CloseCaisseForm } from "../components/forms/CloseCaisseForm";
import { EncaissementForm } from "../components/forms/EncaissementForm";
import { ManualItemForm } from "../components/forms/ManualItemForm";
import { OpenCaisseForm } from "../components/forms/OpenCaisseForm";
import { useAuth } from "../contexts/AuthContext";
import { fetchCategories as fcat } from "../services/api/categories";
import { getItemFromBarcode } from "../services/api/labeledItems";
import {
  OpenCaisse,
  closeCaisse,
  fetchStores as fStores,
  getActiveCaisses
} from "../services/api/store";
import { createSell } from "../services/api/transactions";
const PointOfSale = () => {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [stores, setStores] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dialogs
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [closeSessionDialog, setCloseSessionDialog] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [manualItemDialog, setManualItemDialog] = useState(false);


  const [scanInput, setScanInput] = useState("");
  const [paymentData, setPaymentData] = useState({
    payment_method: "cash",
    payment_amount: "0",
    customer_name: "",
    customer_email: "",
  });


  useEffect(() => {
    checkActiveSession();
    fetchStores();
    fetchCategories();
  }, []);

  const checkActiveSession = async () => {
    try {
      const response = await getActiveCaisses();
      if (response.data.session) {
        setActiveSession(response.data.session);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification de session:", error);
    }
  };

  const fetchStores = async () => {
    try {
      const response = await fStores({ active: 1 });
      setStores(response.data.stores);
    } catch (error) {
      console.error("Erreur lors du chargement des magasins:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fcat({ include: "Category", only_category: true });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };


  const handleOpenSession = async (data) => {
    try {
     
      const response = await OpenCaisse(data);

      toast.success("Session ouverte avec succès");
      setOpenSessionDialog(false);
      checkActiveSession();

    } catch (error) {
      console.error("Erreur lors de l'ouverture:", error);
      toast.error(error.response?.data?.error || "Erreur lors de l'ouverture");
    }
  };

 
  const handleCloseSession = async (data) => {
    try {
     
      const response = await closeCaisse(activeSession.id, data);

      const { expected_amount, difference_amount } = response.data;

      let message = "Session fermée avec succès";
      if (Math.abs(difference_amount) > 0.01) {
        message += `\nÉcart: ${difference_amount > 0 ? "+" : ""}${difference_amount.toFixed(2)}€`;
      }

      toast.success(message);
      setCloseSessionDialog(false);
      setActiveSession(null);
      setCart([]);

    } catch (error) {
      console.error("Erreur lors de la fermeture:", error);
      toast.error(error.response?.data?.error || "Erreur lors de la fermeture");
    }
  };

  const handleScanProduct = async () => {
    if (!scanInput.trim()) {
      toast.error("Veuillez saisir un code-barres");
      return;
    }

    try {
      const response = await getItemFromBarcode(scanInput);
      const item = response.data.item;

      if (item.status !== "available") {
        toast.error("Cet article n'est pas disponible à la vente");
        return;
      }

      // Ajouter au panier
      const existingItem = cart.find(
        (cartItem) => cartItem.barcode === item.barcode,
      );

      if (existingItem) {
        setCart((prev) =>
          prev.map((cartItem) =>
            cartItem.barcode === item.barcode
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem,
          ),
        );
      } else {
        setCart((prev) => [
          ...prev,
          {
            ...item,
            quantity: 1,
            total_price: parseFloat(item.price),
          },
        ]);
      }

      setScanInput("");
      toast.success(`${item.name} ajouté au panier`);
    } catch (error) {
      console.error("Erreur lors du scan:", error);
      if (error.response?.status === 404) {
        toast.error("Article non trouvé");
      } else {
        toast.error("Erreur lors du scan");
      }
    }
  };

  const updateCartItemQuantity = (barcode, newQuantity) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((item) => item.barcode !== barcode));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.barcode === barcode
            ? {
                ...item,
                quantity: newQuantity,
                total_price: parseFloat(item.price) * newQuantity,
              }
            : item,
        ),
      );
    }
  };

  const removeFromCart = (barcode) => {
    setCart((prev) => prev.filter((item) => item.barcode !== barcode));
  };

  const handleAddManualItem = (data) => {

    // Générer un code-barres temporaire pour l'article manuel
    const tempBarcode = `MANUAL${Date.now()}`;

    const selectedCategory = categories.find(
      (cat) => cat.id == data.category_id,
    );
    const selectedSubcategory = selectedCategory.subcategories.find(
      (cat) => cat.id == data.subcategory_id,
    );

    // Générer un nom basé sur la catégorie et sous-catégorie
    let itemName = selectedCategory?.name || "Article";
    if (selectedSubcategory) {
      itemName = `${selectedSubcategory.name} (${selectedCategory?.name})`;
    }

    const manualItem = {
      id: tempBarcode,
      barcode: tempBarcode,
      category_id: selectedCategory?.id,
      subcategory_id: selectedSubcategory?.id,
      name: itemName,
      description: data.description || "",
      category_name: selectedCategory?.name || "",
      subcategory_name: selectedSubcategory?.name || "",
      price: parseFloat(data.price),
      weight: data.weight ? parseFloat(data.weight) : null,
      quantity: 1,
      total_price: parseFloat(data.price),
      is_manual: true, // Flag pour identifier les articles manuels
    };

    setCart((prev) => [...prev, manualItem]);

    setManualItemDialog(false);
    toast.success(`${itemName} ajouté au panier`);
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + item.total_price, 0);
  };

  const handleProcessPayment = async (data) => {
    if (cart.length === 0) {
      toast.error("Le panier est vide");
      return;
    }

    const total = getCartTotal();
    const paymentAmount = parseFloat(data.payment_amount);

    if (paymentAmount < total) {
      toast.error("Le montant payé est insuffisant");
      return;
    }

    try {
      setLoading(true);

      // Créer la transaction
      const transactionData = {
        cash_session_id: activeSession.id,
        store_id: activeSession.store_id,
        total_amount: total,
        payment_method: data.payment_method,
        payment_amount: paymentAmount,
        change_amount: paymentAmount - total,
        customer_name: data.customer_name || null,
        customer_email: data.customer_email || null,
        items: cart.map((item) => ({
          labeled_item_id: item.is_manual ? null : item.id,
          barcode: item.barcode,
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity,
          total_price: item.total_price,
          is_manual: item.is_manual || false,
          category_id: item.category_id,
          subcategory_id: item.subcategory_id,
        })),
      };

      const response = await createSell(transactionData);

      toast.success("Vente enregistrée avec succès");

      // Reset
      setCart([]);
      setPaymentDialog(false);
      setPaymentData({
        payment_method: "cash",
        payment_amount: "0",
        customer_name: "",
        customer_email: "",
      });

      // Optionnel: imprimer le ticket
      if (window.confirm("Imprimer le ticket de caisse ?")) {
        printReceipt(response.data.transaction, cart, paymentAmount - total);
      }
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      toast.error("Erreur lors du paiement");
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = (transaction, items, change) => {
    const printWindow = window.open("", "", "width=400,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <title>Ticket de caisse</title>
          <style>
            body { font-family: monospace; margin: 20px; font-size: 12px; }
            .header { text-align: center; margin-bottom: 20px; }
            .line { border-bottom: 1px dashed #000; margin: 10px 0; }
            .total { font-weight: bold; font-size: 14px; }
            .right { text-align: right; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>${activeSession.store_name}</h2>
            <p>Ticket N°: ${transaction.transaction_number}</p>
            <p>Date: ${new Date().toLocaleString()}</p>
            <p>Caissier: ${user.username}</p>
          </div>
          
          <div class="line"></div>
          
          ${items
            .map(
              (item) => `
            <div style="display: flex; justify-content: space-between; margin: 5px 0;">
              <span>${item.name}</span>
              <span>${item.quantity} x ${parseFloat(item.price).toFixed(2)}€</span>
              <span class="right">${item.total_price.toFixed(2)}€</span>
            </div>
          `,
            )
            .join("")}
          
          <div class="line"></div>
          
          <div class="total">
            <div style="display: flex; justify-content: space-between;">
              <span>TOTAL:</span>
              <span>${getCartTotal().toFixed(2)}€</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Payé:</span>
              <span>${parseFloat(paymentData.payment_amount).toFixed(2)}€</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Rendu:</span>
              <span>${change.toFixed(2)}€</span>
            </div>
          </div>
          
          <div class="line"></div>
          <div style="text-align: center; margin-top: 20px;">
            <p>Merci de votre visite !</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  if (!activeSession) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <AccountBalance sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Point de Vente
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
            Aucune session de caisse active. Ouvrez une caisse pour commencer
            les ventes.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AccountBalance />}
            onClick={() => setOpenSessionDialog(true)}
          >
            Ouvrir une Caisse
          </Button>
        </Paper>
        {/* Dialog d'ouverture de session */}
        <Dialog
          open={openSessionDialog}
          onClose={() => setOpenSessionDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Ouverture de Caisse</DialogTitle>
          <DialogContent>
            <OpenCaisseForm
              formId="OpenCaisseForm"
              onSubmit={handleOpenSession}
              stores={stores}
              // cashRegisters={cashRegisters}
            />
            {/* <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Magasin</InputLabel>
                  <Select
                    value={sessionData.store_id}
                    label="Magasin"
                    onChange={(e) => handleStoreChange(e.target.value)}
                  >
                    {stores.map((store) => (
                      <MenuItem key={store.id} value={store.id}>
                        {store.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>Caisse</InputLabel>
                  <Select
                    value={sessionData.cash_register_id}
                    label="Caisse"
                    onChange={(e) =>
                      setSessionData((prev) => ({
                        ...prev,
                        cash_register_id: e.target.value,
                      }))
                    }
                    disabled={!sessionData.store_id}
                  >
                    {cashRegisters.map((register) => (
                      <MenuItem key={register.id} value={register.id}>
                        {register.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Fonds de caisse (€)"
                  value={sessionData.opening_amount}
                  onClick={() => setShowOpeningKeypad(true)}
                  sx={{
                    "& .MuiInputBase-input": {
                      cursor: "pointer",
                      backgroundColor: "#f8f9fa",
                    },
                  }}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <Euro sx={{ mr: 1, color: "text.secondary" }} />
                      ),
                      readOnly: true,
                      endAdornment: (
                        <InputAdornment position="end">
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setShowMoneyCounter(true)}
                            startIcon={<AttachMoney />}
                          >
                            Compteur
                          </Button>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes (optionnel)"
                  value={sessionData.notes}
                  onChange={(e) =>
                    setSessionData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                />
              </Grid>
            </Grid> */}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSessionDialog(false)}>Annuler</Button>
            <Button type="submit" form="OpenCaisseForm" variant="contained">
              Ouvrir la Caisse
            </Button>
          </DialogActions>
        </Dialog>
        {/* Pavé numérique pour fonds de caisse */}
        {/* <Dialog
          open={showOpeningKeypad}
          onClose={() => setShowOpeningKeypad(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: "center" }}>
            Fonds de caisse
          </DialogTitle>
          <DialogContent sx={{ p: 2 }}>
            <NumericKeypad
              value={sessionData.opening_amount || "0"}
              onChange={(value) =>
                setSessionData((prev) => ({ ...prev, opening_amount: value }))
              }
              onClose={() => setShowOpeningKeypad(false)}
              maxValue={99999}
              decimalPlaces={2}
              unit="€"
            />
          </DialogContent>
        </Dialog> */}
        {/* Dialog compteur de pièces et billets */}
        {/* <Dialog
          open={showMoneyCounter}
          onClose={() => setShowMoneyCounter(false)}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ textAlign: "center" }}>
            Comptage des fonds de caisse
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <MoneyCounter
              onTotalChange={handleMoneyCounterChange}
              initialAmount={parseFloat(sessionData.opening_amount) || 0}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setShowMoneyCounter(false)}>Annuler</Button>
            <Button
              onClick={() => setShowMoneyCounter(false)}
              variant="contained"
              startIcon={<CheckCircle />}
            >
              Valider le montant
            </Button>
          </DialogActions>
        </Dialog> */}
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* En-tête de session */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PosIcon color="primary" />
              <Box>
                <Typography variant="h6">
                  {activeSession?.Recyclery.name} -{" "}
                  {activeSession?.CashRegister.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Session: {activeSession.session_number} | Ouvert:{" "}
                  {new Date(activeSession.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Close />}
              onClick={() => setCloseSessionDialog(true)}
            >
              Fermer la Caisse
            </Button>
          </Grid>
        </Grid>
      </Paper>
      <Grid container spacing={2}>
        {/* Scanner et panier */}
        <Grid size={{ xs: 12, lg: 8 }}>
          {/* Scanner */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Ajouter Article
            </Typography>
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                placeholder="Scanner ou saisir le code-barres..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScanProduct()}
                slotProps={{
                  input: {
                    startAdornment: (
                      <QrCodeScanner sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleScanProduct}
                sx={{ minWidth: 100 }}
              >
                Scanner
              </Button>
            </Box>
            <Box sx={{ textAlign: "center" }}>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setManualItemDialog(true)}
                sx={{ minWidth: 200 }}
              >
                Article Manuel
              </Button>
            </Box>
          </Paper>

          {/* Panier */}
          <Paper sx={{ p: 2 }}>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <ShoppingCart />
              Panier ({cart.length} article{cart.length > 1 ? "s" : ""})
            </Typography>

            {cart.length === 0 ? (
              <Alert severity="info">
                Le panier est vide. Scannez des articles pour commencer.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Article</TableCell>
                      <TableCell>Prix unitaire</TableCell>
                      <TableCell>Quantité</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cart.map((item) => (
                      <TableRow key={item.barcode}>
                        <TableCell>
                          <Box>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography variant="body1" fontWeight="medium">
                                {item.name}
                              </Typography>
                              {item.is_manual && (
                                <Chip
                                  size="small"
                                  label="Manuel"
                                  color="info"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              {item.barcode}
                            </Typography>
                            {(item.category_name || item.subcategory_name) && (
                              <Typography variant="body2" color="textSecondary">
                                {item.category_name}
                                {item.subcategory_name &&
                                  ` > ${item.subcategory_name}`}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          {parseFloat(item.price).toFixed(2)}€
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.barcode,
                                  item.quantity - 1,
                                )
                              }
                            >
                              <Remove />
                            </IconButton>
                            <Typography
                              sx={{ minWidth: 30, textAlign: "center" }}
                            >
                              {item.quantity}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() =>
                                updateCartItemQuantity(
                                  item.barcode,
                                  item.quantity + 1,
                                )
                              }
                            >
                              <Add />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight="bold">
                            {item.total_price.toFixed(2)}€
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removeFromCart(item.barcode)}
                          >
                            <Close />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>

        {/* Résumé et paiement */}
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 2, position: "sticky", top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Résumé de la Commande
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>Articles:</Typography>
              <Typography>{cart.length}</Typography>
            </Box>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6" color="primary">
                {getCartTotal().toFixed(2)}€
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Payment />}
              onClick={() => {
                setPaymentData((prev) => ({
                  ...prev,
                  payment_amount: getCartTotal().toString(),
                }));
                setPaymentDialog(true);
              }}
              disabled={cart.length === 0}
              sx={{ mb: 2 }}
            >
              Encaisser
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" color="textSecondary">
              Session en cours
            </Typography>
            <Typography variant="body2">
              Fonds de caisse:{" "}
              {parseFloat(activeSession.opening_amount).toFixed(2)}€
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      {/* Dialog d'article manuel */}
      <Dialog
        open={manualItemDialog}
        onClose={() => setManualItemDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Ajouter un Article Manuel</DialogTitle>
        <DialogContent>
          <ManualItemForm
            formId="manualItemForm"
            categories={categories}
            onSubmit={handleAddManualItem}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setManualItemDialog(false)}>Annuler</Button>
          <Button
            type="submit"
            form="manualItemForm"
            variant="contained"
            // disabled={!manualItemData.category_id || !manualItemData.price}
          >
            Ajouter au Panier
          </Button>
        </DialogActions>
      </Dialog>
      {/* Pavé numérique pour poids manuel */}
      {/* <Dialog
        open={showManualWeightKeypad}
        onClose={() => setShowManualWeightKeypad(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          Poids de l'article
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <NumericKeypad
            value={manualItemData.weight || "0"}
            onChange={(value) =>
              setManualItemData((prev) => ({ ...prev, weight: value }))
            }
            onClose={() => setShowManualWeightKeypad(false)}
            maxValue={9999}
            decimalPlaces={1}
            unit="kg"
          />
        </DialogContent>
      </Dialog> */}
      {/* Pavé numérique pour prix manuel */}
      {/* <Dialog
        open={showManualPriceKeypad}
        onClose={() => setShowManualPriceKeypad(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>Prix de vente</DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <NumericKeypad
            value={manualItemData.price || "0"}
            onChange={(value) =>
              setManualItemData((prev) => ({ ...prev, price: value }))
            }
            onClose={() => setShowManualPriceKeypad(false)}
            maxValue={99999}
            decimalPlaces={2}
            unit="€"
          />
        </DialogContent>
      </Dialog> */}
      {/* Dialog de fermeture de session */}
      <Dialog
        open={closeSessionDialog}
        onClose={() => setCloseSessionDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Fermeture de Caisse</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Attention: Cette action fermera définitivement votre session de
            caisse.
          </Alert>
          <CloseCaisseForm
            formId="closeCaisseForm"
            onSubmit={handleCloseSession}
          />

          {/* <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Montant en caisse (€)"
                value={closingData.closing_amount}
                onClick={() => setShowClosingKeypad(true)}
                sx={{
                  "& .MuiInputBase-input": {
                    cursor: "pointer",
                    backgroundColor: "#f8f9fa",
                  },
                }}
                helperText="Comptez l'argent physiquement présent dans la caisse"
                slotProps={{
                  input: {
                    startAdornment: (
                      <Euro sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position="end">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setShowClosingMoneyCounter(true)}
                          startIcon={<AttachMoney />}
                        >
                          Compteur
                        </Button>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Notes de fermeture (optionnel)"
                value={closingData.notes}
                onChange={(e) =>
                  setClosingData((prev) => ({ ...prev, notes: e.target.value }))
                }
              />
            </Grid>
          </Grid> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCloseSessionDialog(false)}>Annuler</Button>
          <Button
            type="submit"
            form="closeCaisseForm"
            variant="contained"
            color="error"
          >
            Fermer la Caisse
          </Button>
        </DialogActions>
      </Dialog>
      {/* Pavé numérique pour fermeture */}
      {/* <Dialog
        open={showClosingKeypad}
        onClose={() => setShowClosingKeypad(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          Montant en caisse
        </DialogTitle>
        <DialogContent sx={{ p: 2 }}>
          <NumericKeypad
            value={closingData.closing_amount || "0"}
            onChange={(value) =>
              setClosingData((prev) => ({ ...prev, closing_amount: value }))
            }
            onClose={() => setShowClosingKeypad(false)}
            maxValue={99999}
            decimalPlaces={2}
            unit="€"
          />
        </DialogContent>
      </Dialog> */}
      {/* Dialog compteur de pièces et billets pour fermeture */}
      {/* <Dialog
        open={showClosingMoneyCounter}
        onClose={() => setShowClosingMoneyCounter(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: "center" }}>
          Comptage de fermeture de caisse
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <MoneyCounter
            onTotalChange={handleClosingMoneyCounterChange}
            initialAmount={ 0}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShowClosingMoneyCounter(false)}>
            Annuler
          </Button>
          <Button
            onClick={() => setShowClosingMoneyCounter(false)}
            variant="contained"
            startIcon={<CheckCircle />}
          >
            Valider le montant
          </Button>
        </DialogActions>
      </Dialog> */}
      {/* Dialog de paiement */}
      <Dialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Encaissement</DialogTitle>
        <DialogContent>
          <EncaissementForm
            formId="encaissementForm"
            onSubmit={handleProcessPayment}
            totalCart={getCartTotal()}
            defaultValues={paymentData}
          />
          {/* <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <Typography variant="h5" color="primary" textAlign="center">
                Total à encaisser: {getCartTotal().toFixed(2)}€
              </Typography>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Mode de paiement</InputLabel>
                <Select
                  value={paymentData.payment_method}
                  label="Mode de paiement"
                  onChange={(e) =>
                    setPaymentData((prev) => ({
                      ...prev,
                      payment_method: e.target.value,
                    }))
                  }
                >
                  <MenuItem value="cash">Espèces</MenuItem>
                  <MenuItem value="card">Carte bancaire</MenuItem>
                  <MenuItem value="check">Chèque</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="Montant payé (€)"
                value={paymentData.payment_amount}
                onChange={(e) =>
                  setPaymentData((prev) => ({
                    ...prev,
                    payment_amount: e.target.value,
                  }))
                }
                type="number"
                slotProps={{
                  input: {
                    startAdornment: (
                      <Euro sx={{ mr: 1, color: "text.secondary" }} />
                    ),
                  },

                  htmlInput: { min: 0, step: 0.01 },
                }}
              />
            </Grid>

            {parseFloat(paymentData.payment_amount) > getCartTotal() && (
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  Rendu à donner:{" "}
                  {(
                    parseFloat(paymentData.payment_amount) - getCartTotal()
                  ).toFixed(2)}
                  €
                </Alert>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Nom du client (optionnel)"
                value={paymentData.customer_name}
                onChange={(e) =>
                  setPaymentData((prev) => ({
                    ...prev,
                    customer_name: e.target.value,
                  }))
                }
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email du client (optionnel)"
                type="email"
                value={paymentData.customer_email}
                onChange={(e) =>
                  setPaymentData((prev) => ({
                    ...prev,
                    customer_email: e.target.value,
                  }))
                }
              />
            </Grid>
          </Grid> */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Annuler</Button>
          <Button
            type="submit"
            form="encaissementForm"
            variant="contained"
            disabled={
              loading || parseFloat(paymentData.payment_amount) < getCartTotal()
            }
          >
            {loading ? "Traitement..." : "Valider le Paiement"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PointOfSale;
