import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
import { expect, within } from "storybook/test";
import { employeeColor } from "./index";
import { EmployeeAvatar } from "./EmployeeAvatar";

const marie = { id: 1, prenom: "Marie", nom: "Dupont" };

const meta = {
  title: "Employee/EmployeeAvatar",
  component: EmployeeAvatar,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "An Employee's color, initials and name, rendered as a sized avatar with a hover tooltip.",
      },
    },
  },
  args: {
    employee: marie,
  },
} satisfies Meta<typeof EmployeeAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: "small" },
};

export const Large: Story = {
  args: { size: "large" },
};

export const WithCallerDecoration: Story = {
  args: {
    size: "medium",
    sx: { border: "2px solid #4caf50" },
  },
};

export const Sizes: Story = {
  render: (args) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <EmployeeAvatar {...args} size="small" />
      <EmployeeAvatar {...args} size="medium" />
      <EmployeeAvatar {...args} size="large" />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    const avatars = await screen.findAllByTitle("Marie Dupont");
    const expectedSizes = [14, 24, 32];

    expect(avatars).toHaveLength(expectedSizes.length);
    avatars.forEach((avatar, index) => {
      expect(avatar).toHaveTextContent("MD");
      expect(avatar).toHaveStyle({
        width: `${expectedSizes[index]}px`,
        height: `${expectedSizes[index]}px`,
        backgroundColor: employeeColor(marie),
      });
    });
  },
};
