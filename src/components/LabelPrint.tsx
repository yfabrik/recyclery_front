import { Box, Grid, Typography } from "@mui/material";
import JsBarcode from "jsbarcode";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import type { LabeledItemModel } from "../interfaces/Models";
import { formatCurrency, formatWeight } from "../services/cartService";

const barcodeOptions = {
  format: "CODE128" as const,
  width: 1.5,
  height: 40,
  displayValue: true,
  fontSize: 14,
};

type LabeledItemForPrint = LabeledItemModel;
// & Required<Pick<LabeledItemModel, "category" | "subcategory">>;

const LabelPrintContent = ({ item }: { item: LabeledItemForPrint }) => {
  const canvasRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!item?.barcode || !canvasRef.current) return;
    try {
      JsBarcode(canvasRef.current, item.barcode, barcodeOptions);
    } catch {
      // barcode render failed
    }
  }, [item?.barcode]);

  const categoryLine = [item.category?.name, item.subcategory?.name]
    .filter(Boolean)
    .join(" > ");

  return (
    <Box
      sx={{
        margin: 0,
      }}
      className="label-print-root"
    >
      <Grid container>
        <Grid size={12} sx={{ display: "flex", justifyContent: "center" }}>
          <svg ref={canvasRef} />
        </Grid>
        <Grid size={4} sx={{ display: "flex", justifyContent: "center" }}>
          <Typography fontWeight="bold"> {formatCurrency(item.price)}</Typography>
        </Grid>
        <Grid size={8} sx={{ display: "flex", justifyContent: "center" }}>
          {" "}
          {new Date(item.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Grid>
        <Grid size={4} sx={{ display: "flex", justifyContent: "center" }}>
          {item.weight ? formatWeight(item.weight) : ""}
        </Grid>
        <Grid size={8} sx={{ display: "flex", justifyContent: "center" }}>
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.65rem",
              lineHeight: 1.2,
              display: "block",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {categoryLine}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

const printPageStyle = `
  @page { size: 62mm 40mm; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; overflow: hidden; }
  .label-print-root { page-break-inside: avoid; page-break-after: always; }
  .label-print-root:last-child { page-break-after: auto; }
`;

export function useLabelPrint() {
  const [itemsToPrint, setItemsToPrint] = useState<LabeledItemForPrint[]>([]);
  const labelPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: labelPrintRef,
    pageStyle: printPageStyle,
    onAfterPrint: () => setItemsToPrint([]),
    documentTitle:
      itemsToPrint.length === 1
        ? `Étiquette - ${itemsToPrint[0].barcode}`
        : itemsToPrint.length > 1
          ? `Étiquettes (${itemsToPrint.length})`
          : "Étiquette",
  });

  useEffect(() => {
    if (itemsToPrint.length === 0) return;
    handlePrint();
  }, [itemsToPrint, handlePrint]);

  const triggerPrintLabel = (
    itemOrItems: LabeledItemForPrint | LabeledItemForPrint[],
  ) => {
    setItemsToPrint(Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems]);
  };

  const labelPrintNode = (
    <Box sx={{ display: "none", displayPrint: "block" }} ref={labelPrintRef}>
      {itemsToPrint.map((item) => (
        <LabelPrintContent key={item.id} item={item} />
      ))}
    </Box>
  );

  return { triggerPrintLabel, labelPrintNode };
}
