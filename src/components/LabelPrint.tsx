import { Box, Grid, Typography } from "@mui/material";
import JsBarcode from "jsbarcode";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import type { LabeledItemModel } from "../interfaces/Models";

const barcodeOptions = {
  format: "CODE128" as const,
  width: 2,
  height: 80,
  displayValue: true,
  fontSize: 14,
};

const LabelPrintContent = ({ item }: { item: LabeledItemModel }) => {
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
    <Box sx={{ width: "60mm", margin: 0, paddingLeft: "3mm" }} className="label-print-root">
      <Grid container>
        <Grid size={12}>
          <svg ref={canvasRef} />
        </Grid>
        <Grid size={6}>
          <Typography fontWeight="bold">
            {" "}
            {item.price.toFixed(2)} €
          </Typography>
        </Grid>
        <Grid size={6}>
          {" "}
          {new Date(item.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </Grid>
        <Grid size={6}>{item.weight ? `${item.weight} kg` : ""}</Grid>
        <Grid size={6}>
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
  @page { size: 60mm auto; margin: 0; }
  html, body { margin: 0 !important; padding: 0 !important; overflow: hidden; }
  .label-print-root { page-break-inside: avoid; page-break-after: avoid; }
`;

export function useLabelPrint() {
  const [itemToPrint, setItemToPrint] = useState<LabeledItemModel | null>(null);
  const labelPrintRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: labelPrintRef,
    pageStyle: printPageStyle,
    onAfterPrint: () => setItemToPrint(null),
    documentTitle: itemToPrint
      ? `Étiquette - ${itemToPrint.barcode}`
      : "Étiquette",
  });

  useEffect(() => {
    if (!itemToPrint) return;
    const t = setTimeout(() => handlePrint(), 300);
    return () => clearTimeout(t);
  }, [itemToPrint, handlePrint]);

  const triggerPrintLabel = (item: LabeledItemModel) => setItemToPrint(item);

  const labelPrintNode = (
    <Box
      sx={{ display: "none", displayPrint: "block" }}
      ref={labelPrintRef}
    >
      {itemToPrint && <LabelPrintContent item={itemToPrint} />}
    </Box>
  );

  return { triggerPrintLabel, labelPrintNode };
}
