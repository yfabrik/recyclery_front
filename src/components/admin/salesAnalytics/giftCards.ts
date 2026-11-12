import { roundCurrency } from "@recyclerie/api/domain/cart";
import type {
  GiftCardAnalyticsDto,
  GiftCardFigureDto,
} from "@recyclerie/api/responses/giftCards";
import type { SalesAnalyticsDto } from "@recyclerie/api/responses/salesAnalytics";
import { rowsToCsv, type CsvColumn } from "../../../utils/csv";
import { csvColumns } from "./comparison";
import { formatShortDate } from "./format";

/** Shown next to a network-wide line when a Store is selected. */
export const ALL_STORES_LABEL = "tous magasins";

/**
 * How far a line follows the Store filter: traced to a Store, network-wide
 * (not traced to a Store), or a total that takes in a network-wide line.
 */
type LineScope = "store" | "network" | "partlyNetwork";

/** Shown next to a line when a Store is selected. */
const SCOPE_LABELS = {
  store: "",
  network: ALL_STORES_LABEL,
  partlyNetwork: `dont créées à la main : ${ALL_STORES_LABEL}`,
} as const satisfies Record<LineScope, string>;

type LineKey =
  | "issued"
  | keyof GiftCardAnalyticsDto["issued"]
  | Exclude<keyof GiftCardAnalyticsDto, "issued">;

type LineSpec = {
  key: LineKey;
  label: (range: { date_to: string }) => string;
  /** One of the origins of the issued value, shown under "Émises". */
  isOrigin: boolean;
  scope: LineScope;
  pick: (figures: GiftCardAnalyticsDto) => GiftCardFigureDto;
  /** What the count counts: [one, many]. */
  unit: [string, string];
};

const CARDS: [string, string] = ["carte", "cartes"];

const sum = (figures: GiftCardFigureDto[]): GiftCardFigureDto => ({
  count: figures.reduce((total, f) => total + f.count, 0),
  amount: roundCurrency(figures.reduce((total, f) => total + f.amount, 0)),
});

/** The section's lines, top to bottom. */
const LINES: LineSpec[] = [
  {
    key: "issued",
    label: () => "Émises",
    isOrigin: false,
    // The total of its origins, hand-created cards (network-wide) included.
    scope: "partlyNetwork",
    pick: (f) => sum(Object.values(f.issued)),
    unit: ["crédit", "crédits"],
  },
  {
    key: "by_hand",
    label: () => "Créées à la main",
    isOrigin: true,
    scope: "network",
    pick: (f) => f.issued.by_hand,
    unit: CARDS,
  },
  {
    key: "sold",
    label: () => "Vendues en caisse",
    isOrigin: true,
    scope: "store",
    pick: (f) => f.issued.sold,
    unit: CARDS,
  },
  {
    key: "store_credit",
    label: () => "Avoirs sur remboursement",
    isOrigin: true,
    scope: "store",
    pick: (f) => f.issued.store_credit,
    unit: ["avoir", "avoirs"],
  },
  {
    key: "top_up",
    label: () => "Recharges",
    isOrigin: true,
    scope: "store",
    pick: (f) => f.issued.top_up,
    unit: ["recharge", "recharges"],
  },
  {
    key: "used",
    label: () => "Utilisées en paiement",
    isOrigin: false,
    scope: "store",
    pick: (f) => f.used,
    unit: ["paiement", "paiements"],
  },
  {
    key: "expired",
    label: () => "Expirées",
    isOrigin: false,
    scope: "network",
    pick: (f) => f.expired,
    unit: CARDS,
  },
  {
    key: "outstanding",
    label: ({ date_to }) => `Solde restant au ${formatShortDate(date_to)}`,
    isOrigin: false,
    scope: "network",
    pick: (f) => f.outstanding,
    unit: CARDS,
  },
];

export type GiftCardRow = {
  key: LineKey;
  label: string;
  isOrigin: boolean;
  /**
   * While a Store is selected: `ALL_STORES_LABEL` for a network-wide line,
   * a note on "Émises", which takes in the hand-created cards; else "".
   */
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
      scope: storeSelected ? SCOPE_LABELS[line.scope] : "",
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
) => rowsToCsv(rows, csvColumns(CSV_COLUMNS, COMPARISON_CSV_COLUMNS, comparison));
