import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { downloadCsv, rowsToCsv, type CsvColumn } from "../utils/csv";
import { ExportCsvButton, type ExportScope } from "./ExportCsvButton";

type DemoRow = {
  id: number;
  date: string;
  source: string;
  weightKg: number;
};

const demoRows: DemoRow[] = [
  { id: 101, date: "2026-06-20", source: "Point de Collecte", weightKg: 13.2 },
  { id: 102, date: "2026-06-21", source: "Apport Volontaire", weightKg: 6.4 },
  { id: 103, date: "2026-06-22", source: "Vide Maison", weightKg: 18.9 },
];

const columns: CsvColumn<DemoRow>[] = [
  { header: "ID", key: "id" },
  { header: "Date", key: "date" },
  { header: "Provenance", key: "source" },
  { header: "Poids (kg)", key: "weightKg" },
];

type DemoProps = {
  loading?: boolean;
  disabled?: boolean;
};

const ExportCsvDemo = ({ loading = false, disabled = false }: DemoProps) => {
  const [lastExport, setLastExport] = useState<string>("Aucun export");
  const [minWeight] = useState(10);

  const filteredRows = useMemo(
    () => demoRows.filter((row) => row.weightKg >= minWeight),
    [minWeight],
  );

  const handleExport = async (scope: ExportScope) => {
    const rows = scope === "filtered" ? filteredRows : demoRows;
    const csv = rowsToCsv(rows, columns);
    const filename =
      scope === "filtered" ? "arrivals-filtered.csv" : "arrivals-all.csv";

    try {
      downloadCsv(filename, csv);
    } catch {
      // Ignore browser download limits in Storybook runners.
    }

    setLastExport(`${scope}:${rows.length}`);
  };

  return (
    <Box sx={{ display: "grid", gap: 2, width: 700 }}>
      <Typography variant="h6">Export CSV demo</Typography>
      <Typography variant="body2">
        Filtre simulé: poids minimum {minWeight} kg
      </Typography>
      <ExportCsvButton
        onExport={handleExport}
        loading={loading}
        disabled={disabled}
      />
      <Typography data-testid="last-export" variant="body2">
        Dernier export: {lastExport}
      </Typography>
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Provenance</TableCell>
              <TableCell align="right">Poids (kg)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.source}</TableCell>
                <TableCell align="right">{row.weightKg}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

const meta = {
  title: "Components/ExportCsvButton",
  component: ExportCsvDemo,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "CSV export button with two actions: current filters or full dataset. This story uses local mock rows and updates a visible export status label.",
      },
    },
  },
} satisfies Meta<typeof ExportCsvDemo>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  args: {
    loading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const WithPlayTest: Story = {
  play: async ({ canvasElement }) => {
    const button = canvasElement.querySelector("button");
    if (!button) throw new Error("Export button not found");
    (button as HTMLButtonElement).click();
    await new Promise((resolve) => setTimeout(resolve, 150));

    const menuItem = Array.from(
      document.body.querySelectorAll('[role="menuitem"]'),
    ).find((el) => el.textContent?.includes("Exporter (filtres actuels)"));
    if (!menuItem) throw new Error("Filtered export menu item not found");
    (menuItem as HTMLElement).click();
    await new Promise((resolve) => setTimeout(resolve, 150));

    const status = canvasElement.querySelector('[data-testid="last-export"]');
    if (!status?.textContent?.includes("filtered:2")) {
      throw new Error("Expected last export status to be updated");
    }
  },
};
