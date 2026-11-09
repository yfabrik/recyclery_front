import type {
  SalesPostalCodeDto,
  SalesPostalCodesDto,
} from "@recyclerie/api/responses/salesAnalytics";
import { rowsToCsv, type CsvColumn } from "../../../utils/csv";

/** Share (0–1) of Sales that have a postal code; null when there is no Sale. */
export const postalCodeShare = ({
  sales_with_postal_code,
  sales_count,
}: Pick<SalesPostalCodesDto, "sales_with_postal_code" | "sales_count">) =>
  sales_count > 0 ? sales_with_postal_code / sales_count : null;

const CSV_COLUMNS: CsvColumn<SalesPostalCodeDto>[] = [
  { header: "Code postal", key: "postal_code" },
  { header: "CA net (€)", key: "net_revenue" },
  { header: "Ventes", key: "sales_count" },
  { header: "Panier moyen (€)", key: "average_basket" },
];

/** CSV of the listed postal codes (the top 10), as on screen. */
export const postalCodesCsv = (figures: SalesPostalCodesDto) =>
  rowsToCsv(figures.postal_codes, CSV_COLUMNS);
