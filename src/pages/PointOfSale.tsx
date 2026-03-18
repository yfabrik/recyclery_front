import { zodResolver } from "@hookform/resolvers/zod";
import {
  AccountBalance,
  Add,
  Backpack,
  Close,
  Euro,
  Loyalty,
  Payment,
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
  MenuItem,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ActiveSessionInfos } from "../components/ActiveSessionInfos";
import { DialogCloseCaisse } from "../components/DialogCloseCaisse";
import {
  schema,
  type CartItem,
  type Schema as CartSchema,
} from "../components/forms/cartSchema";
import {
  type Schema as CloseCaisseSchema
} from "../components/forms/CloseCaisseForm";
import { FormInput, FormSelect } from "../components/forms/FormBase";
import {
  ManualItemForm,
  type Schema as ManualItemSchema,
} from "../components/forms/ManualItemForm";
import {
  OpenCaisseForm,
  type Schema as OpenCaisseSchema,
} from "../components/forms/OpenCaisseForm";
import { useAuth } from "../contexts/AuthContext";
import type { TransactionModel } from "../interfaces/Models";
import { fetchCategories as fcat } from "../services/api/categories";
import { getItemFromBarcode } from "../services/api/labeledItems";
import {
  OpenCaisse,
  closeCaisse,
  getActiveCaisses,
} from "../services/api/store";
import { createSell } from "../services/api/transactions";
import { formatCurrency, getCartLinePrice, getCartTotal } from "../services/cartService";
import { printReceipt } from "../services/printService";
const PointOfSale = () => {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  // Dialogs
  const [openSessionDialog, setOpenSessionDialog] = useState(false);
  const [closeSessionDialog, setCloseSessionDialog] = useState(false);
  // const [paymentDialog, setPaymentDialog] = useState(false);
  const [manualItemDialog, setManualItemDialog] = useState(false);

  const [scanInput, setScanInput] = useState("");



  const form = useForm({
    defaultValues: {
      cart: [],
      payment_method: "cash",
      payment_amount: 0,
      customer_postal_code: "",
    },
    resolver: zodResolver(schema),
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "cart",
  });

  /** Typed as CartItem[] so item fields (e.g. subcategory_id) are not inferred as unknown from empty defaultValues. */
  const cart = form.watch("cart") as CartSchema["cart"];
  const payment_amount = form.watch("payment_amount") as number;

  const [carts, setCarts] = useState<CartSchema["cart"][]>([[]]);

  const addCart = () => {
    setCarts((prev) => [...prev, [] as CartSchema["cart"]]);
  };

  const removeCart = (index: number) => {
    if (carts.length <= 1) return;
    const currentCart = form.getValues("cart") as CartSchema["cart"];
    const nextCarts = carts
      .map((c, i) => (i === tabValue ? currentCart : c))
      .filter((_, i) => i !== index);
    const newTabValue =
      index === tabValue
        ? Math.min(index, nextCarts.length - 1)
        : index < tabValue
          ? tabValue - 1
          : tabValue;
    setCarts(nextCarts);
    setTabValue(newTabValue);
    form.reset(
      { ...form.getValues(), cart: nextCarts[newTabValue] },
      { keepDefaultValues: true }
    );
  };

  const changeCart = (newIndex: number) => {
    if (newIndex === tabValue) return;
    const currentCart = form.getValues("cart") as CartSchema["cart"];
    setCarts((prev) => {
      const next = [...prev];
      next[tabValue] = currentCart;
      return next;
    });
    setTabValue(newIndex);
    form.reset(
      { ...form.getValues(), cart: carts[newIndex] },
      { keepDefaultValues: true }
    );
  }
  const queryClient = useQueryClient();

  const activeSession = useQuery({
    queryKey: ["activeSession"],
    queryFn: () =>
      getActiveCaisses().then((response) => response.data?.session ?? null),
  });

  const categories = useQuery({
    queryKey: [
      "categories",
      { include: ["category", "promo"], only_category: true, sell: true },
    ],
    queryFn: () =>
      fcat({ include: ["category", "promo"], only_category: true, sell: true }).then(
        (response) => response.data.categories,
      ),
  });

  const openSession = useMutation({
    mutationFn: (data: {
      store_id: number;
      opening_amount: number;
      cash_register_id: number;
    }) => OpenCaisse(data),
    onSuccess: (data) => {
      toast.success("Session ouverte avec succès");
      setOpenSessionDialog(false);
      queryClient.invalidateQueries({ queryKey: ["activeSession"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de l'ouverture");
    },
  });
  const closeSession = useMutation({
    mutationFn: (data: { id: number; data: { closing_amount: number } }) =>
      closeCaisse(data.id, data.data),
    onSuccess: (data) => {
      console.log("closeSession success", data);
      const { expected_amount, difference_amount } = data.data;

      let message = "Session fermée avec succès";
      if (Math.abs(difference_amount) > 0.01) {
        message += `\nÉcart: ${difference_amount > 0 ? "+" : ""}${formatCurrency(difference_amount)}`;
      }

      toast.success(message);
      setCloseSessionDialog(false);
      form.reset({ cart: [] });
      queryClient.invalidateQueries({ queryKey: ["activeSession"] });
    },
    onError: (error) => {
      toast.error("Erreur lors de la fermeture de la session");
    },
  });

  const handleOpenSession = (data: OpenCaisseSchema) => {
    openSession.mutate(data);
  };
  const handleCloseSession = (data: CloseCaisseSchema) => {
    if (activeSession.data)
      //TODO faire sans ou raise error ??? use type never ?
      closeSession.mutate({ id: activeSession.data.id, data: data });
  };
  const handleSell = useMutation({
    mutationFn: (data: TransactionModel) => createSell(data),
    onSuccess: (data, variables) => {
      toast.success("Vente enregistrée avec succès");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      // setPaymentDialog(false);
      // setPaymentData({
      //   payment_method: "cash",
      //   payment_amount: "0",
      //   customer_name: "",
      //   customer_email: "",
      // });
      if (window.confirm("Imprimer le ticket de caisse ?")) {
        //TODO should be detached from the request
        if (activeSession.data)
          printReceipt(
            data.data.data.sale,
            cart as CartItem[],
            activeSession.data,
            user!,
          );
      }
      form.reset({ cart: [] });
    },
    onError: (error) => {
      toast.error("Erreur lors de l'enregistrement de la vente");
    },
  });

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
      const existingItem = cart.findIndex(
        (cartItem) => cartItem.barcode === item.barcode,
      );

      if (existingItem !== -1) {
        update(existingItem, {
          ...cart[existingItem],
          quantity: cart[existingItem].quantity + 1,
        });
      } else {
        const category = categories.data?.find(
          (cat) => cat.id === item.category_id,
        );
        const subCategory = categories.data?.find(
          (cat) => cat.id === item.subcategory_id,
        );
        const source = subCategory ?? category;

        const category_name = category?.name ?? "";
        const subcategory_name = subCategory?.name ?? "";
        let itemName = category_name || "Article";
        if (subcategory_name) {
          itemName = `${category_name} (${subcategory_name})`;
        }

        append({
          ...item,
          quantity: 1,
          name: itemName,
          category_name,
          subcategory_name,
          promotion: (category?.Promotions?.reduce((prev, current) => prev += current.promotionValue, 0) || 0) + (subCategory?.Promotions?.reduce((prev, current) => prev += current.promotionValue, 0) || 0),
          bundlePrice: source?.bundlePrice,
          bundleQuantity: source?.bundleQuantity
        }satisfies CartItem);
      }

      setScanInput("");
      toast.success(`${item.barcode} ajouté au panier`);
    } catch (error) {
      if (error.response?.status === 404) {
        toast.error("Article non trouvé");
      } else {
        toast.error("Erreur lors du scan");
      }
    }
  };

  const handleAddManualItem = (data: ManualItemSchema) => {
    // Générer un code-barres temporaire pour l'article manuel
    const tempBarcode = `MANUAL${Date.now()}`;
    ////// ce bloc c'est le meme que add item with barcode///////////
    const selectedCategory = categories.data?.find(
      (cat) => cat.id == data.category_id,
    );
    const selectedSubcategory = selectedCategory?.subcategories?.find(
      (cat) => cat.id == data.subcategory_id,
    );

    // Générer un nom basé sur la catégorie et sous-catégorie
    let itemName = selectedCategory?.name || "Article";
    if (selectedSubcategory) {
      itemName = `${selectedSubcategory.name} (${selectedCategory?.name})`;
    }
    const source = selectedSubcategory ?? selectedCategory;
    if (source?.priceBasedOnWeight) data.price = data.price * data.weight;

    ////////////

    const manualItem = {
      // id: tempBarcode,
      barcode: tempBarcode,
      category_id: data.category_id,
      subcategory_id: data.subcategory_id,
      name: itemName,
      description: data.description || "",
      category_name: selectedCategory?.name || "",
      subcategory_name: selectedSubcategory?.name || "",
      price: data.price,
      weight: data.weight,
      quantity: 1,
      promotion: data.promotion,
      bundlePrice: source?.bundlePrice,
      bundleQuantity: source?.bundleQuantity

      // total_price: parseFloat(data.price),
      // is_manual: true, // Flag pour identifier les articles manuels
    } satisfies CartItem;

    append(manualItem);
    // setCart((prev) => [...prev, manualItem]);

    setManualItemDialog(false);
    toast.success(`${itemName} ajouté au panier`);
  };

  const handleValidateCart = async (data: CartSchema) => {

    const total = getCartTotal(data.cart);
    const paymentAmount = data.payment_amount;

    if (activeSession.data) {
      const transactionData = {
        cash_session_id: activeSession.data.id,
        total_amount: total,
        payment_method: data.payment_method,
        payment_amount: paymentAmount,
        change_amount: paymentAmount - total,
        customer_postal_code: data.customer_postal_code,

        items: cart.map((item) => ({
          ...item,
          total_price: item.quantity * item.price,

        })),
      } satisfies Omit<
        TransactionModel,
        "id" | "createdAt" | "updatedAt" | "transactionType" | "status" | "created_by" | "items"
      > & {
        items: (CartItem & { total_price: number })[];
      };
      handleSell.mutate(transactionData);

    }

  };

  if (!activeSession.data) {
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
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenSessionDialog(false)}>Annuler</Button>
            <Button type="submit" form="OpenCaisseForm" variant="contained">
              Ouvrir la Caisse
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mb: 4 }}>
      {/* En-tête de session */}
      <ActiveSessionInfos activeSession={activeSession.data} setCloseSessionDialog={setCloseSessionDialog} />
      {/* <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container alignItems="center" justifyContent="space-between">
          <Grid>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <PosIcon color="primary" />
              <Box>
                <Typography variant="h6">
                  {activeSession.data?.Recyclery?.name} -{" "}
                  {activeSession.data?.CashRegister?.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Session: {activeSession.data?.id} | Ouvert:{" "}
                  {new Date(activeSession.data?.createdAt).toLocaleString()} | Fonds de caisse: {formatCurrency(activeSession.data.opening_amount)}
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
      </Paper> */}
      <form id="cartForm" onSubmit={form.handleSubmit(handleValidateCart,(err)=>console.error(err))}>
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
                  disabled={scanInput.length < 1}
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
            <Tabs value={tabValue} onChange={(_, val) => changeCart(val as number)}>
              {carts.map((_, index) => (
                <Tab
                  key={index}
                  label={
                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                      Panier {index + 1}
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCart(index);
                        }}
                        disabled={carts.length <= 1}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  }
                />
              ))}
              <IconButton onClick={() => addCart()}>
                <Add />
              </IconButton>
            </Tabs>
            {/* Panier */}
            {/* <form id="cartForm" onSubmit={form.handleSubmit(handleValidateCart)}> */}
            <Paper sx={{ p: 2 }}>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <ShoppingCart />
                Panier ({fields.length} article{fields.length > 1 ? "s" : ""})
              </Typography>

              {fields.length === 0 ? (
                <Alert severity="info">
                  Le panier est vide. Scannez des articles pour commencer.
                </Alert>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Article</TableCell>
                        <TableCell>Poids unitaire</TableCell>
                        <TableCell>Prix unitaire</TableCell>
                        <TableCell>Quantité</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {fields.map((item, index) => (
                        <TableRow key={item.id}>
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
                                {isNaN(+item.barcode) && (
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
                              {(item.category_name ||
                                item.subcategory_name) && (
                                  <Typography
                                    variant="body2"
                                    color="textSecondary"
                                  >
                                    {item.category_name}
                                    {item.subcategory_name &&
                                      ` > ${item.subcategory_name}`}
                                  </Typography>
                                )}
                            </Box>
                          </TableCell>
                          <TableCell>{item.weight.toFixed(2)}Kg</TableCell>
                          <TableCell>
                            {formatCurrency(item.price)}
                            {item.promotion != 0 && (
                              <Chip
                                color="secondary"
                                icon={<Loyalty />}
                                sx={{
                                  marginLeft: 1,
                                }}
                                label={`-${item.promotion}%`}
                                size="small"
                              />
                            )}
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
                                onClick={() => {
                                  return item.quantity - 1 <= 0
                                    ? remove(index)
                                    : update(index, {
                                      ...item,
                                      quantity: item.quantity - 1,
                                    });
                                }}
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
                                  update(index, {
                                    ...item,
                                    quantity: item.quantity + 1,
                                  })
                                }
                              >
                                <Add />
                              </IconButton>
                              {item.bundleQuantity && item.bundleQuantity != 0 && item.bundleQuantity != 1 && item.quantity >= item.bundleQuantity &&
                                <Chip
                                  color="secondary"
                                  icon={<Backpack />}
                                  sx={{
                                    marginLeft: 1,
                                  }}
                                  label={`${Math.trunc(item.quantity / item.bundleQuantity)} pack`}
                                  size="small"
                                />
                              }
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight="bold">
                              {formatCurrency(getCartLinePrice(item as CartItem)) /*FIXME  as cartItem devrait pas etre la */}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => remove(index)}
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
            {/* </form> */}
          </Grid>

          {/* Résumé et paiement */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <Paper sx={{ p: 2,/* position: "sticky",*/ top: 20 }}>
              <Typography variant="h6" gutterBottom>
                Résumé de la Commande
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>Types d'articles:</Typography>
                <Typography>{cart.length}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>Total d'articles:</Typography>
                <Typography>
                  {cart.reduce((prev, current) => (prev += current.quantity), 0)}
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography>Poids</Typography>
                <Typography>
                  {cart.reduce(
                    (prev, current) =>
                      (prev += current.weight * current.quantity),
                    0,
                  )}{" "}
                  Kg
                </Typography>
              </Box>

              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Total:</Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                  {formatCurrency(getCartTotal(cart))}
                </Typography>
              </Box>
              {/* 
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={<Payment />}
              // type="submit"
              // form="cartForm"
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
            </Button> */}
            </Paper>

            <Paper sx={{ p: 2, mt: 2 }}>
              <Grid container spacing={2} sx={{ mt: 1 }}>


                <Grid size={{ xs: 12 }}>
                  <FormSelect
                    label="Mode de paiement"
                    control={form.control}
                    name="payment_method"
                  >
                    <MenuItem value="cash">Espèces</MenuItem>
                    <MenuItem value="card">Carte bancaire</MenuItem>
                    <MenuItem value="check">Chèque</MenuItem>
                  </FormSelect>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <FormInput
                    label="Montant payé (€)"
                    control={form.control}
                    name="payment_amount"
                    extra={{
                      type: "number",
                      slotProps: {
                        input: {
                          startAdornment: (
                            <Euro sx={{ mr: 1, color: "text.secondary" }} />
                          ),
                        },
                      },
                    }}
                  />
                </Grid>

                {payment_amount > getCartTotal(cart) && (
                  <Grid size={{ xs: 12 }}>
                    <Alert severity="info">
                      Rendu à donner: {formatCurrency(payment_amount - getCartTotal(cart))}
                    </Alert>
                  </Grid>
                )}

                <Grid size={{ xs: 12, md: 6 }}>
                  <FormInput control={form.control} label="Code Postal" name="customer_postal_code" />

                </Grid>
                <Grid size={{ xs: 12 }}>

                </Grid>

              </Grid>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Payment />}
                type="submit"

                disabled={cart.length === 0}
                sx={{ mb: 2 }}
              >
                Encaisser
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </form>
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
            categories={categories.data || []}
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

      {/* Dialog de fermeture de session */}
      <DialogCloseCaisse
        closeSessionDialog={closeSessionDialog}
        setCloseSessionDialog={setCloseSessionDialog}
        currentSession={activeSession.data}
        handleCloseSession={handleCloseSession}
      />
      {/* <Dialog
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
      </Dialog> */}

      {/* <Dialog
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Annuler</Button>
          <Button
            type="submit"
            form="encaissementForm"
            variant="contained"
            loading={handleSell.isPending}
            disabled={parseFloat(paymentData.payment_amount) < getCartTotal()}
          >
            {handleSell.isPending ? "Traitement..." : "Valider le Paiement"}
          </Button>
        </DialogActions>
      </Dialog> */}
    </Container>
  );
};

export default PointOfSale;
