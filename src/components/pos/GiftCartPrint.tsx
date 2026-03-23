/* eslint-disable react-refresh/only-export-components */
import { Box, Typography } from "@mui/material";
import JsBarcode from "jsbarcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import type { GiftCardDto } from "../../services/api/giftCards";
import { formatCurrency } from "../../services/cartService";

interface GiftCardPrintPayload {
  giftCard: Pick<GiftCardDto, "code" | "current_value" | "initial_value" | "createdAt">;
  storeAddress?: string | null;
}

export const GiftCartPrint = ({
  giftCard,
  storeAddress,
}: GiftCardPrintPayload) => {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!barcodeRef.current || !giftCard.code) return;
    try {
      JsBarcode(barcodeRef.current, giftCard.code, {
        format: "CODE128",
        width: 1.8,
        height: 44,
        displayValue: true,
        fontSize: 12,
        margin: 2,
      });
    } catch {
      // Ignore barcode rendering failures to avoid breaking print.
    }
  }, [giftCard.code]);

  return (
    <Box
      className="giftcard-print-root"
      sx={{ px: 2, py: 1, width: "80mm", fontFamily: "monospace", fontSize: "12px" }}
    >
      <Typography sx={{ textAlign: "center", fontFamily: "monospace", fontWeight: 700 }}>
        AVOIR
      </Typography>
      <Typography sx={{ textAlign: "center", fontFamily: "monospace", mb: 1 }}>
        {giftCard.code}
      </Typography>

      <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
        <svg ref={barcodeRef} />
      </Box>

      <Box sx={{ borderBottom: "1px dashed #000", mb: 1 }} />

      <Typography sx={{ fontFamily: "monospace" }}>
        Valeur: {formatCurrency(Number(giftCard.current_value ?? giftCard.initial_value ?? 0))}
      </Typography>
      <Typography sx={{ fontFamily: "monospace" }}>
        Cree le: {new Date(giftCard.createdAt).toLocaleDateString("fr-FR")}
      </Typography>
      <Typography sx={{ fontFamily: "monospace" }}>
        Adresse: {storeAddress?.trim() || "Adresse non renseignee"}
      </Typography>
    </Box>
  );
};

const printPageStyle = `
  @page { size: 80mm auto; margin: 4mm; }
  html, body { margin: 0 !important; padding: 0 !important; }
  .giftcard-print-root { page-break-inside: avoid; page-break-after: avoid; }
`;

export function useGiftCardPrint() {
  const [payload, setPayload] = useState<GiftCardPrintPayload | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const documentTitle = useMemo(() => {
    if (!payload) return "Avoir";
    return `Avoir-${payload.giftCard.code}`;
  }, [payload]);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    pageStyle: printPageStyle,
    documentTitle,
    onAfterPrint: () => setPayload(null),
  });

  useEffect(() => {
    if (!payload) return;
    handlePrint();
  }, [payload, handlePrint]);

  const triggerPrintGiftCard = (nextPayload: GiftCardPrintPayload) => {
    setPayload(nextPayload);
  };

  const giftCardPrintNode = (
    <Box sx={{ display: "none", displayPrint: "block" }} ref={printRef}>
      {payload && (
        <GiftCartPrint
          giftCard={payload.giftCard}
          storeAddress={payload.storeAddress}
        />
      )}
    </Box>
  );

  return { triggerPrintGiftCard, giftCardPrintNode };
}