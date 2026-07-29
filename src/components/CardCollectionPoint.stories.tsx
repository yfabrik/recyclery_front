import type { Meta, StoryObj } from "@storybook/react-vite";
import type { TaskScheduleRefDto } from "@recyclerie/api/responses/taskSchedule";
import { expect, fn, userEvent, within } from "storybook/test";
import type { CollectionPointModel } from "../interfaces/Models";
import { mockCollectionPoints } from "../stories/fixtures";
import { CardCollectionPoint } from "./CardCollectionPoint";

const schedule: TaskScheduleRefDto = {
  id: 5,
  name: "Collecte hebdomadaire",
  is_recurring: true,
  category: "point",
  scheduled_date: "2026-02-10T12:55:17.500Z",
  start_time: "2026-02-06T08:00:13.017Z",
  end_time: "2026-02-06T16:00:13.017Z",
  day_of_week: 2,
  recurrence_pattern: "weekly",
  collection_point_id: 1,
  store_id: null,
};

const inactiveSchedule: TaskScheduleRefDto = {
  ...schedule,
  id: 7,
  name: "Collecte inactive",
  is_recurring: false,
  day_of_week: 5,
};

const basePoint: CollectionPointModel = {
  ...mockCollectionPoints[0],
  TaskSchedules: [schedule],
};

const handlers = {
  handleOpenHoursDialog: fn(),
  handleDeleteHours: fn(),
  handleOpenDialog: fn(),
  handleDeletePoint: fn(),
};

const meta = {
  title: "Planning/CardCollectionPoint",
  component: CardCollectionPoint,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Collection point card with schedules, contact info, and edit/delete actions.",
      },
    },
  },
  args: {
    point: basePoint,
    ...handlers,
  },
} satisfies Meta<typeof CardCollectionPoint>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSchedules: Story = {
  args: {
    point: {
      ...basePoint,
      TaskSchedules: [
        schedule,
        { ...schedule, id: 6, day_of_week: 4, name: "Collecte jeudi" },
      ],
    },
  },
};

export const Inactive: Story = {
  args: {
    point: {
      ...basePoint,
      is_active: false,
      name: "Point collecte Sud (fermé)",
      TaskSchedules: [],
    },
  },
};

export const EmptySchedules: Story = {
  args: {
    point: {
      ...basePoint,
      TaskSchedules: [],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText("Aucun horaire de présence pour ce point de collecte"),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole("button", { name: /Ajouter/i }),
    ).toBeInTheDocument();
  },
};

export const WithoutContact: Story = {
  args: {
    point: {
      ...basePoint,
      contact_phone: null,
      contact_email: null,
      TaskSchedules: [schedule],
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText(args.point.address!)).toBeInTheDocument();
    await expect(
      canvas.queryByText(basePoint.contact_phone!),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText(basePoint.contact_email!),
    ).not.toBeInTheDocument();
  },
};

export const InactiveScheduleRow: Story = {
  args: {
    point: {
      ...basePoint,
      TaskSchedules: [inactiveSchedule],
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inactiveLabels = canvas.getAllByText("Inactif");
    await expect(inactiveLabels.length).toBeGreaterThanOrEqual(1);
  },
};

/**
 * Interaction test for the Storybook Vitest addon:
 * asserts render content and that edit/delete/add/hours handlers are called.
 */
export const WithPlayTest: Story = {
  args: {
    point: basePoint,
    handleOpenHoursDialog: fn(),
    handleDeleteHours: fn(),
    handleOpenDialog: fn(),
    handleDeletePoint: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText(args.point.name)).toBeInTheDocument();
    await expect(canvas.getByText(args.point.address!)).toBeInTheDocument();
    await expect(canvas.getByText("Active")).toBeInTheDocument();
    await expect(canvas.getByText("Présent")).toBeInTheDocument();
    await expect(canvas.getByRole("table")).toBeInTheDocument();

    // Header: edit, delete; schedule row: edit, delete; then "Ajouter"
    const addButton = canvas.getByRole("button", { name: /Ajouter/i });
    const actionButtons = canvas
      .getAllByRole("button")
      .filter((b) => b !== addButton);

    await userEvent.click(actionButtons[0]);
    await expect(args.handleOpenDialog).toHaveBeenCalledWith(args.point);

    await userEvent.click(actionButtons[1]);
    await expect(args.handleDeletePoint).toHaveBeenCalledWith(args.point);

    await userEvent.click(actionButtons[2]);
    await expect(args.handleOpenHoursDialog).toHaveBeenCalledWith(
      args.point.TaskSchedules![0],
    );

    await userEvent.click(actionButtons[3]);
    await expect(args.handleDeleteHours).toHaveBeenCalledWith(
      args.point.TaskSchedules![0].id,
    );

    await userEvent.click(addButton);
    await expect(args.handleOpenHoursDialog).toHaveBeenCalledWith(
      null,
      args.point.id,
    );
  },
};
