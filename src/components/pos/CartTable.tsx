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
import type { CartItem, CartItemInput } from "../forms/cartSchema";
import {
  formatCurrency,
  formatWeight,
  getCartLinePrice,
} from "../../services/cartService";

export type CartTableRow = Pick<
  CartItemInput,
  | "name"
  | "barcode"
  | "category_name"
  | "subcategory_name"
  | "quantity"
  | "price"
  | "weight"
  | "promotion"
  | "bundleQuantity"
  | "category_id"
  | "subcategory_id"
  | "description"
  | "bundlePrice"
> & {
  id: string;
  refundQuantity?: number;
};

interface CartTableProps {
  fields: ReadonlyArray<CartTableRow>;
  update: (index: number, value: CartTableRow) => void;
  remove: (index: number) => void;
  title?: string;
  emptyMessage?: string;
  size?: "small" | "medium";
  allowRemove?: boolean;
  minQuantity?: number;
  removeOnZero?: boolean;
  quantityEditable?: boolean;
  showRefundColumn?: boolean;
  onRefundQuantityChange?: (index: number, refundQuantity: number) => void;
  canDecreaseRefund?: (index: number, item: CartTableRow) => boolean;
  canIncreaseRefund?: (index: number, item: CartTableRow) => boolean;
}

export const CartTable = ({
  fields,
  update,
  remove,
  title,
  emptyMessage = "Le panier est vide. Scannez des articles pour commencer.",
  size = "medium",
  allowRemove = true,
  minQuantity = 0,
  removeOnZero = true,
  quantityEditable = true,
  showRefundColumn = false,
  onRefundQuantityChange,
  canDecreaseRefund,
  canIncreaseRefund,
}: CartTableProps) => {
  const displayTitle =
    title ??
    `Panier (${fields.length} article${fields.length > 1 ? "s" : ""})`;

  const handleDecreaseQuantity = (item: CartTableRow, index: number) => {
    if (!quantityEditable) return;

    if (item.quantity - 1 < minQuantity) return;

    if (
      removeOnZero &&
      allowRemove &&
      item.quantity - 1 <= minQuantity
    ) {
      remove(index);
      return;
    }

    update(index, {
      ...item,
      quantity: item.quantity - 1,
    });
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <ShoppingCart />
        {displayTitle}
      </Typography>

      {fields.length === 0 ? (
        <Alert severity="info">{emptyMessage}</Alert>
      ) : (
        <TableContainer>
          <Table size={size}>
            <TableHead>
              <TableRow>
                <TableCell>Article</TableCell>
                <TableCell>Poids unitaire</TableCell>
                <TableCell>Prix unitaire</TableCell>
                <TableCell>Quantité</TableCell>
                <TableCell>Total</TableCell>
                {showRefundColumn && <TableCell>Remboursement</TableCell>}
                {allowRemove && <TableCell>Actions</TableCell>}
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
                      {quantityEditable ? (
                        <>
                          <IconButton
                            size="small"
                            type="button"
                            onClick={() => handleDecreaseQuantity(item, index)}
                            disabled={item.quantity <= minQuantity}
                          >
                            <Remove />
                          </IconButton>
                          <Typography sx={{ minWidth: 30, textAlign: "center" }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            type="button"
                            onClick={() =>
                              update(index, {
                                ...item,
                                quantity: item.quantity + 1,
                              })
                            }
                          >
                            <Add />
                          </IconButton>
                        </>
                      ) : (
                        <Typography sx={{ minWidth: 30, textAlign: "center" }}>
                          {item.quantity}
                        </Typography>
                      )}
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
                  {showRefundColumn && (
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
                          type="button"
                          disabled={!canDecreaseRefund?.(index, item)}
                          onClick={() =>
                            onRefundQuantityChange?.(
                              index,
                              (item.refundQuantity ?? 0) - 1,
                            )
                          }
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ minWidth: 30, textAlign: "center" }}>
                          {item.refundQuantity ?? 0}
                        </Typography>
                        <IconButton
                          size="small"
                          type="button"
                          disabled={!canIncreaseRefund?.(index, item)}
                          onClick={() =>
                            onRefundQuantityChange?.(
                              index,
                              (item.refundQuantity ?? 0) + 1,
                            )
                          }
                        >
                          <Add />
                        </IconButton>
                      </Box>
                    </TableCell>
                  )}
                  {allowRemove && (
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        type="button"
                        onClick={() => remove(index)}
                      >
                        <Close />
                      </IconButton>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );
};
