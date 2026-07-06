import type { Meta, StoryObj } from "@storybook/react-vite";
import type { EcoOrgQuarterLabel } from "@recyclerie/api/responses/ecoOrganism";
import type { EcoOrganismQuarterStat } from "../services/api/ecoOrganism";
import { EcoOrganismStats } from "./EcoOrganismStats";

const meta = {
  component: EcoOrganismStats,
  title: "Components/EcoOrganismStats",
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Quarterly eco-organism weight stats with expandable category breakdowns. Mock builders normalize quarterIn / quarterSell / quarterOut metrics.",
      },
    },
  },
} satisfies Meta<typeof EcoOrganismStats>;

export default meta;

type Story = StoryObj<typeof meta>;

type QuarterStat = EcoOrganismQuarterStat["quarters"][number];
type WeightCategoryStat = QuarterStat["quarterOut"]["categories"][number];
type SellCategoryStat = QuarterStat["quarterSell"]["categories"][number];
type SourceQuarterStat = QuarterStat["quarterIn"]["by_source_type"]["point"];

type RawSubCategory = { id: number; name: string; weight_kg: number };
type RawWeightCategoryStat = {
  id: number;
  name: string;
  weight_kg: number;
  subcategories?: RawSubCategory[];
};
type RawQuarterStat = {
  quarter: EcoOrgQuarterLabel;
  label?: string;
  total_weight_kg: number;
  categories: RawWeightCategoryStat[];
};

const quantityFromWeight = (weightKg: number) => Math.max(0, Math.round(weightKg / 10));

const buildWeightCategories = (categories: RawWeightCategoryStat[]): WeightCategoryStat[] =>
  categories.map((category) => ({
    id: category.id,
    name: category.name,
    weight_kg: category.weight_kg,
    subcategories: (category.subcategories ?? []).map((subcat) => ({
      id: subcat.id,
      name: subcat.name,
      weight_kg: subcat.weight_kg,
    })),
  }));

const buildSellCategories = (categories: WeightCategoryStat[]): SellCategoryStat[] =>
  categories.map((category) => ({
    id: category.id,
    name: category.name,
    weight_kg: category.weight_kg,
    quantity: quantityFromWeight(category.weight_kg),
    subcategories: category.subcategories.map((subcat) => ({
      id: subcat.id,
      name: subcat.name,
      weight_kg: subcat.weight_kg,
      quantity: quantityFromWeight(subcat.weight_kg),
    })),
  }));

const scaleWeightCategories = (
  categories: WeightCategoryStat[],
  factor: number,
): WeightCategoryStat[] =>
  categories.map((category) => ({
    id: category.id,
    name: category.name,
    weight_kg: Math.round(category.weight_kg * factor),
    subcategories: category.subcategories.map((subcat) => ({
      id: subcat.id,
      name: subcat.name,
      weight_kg: Math.round(subcat.weight_kg * factor),
    })),
  }));

const buildQuarterStatForSource = (
  categories: WeightCategoryStat[],
  factor: number,
): SourceQuarterStat => {
  const scaledCategories = scaleWeightCategories(categories, factor);
  const total_weight_kg = scaledCategories.reduce((sum, cat) => sum + cat.weight_kg, 0);
  return {
    total_weight_kg,
    categories: scaledCategories,
  };
};

const normalizeQuarter = (quarter: RawQuarterStat): QuarterStat => {
  const categories = buildWeightCategories(quarter.categories);

  return {
    quarter: quarter.quarter,
    quarterIn: {
      total_weight_kg: quarter.total_weight_kg,
      categories,
      by_source_type: {
        point: buildQuarterStatForSource(categories, 0.5),
        apport: buildQuarterStatForSource(categories, 0.3),
        house_clearance: buildQuarterStatForSource(categories, 0.2),
      },
    },
    quarterSell: {
      total_weight_kg: quarter.total_weight_kg,
      quantity: quantityFromWeight(quarter.total_weight_kg),
      categories: buildSellCategories(categories),
    },
    quarterOut: {
      total_weight_kg: quarter.total_weight_kg,
      categories,
    },
  };
};

