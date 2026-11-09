import type {
  GiftCardAnalyticsDto,
  GiftCardFigureDto,
} from "@recyclerie/api/responses/giftCards";
import type { SalesAnalyticsDto } from "@recyclerie/api/responses/salesAnalytics";
import { rowsToCsv, type CsvColumn } from "../../../utils/csv";

/** Shown next to a network-wide line when a Store is selected. */
export const ALL_STORES_LABEL = "tous magasins";

type LineKey =
  | "issued"
  | keyof GiftCardAnalyticsDto["issued"]
  | Exclude<keyof GiftCardAnalyticsDto, "issued">;

type LineSpec = {
  key: LineKey;
  label: (range: { date_to: string }) => string;
  /** One of the origins of the issued value, shown under "Émises". */
  isOrigin: boolean;
  /** Not traced to a Store: the same whatever the Store filter. */
  networkWide: boolean;
  pick: (figures: GiftCardAnalyticsDto) => GiftCardFigureDto;
  /** What the count counts: [one, many]. */
  unit: [string, string];
};

const CARDS: [string, string] = ["carte", "cartes"];

const sum = (figures: GiftCardFigureDto[]): GiftCardFigureDto => ({
  count: figures.reduce((total, f) => total + f.count, 0),
  amount: Math.round(figures.reduce((total, f) => total + f.amount, 0) * 100) / 100,
});

const frDate = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "UTC",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

/** The section's lines, top to bottom. */
const LINES: LineSpec[] = [
  {
    key: "issued",
    label: () => "Émises",
    isOrigin: false,
    networkWide: false,
    pick: (f) => sum(Object.values(f.issued)),
    unit: ["crédit", "crédits"],
  },
  {
    key: "by_hand",
    label: () => "Créées à la main",
    isOrigin: true,
    networkWide: true,
    pick: (f) => f.issued.by_hand,
    unit: CARDS,
  },
  {
    key: "sold",
    label: () => "Vendues en caisse",
    isOrigin: true,
    networkWide: false,
    pick: (f) => f.issued.sold,
    unit: CARDS,
  },
  {
    key: "store_credit",
    label: () => "Avoirs sur remboursement",
    isOrigin: true,
    networkWide: false,
    pick: (f) => f.issued.store_credit,
    unit: ["avoir", "avoirs"],
  },
  {
    key: "top_up",
    label: () => "Recharges",
    isOrigin: true,
    networkWide: false,
    pick: (f) => f.issued.top_up,
    unit: ["recharge", "recharges"],
  },
  {
    key: "used",
    label: () => "Utilisées en paiement",
    isOrigin: false,
    networkWide: false,
    pick: (f) => f.used,
    unit: ["paiement", "paiements"],
  },
  {
    key: "expired",
    label: () => "Expirées",
    isOrigin: false,
    networkWide: true,
    pick: (f) => f.expired,
    unit: CARDS,
  },
  {
    key: "outstanding",
    label: ({ date_to }) => `Solde restant au ${frDate.format(new Date(`${date_to}T00:00:00Z`))}`,
    isOrigin: false,
    networkWide: true,
    pick: (f) => f.outstanding,
    unit: CARDS,
  },
];

export type GiftCardRow = {
  key: LineKey;
  label: string;
  isOrigin: boolean;
  /** `ALL_STORES_LABEL` for a network-wide line while a Store is selected, else "". */
  scope: string;
  unit: [string, string];
  count: number;
  amount: number;
  /** null on `compare=none`. */
  comparisonCount: number | null;
  comparisonAmount: number | null;
};

/** One row per line of the gift card section, current and comparison figures side by side. */
export const giftCardRows = (
  data: SalesAnalyticsDto<GiftCardAnalyticsDto>,
  { storeSelected }: { storeSelected: boolean },
): GiftCardRow[] =>
  LINES.map((line) => {
    const current = line.pick(data.current);
    const comparison = data.comparison && line.pick(data.comparison);
    return {
      key: line.key,
      label: line.label(data.ranges.current),
      isOrigin: line.isOrigin,
      scope: storeSelected && line.networkWide ? ALL_STORES_LABEL : "",
      unit: line.unit,
      count: current.count,
      amount: current.amount,
      comparisonCount: comparison?.count ?? null,
      comparisonAmount: comparison?.amount ?? null,
    };
  });

/** Nothing issued, used, expired or left: the section shows its empty state. */
export const hasNoGiftCards = (figures: GiftCardAnalyticsDto) =>
  LINES.every((line) => line.pick(figures).count === 0);

const CSV_COLUMNS: CsvColumn<GiftCardRow>[] = [
  { header: "Ligne", key: "label" },
  { header: "Magasins", key: "scope" },
  { header: "Nombre", key: "count" },
  { header: "Montant (€)", key: "amount" },
];

const COMPARISON_CSV_COLUMNS: CsvColumn<GiftCardRow>[] = [
  { header: "Nombre (comparaison)", key: "comparisonCount" },
  { header: "Montant (comparaison) (€)", key: "comparisonAmount" },
];

/** The section's CSV: one row per line. */
export const giftCardsCsv = (
  rows: GiftCardRow[],
  { comparison }: { comparison: boolean },
) => rowsToCsv(rows, comparison ? [...CSV_COLUMNS, ...COMPARISON_CSV_COLUMNS] : CSV_COLUMNS);
