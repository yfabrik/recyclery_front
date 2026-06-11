import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box, Grid, Typography } from "@mui/material";
import { SelectedIcon } from "./SelectedIcon";

const knownIcons = [
  "Category",
  "Checkroom",
  "Book",
  "Chair",
  "Computer",
  "Home",
  "Create",
  "Flag",
];

const meta = {
  title: "Components/SelectedIcon",
  component: SelectedIcon,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Renders an MUI icon by string name from the internal map. Returns null for unknown names.",
      },
    },
  },
} satisfies Meta<typeof SelectedIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const IconGrid: Story = {
  render: () => (
    <Grid container spacing={2}>
      {knownIcons.map((name) => (
        <Grid key={name} size={{ xs: 4, sm: 3, md: 2 }}>
          <Box sx={{ textAlign: "center" }}>
            <SelectedIcon iconName={name} props={{ fontSize: "large" }} />
            <Typography variant="caption" display="block">
              {name}
            </Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  ),
};

export const UnknownFallback: Story = {
  render: () => (
    <Box>
      <Typography variant="body2" gutterBottom>
        Unknown icon name renders nothing:
      </Typography>
      <SelectedIcon iconName="NotARealIcon" />
      <Typography variant="caption" color="text.secondary">
        (empty — null fallback)
      </Typography>
    </Box>
  ),
};
