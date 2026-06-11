import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { Loading } from "./Loading";

const meta = {
  title: "Components/Loading",
  component: Loading,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Conditional loading wrapper. Renders a spinner when isLoading is true; supports standalone or table row layout via tableCols.",
      },
    },
  },
} satisfies Meta<typeof Loading>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Standalone: Story = {
  args: {
    isLoading: true,
    children: <Typography>Contenu chargé</Typography>,
  },
};

export const WithChildren: Story = {
  args: {
    isLoading: false,
    children: (
      <Paper sx={{ p: 3 }}>
        <Typography>Données affichées</Typography>
      </Paper>
    ),
  },
};

export const LoadingTableRow: Story = {
  render: () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Colonne 1</TableCell>
          <TableCell>Colonne 2</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        <Loading isLoading tableCols={2}>
          <TableRow>
            <TableCell>Ligne 1</TableCell>
            <TableCell>Valeur</TableCell>
          </TableRow>
        </Loading>
      </TableBody>
    </Table>
  ),
};
