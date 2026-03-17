import type { Meta, StoryObj } from "@storybook/react-vite";
import type { EcoOrganismQuarterStat } from "../services/api/ecoOrganism";
import { EcoOrganismStats } from "./EcoOrganismStats";

const meta = {
  component: EcoOrganismStats,
  title: "Components/EcoOrganismStats",
} satisfies Meta<typeof EcoOrganismStats>;

export default meta;

type Story = StoryObj<typeof meta>;

const mockStats: EcoOrganismQuarterStat[] = [
  {
    id: 1,
    name: "Eco-mobilier",
    description: "Déchets d'ameublement (mobilier, literie)",
    is_active: true,
    quarters: [
      {
        quarter: "Q1 2025",
        label: "01/2025 - 03/2025",
        total_weight_kg: 1250,
        categories: [
          { id: 1, name: "Mobilier", weight_kg: 820 },
          { id: 2, name: "Literie", weight_kg: 430 },
        ],
      },
      {
        quarter: "Q4 2024",
        label: "10/2024 - 12/2024",
        total_weight_kg: 1180,
        categories: [
          { id: 1, name: "Mobilier", weight_kg: 760 },
          { id: 2, name: "Literie", weight_kg: 420 },
        ],
      },
      {
        quarter: "Q3 2024",
        label: "07/2024 - 09/2024",
        total_weight_kg: 1420,
        categories: [
          { id: 1, name: "Mobilier", weight_kg: 940 },
          { id: 2, name: "Literie", weight_kg: 480 },
        ],
      },
      {
        quarter: "Q2 2024",
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
        quarter: "Q1 2025",
        label: "01/2025 - 03/2025",
        total_weight_kg: 3420,
        categories: [
          { id: 10, name: "Petits appareils", weight_kg: 1620 },
          { id: 11, name: "Gros appareils", weight_kg: 1800 },
        ],
      },
      {
        quarter: "Q4 2024",
        label: "10/2024 - 12/2024",
        total_weight_kg: 3100,
        categories: [
          { id: 10, name: "Petits appareils", weight_kg: 1500 },
          { id: 11, name: "Gros appareils", weight_kg: 1600 },
        ],
      },
      {
        quarter: "Q3 2024",
        label: "07/2024 - 09/2024",
        total_weight_kg: 2890,
        categories: [
          { id: 10, name: "Petits appareils", weight_kg: 1410 },
          { id: 11, name: "Gros appareils", weight_kg: 1480 },
        ],
      },
      {
        quarter: "Q2 2024",
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
        quarter: "Q1 2025",
        label: "01/2025 - 03/2025",
        total_weight_kg: 580,
        categories: [
          { id: 20, name: "Textiles", weight_kg: 320 },
          { id: 21, name: "Chaussures", weight_kg: 260 },
        ],
      },
      {
        quarter: "Q4 2024",
        label: "10/2024 - 12/2024",
        total_weight_kg: 620,
        categories: [
          { id: 20, name: "Textiles", weight_kg: 360 },
          { id: 21, name: "Chaussures", weight_kg: 260 },
        ],
      },
      {
        quarter: "Q3 2024",
        label: "07/2024 - 09/2024",
        total_weight_kg: 510,
        categories: [
          { id: 20, name: "Textiles", weight_kg: 290 },
          { id: 21, name: "Chaussures", weight_kg: 220 },
        ],
      },
      {
        quarter: "Q2 2024",
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

export const CustomValueLabel: Story = {
  args: {
    stats: mockStats,
    valueLabel: "Poids collecté (kg)",
  },
};
