import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import type { EmployeeModel, TaskModel } from "../../interfaces/Models";
import { employeeColor } from "../../employee";
import WeekViewSections from "./WeekViewSections";

const nowIso = new Date().toISOString();

const marie: EmployeeModel = {
  id: 1,
  nom: "Dupont",
  prenom: "Marie",
  isActive: true,
  phone: null,
  email: null,
  createdAt: nowIso,
  updatedAt: nowIso,
};

const sampleSchedules: TaskModel[] = [
  {
    id: 60,
    createdAt: nowIso,
    updatedAt: nowIso,
    name: "Vente matin",
    description: null,
    category: "vente",
    priority: null,
    required_skills: null,
    location: null,
    equipment_needed: null,
    hourly_rate: null,
    scheduled_date: "2026-02-10T08:42:28.630Z",
    start_time: "2026-01-12T09:00:00.000Z",
    end_time: "2026-01-12T12:00:00.000Z",
    notes: null,
    status: null,
    schedule_id: 60,
    store_id: 1,
    collection_point_id: null,
    day_of_week: 1,
    Employees: [marie],
  },
  {
    id: 61,
    createdAt: nowIso,
    updatedAt: nowIso,
    name: "Collecte après-midi",
    description: null,
    category: "collection",
    priority: null,
    required_skills: null,
    location: "Point Nord",
    equipment_needed: null,
    hourly_rate: null,
    scheduled_date: "2026-02-11T08:42:28.630Z",
    start_time: "2026-01-13T14:00:00.000Z",
    end_time: "2026-01-13T17:00:00.000Z",
    notes: null,
    status: null,
    schedule_id: 61,
    store_id: null,
    collection_point_id: 1,
    day_of_week: 2,
  },
];

const handlers = {
  handleAssignEmployeesToTask: () => {},
  handleOpenDialog: () => {},
  handleDeleteTask: () => {},
};

const meta = {
  title: "Planning/WeekViewSections",
  component: WeekViewSections,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Week planning sections grouped by task category and time slot (vente, point, collection).",
      },
    },
  },
  args: {
    selectedDate: new Date("2026-02-10"),
    schedules: sampleSchedules,
    ...handlers,
  },
} satisfies Meta<typeof WeekViewSections>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const screen = within(canvasElement);
    const avatar = await screen.findByTitle("Marie Dupont");

    await expect(avatar).toHaveTextContent("MD");
    await expect(avatar).toHaveStyle({ backgroundColor: employeeColor(marie) });
  },
};

export const EmptyWeek: Story = {
  args: {
    schedules: [],
  },
};
