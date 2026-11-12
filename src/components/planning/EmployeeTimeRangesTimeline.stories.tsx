import type { Meta, StoryObj } from "@storybook/react-vite";
import { Box } from "@mui/material";
import { EmployeeTimeRangesTimeline } from "./EmployeeTimeRangesTimeline";
import type { EmployeeTimeRangeItem } from "../../services/planning/printEntries";

const sampleTimeRanges: EmployeeTimeRangeItem[] = [
  {
    name: "Ouverture magasin",
    date: "2025-02-17",
    start_time: "09:00",
    end_time: "12:00",
    category: "vente",
    storeName: null,
  },
  {
    name: "Présence point de collecte",
    date: "2025-02-17",
    start_time: "14:00",
    end_time: "18:00",
    category: "point",
    storeName: null,
  },
  {
    name: "Vente",
    date: "2025-02-18",
    start_time: "10:00",
    end_time: "13:00",
    category: "vente",
    storeName: null,
  },
  {
    name: "Tri des dons",
    date: "2025-02-19",
    start_time: "08:30",
    end_time: "12:30",
    category: "sorting",
    storeName: null,
  },
  {
    name: "Collecte",
    date: "2025-02-20",
    start_time: "07:00",
    end_time: "11:00",
    category: "collection",
    storeName: null,
  },
];

/** One Employee covering the same Task in two parts: one entry per Time range. */
const twoRangesOnOneTask: EmployeeTimeRangeItem[] = [
  {
    name: "Vente",
    date: "2025-02-18",
    start_time: "09:00",
    end_time: "12:00",
    category: "vente",
    storeName: null,
  },
  {
    name: "Vente",
    date: "2025-02-18",
    start_time: "14:00",
    end_time: "17:00",
    category: "vente",
    storeName: null,
  },
];

const meta = {
  component: EmployeeTimeRangesTimeline,
  title: "Planning/EmployeeTimeRangesTimeline",
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Timeline that displays an employee's Time ranges with start/end time, day of week and task name. One entry per Time range, so a Task covered in two parts appears twice.",
      },
    },
  },
  argTypes: {
    timeRanges: {
      description: "List of employee Time ranges to display.",
      control: false,
    },
    employeeName: {
      description: "Employee name shown at the top (e.g. for printing).",
      control: "text",
    },
  },
  decorators: [
    (Story) => (
      <Box sx={{ maxWidth: 420, width: "100%" }}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof EmployeeTimeRangesTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default timeline with a week of sample Time ranges. */
export const Default: Story = {
  args: {
    timeRanges: sampleTimeRanges,
  },
};

/** With employee name on top (e.g. for printing). */
export const WithEmployeeName: Story = {
  args: {
    timeRanges: sampleTimeRanges,
    employeeName: "Marie Dupont",
  },
};

/** Single Time range. */
export const SingleTimeRange: Story = {
  args: {
    timeRanges: [sampleTimeRanges[0]],
  },
};

/** Two Time ranges on the same day. */
export const SameDay: Story = {
  args: {
    timeRanges: sampleTimeRanges.slice(0, 2),
  },
};

/** Two Time ranges on one Task: the task name is repeated. */
export const TwoRangesOnOneTask: Story = {
  args: {
    timeRanges: twoRangesOnOneTask,
    employeeName: "Marie Dupont",
  },
};

/** Empty list shows a placeholder message. */
export const Empty: Story = {
  args: {
    timeRanges: [],
  },
};