const rawMockStats = [
  {
    id: 1,
    name: "Eco-mobilier",
    description: "Déchets d'ameublement (mobilier, literie)",
    is_active: true,
    quarters: [
      {
        quarter: "2025-T1",
        label: "01/2025 - 03/2025",
        total_weight_kg: 1250,
        categories: [
          {
            id: 1,
            name: "Mobilier",
            weight_kg: 820,
            subcategories: [
              { id: 1001, name: "Chaises", weight_kg: 310 },
              { id: 1002, name: "Tables", weight_kg: 510 },
            ],
          },
          {
            id: 2,
            name: "Literie",
            weight_kg: 430,
            subcategories: [
              { id: 1003, name: "Matelas", weight_kg: 260 },
              { id: 1004, name: "Sommiers", weight_kg: 170 },
            ],
          },
        ],
      },
      {
        quarter: "2024-T4",
        label: "10/2024 - 12/2024",
        total_weight_kg: 1180,
        categories: [
          { id: 1, name: "Mobilier", weight_kg: 760 },
          { id: 2, name: "Literie", weight_kg: 420 },
        ],
      },
      {
        quarter: "2024-T3",
        label: "07/2024 - 09/2024",
        total_weight_kg: 1420,
        categories: [
          { id: 1, name: "Mobilier", weight_kg: 940 },
          { id: 2, name: "Literie", weight_kg: 480 },
        ],
      },
      {
        quarter: "2024-T2",
        label: "04/2024 - 06/2024",
        total_weight_kg: 990,
        categories: [
          { id: 1, name: "Mobilier", weight_kg: 620 },
          { id: 2, name: "Literie", weight_kg: 370 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Eco-systèmes",
    description: "DEEE — Déchets d'équipements électriques et électroniques",
    is_active: true,
    quarters: [
      {
        quarter: "2025-T1",
        label: "01/2025 - 03/2025",
        total_weight_kg: 3420,
        categories: [
          {
            id: 10,
            name: "Petits appareils",
            weight_kg: 1620,
            subcategories: [
              { id: 1101, name: "Téléphones", weight_kg: 620 },
              { id: 1102, name: "Petit électroménager", weight_kg: 1000 },
            ],
          },
          {
            id: 11,
            name: "Gros appareils",
            weight_kg: 1800,
            subcategories: [
              { id: 1103, name: "Lave-linge", weight_kg: 900 },
              { id: 1104, name: "Réfrigérateurs", weight_kg: 900 },
            ],
          },
        ],
      },
      {
        quarter: "2024-T4",
        label: "10/2024 - 12/2024",
        total_weight_kg: 3100,
        categories: [
          { id: 10, name: "Petits appareils", weight_kg: 1500 },
          { id: 11, name: "Gros appareils", weight_kg: 1600 },
        ],
      },
      {
        quarter: "2024-T3",
        label: "07/2024 - 09/2024",
        total_weight_kg: 2890,
        categories: [
          { id: 10, name: "Petits appareils", weight_kg: 1410 },
          { id: 11, name: "Gros appareils", weight_kg: 1480 },
        ],
      },
      {
        quarter: "2024-T2",
        label: "04/2024 - 06/2024",
        total_weight_kg: 2650,
        categories: [
          { id: 10, name: "Petits appareils", weight_kg: 1270 },
          { id: 11, name: "Gros appareils", weight_kg: 1380 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Refashion",
    description: "Textiles, chaussures et linge de maison",
    is_active: true,
    quarters: [
      {
        quarter: "2025-T1",
        label: "01/2025 - 03/2025",
        total_weight_kg: 580,
        categories: [
          {
            id: 20,
            name: "Textiles",
            weight_kg: 320,
            subcategories: [
              { id: 1201, name: "Vêtements", weight_kg: 210 },
              { id: 1202, name: "Linge de maison", weight_kg: 110 },
            ],
          },
          {
            id: 21,
            name: "Chaussures",
            weight_kg: 260,
            subcategories: [
              { id: 1203, name: "Chaussures ville", weight_kg: 140 },
              { id: 1204, name: "Chaussures sport", weight_kg: 120 },
            ],
          },
        ],
      },
      {
        quarter: "2024-T4",
        label: "10/2024 - 12/2024",
        total_weight_kg: 620,
        categories: [
          { id: 20, name: "Textiles", weight_kg: 360 },
          { id: 21, name: "Chaussures", weight_kg: 260 },
        ],
      },
      {
        quarter: "2024-T3",
        label: "07/2024 - 09/2024",
        total_weight_kg: 510,
        categories: [
          { id: 20, name: "Textiles", weight_kg: 290 },
          { id: 21, name: "Chaussures", weight_kg: 220 },
        ],
      },
      {
        quarter: "2024-T2",
        label: "04/2024 - 06/2024",
        total_weight_kg: 490,
        categories: [
          { id: 20, name: "Textiles", weight_kg: 280 },
          { id: 21, name: "Chaussures", weight_kg: 210 },
        ],
      },
    ],
  },
];

const mockStats: EcoOrganismQuarterStat[] = rawMockStats.map((stat) => ({
  ...stat,
  quarters: stat.quarters.map((quarter) => normalizeQuarter(quarter as RawQuarterStat)),
}));

export const Default: Story = {
  args: {
    stats: mockStats,
    valueLabel: "Poids collecté (kg)",
  },
};

export const Loading: Story = {
  args: {
    stats: [],
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    stats: [],
  },
};

export const SingleEcoOrganism: Story = {
  args: {
    stats: mockStats.slice(0, 1),
    valueLabel: "Tonnes enlevées",
  },
};

export const QuarterInArrivalSources: Story = {
  args: {
    stats: mockStats,
    valueLabel: "Tonnage entrant (kg)",
    metricSource: "quarterIn",
  },
};

export const QuarterSellQuantities: Story = {
  args: {
    stats: mockStats,
    valueLabel: "Tonnage vendu (kg)",
    metricSource: "quarterSell",
  },
};
