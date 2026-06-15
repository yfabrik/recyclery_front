import { Add, Close } from "@mui/icons-material";
import { Box, Tab, Tabs } from "@mui/material";
import type { Schema as CartSchema } from "../forms/cartSchema";

interface CartTabsProps {
  tabValue: number;
  carts: CartSchema["cart"][];
  onChange: (index: number) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export const CartTabs = ({
  tabValue,
  carts,
  onChange,
  onAdd,
  onRemove,
}: CartTabsProps) => (
  <Tabs value={tabValue} onChange={(_, val) => onChange(val as number)}>
    {carts.map((_, index) => (
      <Tab
        key={index}
        label={
          <Box
            component="span"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            Panier {index + 1}
            <Box
              component="span"
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove(index);
                }
              }}
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: "50%",
                color: carts.length <= 1 ? "action.disabled" : "inherit",
                cursor: carts.length <= 1 ? "default" : "pointer",
                "&:hover": {
                  bgcolor:
                    carts.length <= 1 ? "transparent" : "action.hover",
                },
              }}
              aria-disabled={carts.length <= 1}
            >
              <Close fontSize="small" />
            </Box>
          </Box>
        }
      />
    ))}
    <Tab
      icon={<Add />}
      aria-label="Ajouter un panier"
      onClick={(e) => {
        e.preventDefault();
        onAdd();
      }}
    />
  </Tabs>
);
