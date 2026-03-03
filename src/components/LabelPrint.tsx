import { Box } from "@mui/material";
import JsBarcode from "jsbarcode";
import type { CSSProperties } from "react";
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeDataUrl, setBarcodeDataUrl] = useState<string>("");

  useEffect(() => {
    if (!item?.barcode || !canvasRef.current) return;
    try {
      JsBarcode(canvasRef.current, item.barcode, barcodeOptions);
      setBarcodeDataUrl(canvasRef.current.toDataURL());
    } catch {
      setBarcodeDataUrl("");
    }
  }, [item?.barcode]);

  const categoryLine = [item.category?.name, item.subcategory?.name]
    .filter(Boolean)
    .join(" > ");

  const rootStyle: CSSProperties = {
    width: "60mm",
    height: "45mm",
    margin: 0,
    // padding: "2mm",
    fontFamily: "Arial, sans-serif",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    boxSizing: "border-box",
  };

  return (
    <div className="label-print-root" style={rootStyle}>
      <style>{`
        @page { size: 60mm 45mm; margin: 0; }
        html, body { margin: 0; padding: 0; }
        .label-print-root { page-break-inside: avoid; page-break-after: avoid; }
      `}</style>
      <canvas
        ref={canvasRef}
        style={{ position: "absolute", left: -9999 }}
        aria-hidden
      />
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "1mm",
          padding: "0 1mm",
        }}
      >
        {barcodeDataUrl && <img src={barcodeDataUrl} alt="Code-barres" />}
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 14,
          marginTop: "0.5mm",
        }}
      >
        <span style={{ fontWeight: "bold", color: "#d32f2f" }}>
          {item.price.toFixed(2)} €
        </span>
        <span>
          {new Date(item.createdAt).toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "0.3mm",
        }}
      >
        <span>{item.weight ? `${item.weight} kg` : ""}</span>
        <span style={{ color: "#666" }}>{categoryLine}</span>
      </div>
    </div>
  );
};

const printPageStyle = `
  @page { size: 60mm 45mm; margin: 0; }
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
      sx={{
        position: "absolute",
        left: -9999,
        top: 0,
        zIndex: -1,
        visibility: "hidden",
        pointerEvents: "none",
      }}
    >
      <div ref={labelPrintRef}>
        {itemToPrint && <LabelPrintContent item={itemToPrint} />}
      </div>
    </Box>
  );

  return { triggerPrintLabel, labelPrintNode };
}
