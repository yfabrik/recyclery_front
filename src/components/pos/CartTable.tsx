import { Add, Backpack, Close, Loyalty, Remove, ShoppingCart } from "@mui/icons-material";
import {
  Alert,
  Box,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { FieldArrayWithId, UseFieldArrayRemove, UseFieldArrayUpdate } from "react-hook-form";
import type { CartFormValues, CartItem } from "../forms/cartSchema";
import {
  formatCurrency,
  formatWeight,
  getCartLinePrice,
} from "../../services/cartService";

interface CartTableProps {
  fields: FieldArrayWithId<CartFormValues, "cart", "id">[];
  update: UseFieldArrayUpdate<CartFormValues, "cart">;
  remove: UseFieldArrayRemove;
}

export const CartTable = ({ fields, update, remove }: CartTableProps) => (
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
                    {(item.category_name || item.subcategory_name) && (
                      <Typography variant="body2" color="textSecondary">
                        {item.category_name}
                        {item.subcategory_name &&
                          ` > ${item.subcategory_name}`}
                      </Typography>
                    )}
                  </Box>
                </TableCell>
                <TableCell>{formatWeight(item.weight)}</TableCell>
                <TableCell>
                  {formatCurrency(item.price)}
                  {item.promotion != 0 && (
                    <Chip
                      color="secondary"
                      icon={<Loyalty />}
                      sx={{ marginLeft: 1 }}
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
                    <Typography sx={{ minWidth: 30, textAlign: "center" }}>
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
                    {item.bundleQuantity &&
                      item.bundleQuantity != 0 &&
                      item.bundleQuantity != 1 &&
                      item.quantity >= item.bundleQuantity && (
                        <Chip
                          color="secondary"
                          icon={<Backpack />}
                          sx={{ marginLeft: 1 }}
                          label={`${Math.trunc(item.quantity / item.bundleQuantity)} pack`}
                          size="small"
                        />
                      )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography fontWeight="bold">
                    {formatCurrency(getCartLinePrice(item as CartItem))}
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
);
