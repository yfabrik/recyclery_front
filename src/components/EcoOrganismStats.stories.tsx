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
      { quarter: "Q1 2025", weight_kg: 1250, label: "01-2025--03-2025" },
      { quarter: "Q4 2024", weight_kg: 1180, label: "04-2024--06-2024" },
      { quarter: "Q3 2024", weight_kg: 1420, label: "07-2024--09-2024" },
      { quarter: "Q2 2024", weight_kg: 990, label: "10-2024--12-2024" },
    ],
  },
  {
    id: 2,
    name: "Eco-systèmes",
    description: "DEEE — Déchets d'équipements électriques et électroniques",
    is_active: true,
    quarters: [
      { quarter: "Q1 2025", weight_kg: 3420, label: "01-2025--03-2025" },
      { quarter: "Q4 2024", weight_kg: 3100, label: "04-2024--06-2024" },
      { quarter: "Q3 2024", weight_kg: 2890, label: "07-2024--09-2024" },
      { quarter: "Q2 2024", weight_kg: 2650, label: "10-2024--12-2024" },
    ],
  },
  {
    id: 3,
    name: "Refashion",
    description: "Textiles, chaussures et linge de maison",
    is_active: true,
    quarters: [
      { quarter: "Q1 2025", weight_kg: 580, label: "01-2025--03-2025" },
      { quarter: "Q4 2024", weight_kg: 620, label: "04-2024--06-2024" },
      { quarter: "Q3 2024", weight_kg: 510, label: "07-2024--09-2024" },
      { quarter: "Q2 2024", weight_kg: 490, label: "10-2024--12-2024" },
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
