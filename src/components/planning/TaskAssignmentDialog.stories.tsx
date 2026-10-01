/**
 * Stories for the real assignment dialog, wired to the `/api/tasks/:id` endpoints.
 * Axios is monkey-patched per story with a tiny in-memory "server" (same pattern as
 * `StoreStats.stories.tsx`), so these exercise the actual fetch/mutate/debounce/queue
 * logic, not a mock component.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { EmployeeDto } from "@recyclerie/api/responses/employees";
import type { TimeRangeDto, WorkWindowDto } from "@recyclerie/api/responses/timeRanges";
import type { TaskModel } from "../../interfaces/Models";
import axiosInstance from "../../services/api/axios";
import TaskAssignmentDialog from "./TaskAssignmentDialog";

// Captured once, before any story patches the shared axios instance, so each story
// can restore the true original on unmount regardless of mount/unmount order.
const REAL_AXIOS = {
  get: axiosInstance.get.bind(axiosInstance),
  post: axiosInstance.post.bind(axiosInstance),
  put: axiosInstance.put.bind(axiosInstance),
  delete: axiosInstance.delete.bind(axiosInstance),
};

/** MUI's Dialog portals to `document.body`; locate it there, then scope queries to it. */
const dialogScreen = (canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body);
  return within(body.getByRole("dialog"));
};

// Task runs 08:00–11:00 Europe/Paris: `toIsoTime` converts the wire instant to Paris
// time, and in January Paris is UTC+1, so the UTC strings are one hour earlier.
const TASK: TaskModel = {
  id: 1,
  name: "Tri arrivage",
  description: null,
  category: "custom",
  priority: "medium",
  required_skills: null,
  location: null,
  equipment_needed: null,
  hourly_rate: null,
  scheduled_date: "2026-01-15T00:00:00.000Z" as TaskModel["scheduled_date"],
  start_time: "2026-01-15T07:00:00.000Z" as TaskModel["start_time"],
  end_time: "2026-01-15T10:00:00.000Z" as TaskModel["end_time"],
  notes: null,
  status: "pending",
  schedule_id: null,
  store_id: 1,
  collection_point_id: null,
  createdAt: "2026-01-01T00:00:00.000Z" as TaskModel["createdAt"],
  updatedAt: "2026-01-01T00:00:00.000Z" as TaskModel["updatedAt"],
  day_of_week: 4,
  Recyclery: { id: 1, name: "Magasin centre", city: "Lille", is_active: true },
};

const employee = (
  id: number,
  prenom: string,
  nom: string,
): EmployeeDto => ({
  id,
  nom,
  prenom,
  fullName: `${prenom} ${nom}`,
  isActive: true,
  phone: null,
  email: null,
  createdAt: "2026-01-01T00:00:00.000Z" as EmployeeDto["createdAt"],
  updatedAt: "2026-01-01T00:00:00.000Z" as EmployeeDto["updatedAt"],
});

const EMPLOYEES = {
  lea: employee(1, "Léa", "Martin"),
  karim: employee(2, "Karim", "Benali"),
  sophie: employee(3, "Sophie", "Durand"),
};

const window_ = (start: string, end: string): WorkWindowDto => ({
  start_time: start as WorkWindowDto["start_time"],
  end_time: end as WorkWindowDto["end_time"],
});

const WORK_WINDOWS: Record<number, WorkWindowDto[]> = {
  1: [window_("08:00", "16:00")],
  2: [window_("09:00", "17:00")],
  // Entirely after the task: Sophie has no free window on it at all.
  3: [window_("12:00", "16:00")],
};

const BUSY_RANGES: Record<number, TimeRangeDto[]> = {
  1: [],
  2: [
    {
      id: 900,
      employee_id: 2,
      task_id: 99,
      start_time: "09:00" as TimeRangeDto["start_time"],
      end_time: "10:30" as TimeRangeDto["end_time"],
      createdAt: "2026-01-01T00:00:00.000Z" as TimeRangeDto["createdAt"],
      updatedAt: "2026-01-01T00:00:00.000Z" as TimeRangeDto["updatedAt"],
    },
  ],
  3: [],
};

interface FakeServerOptions {
  /** Every write to this employee's ranges (create/update/delete) rejects with a 409. */
  rejectWritesFor?: number;
}

/** A tiny in-memory stand-in for the `/api/tasks/:id` endpoints used by the dialog. */
function createFakeServer(
  initialAssignments: Record<number, { start: string; end: string }[]>,
  options: FakeServerOptions = {},
) {
  let nextRangeId = 100;
  const ranges = new Map<number, TimeRangeDto[]>();
  for (const [employeeId, list] of Object.entries(initialAssignments)) {
    ranges.set(
      Number(employeeId),
      list.map((range) => ({
        id: nextRangeId++,
        employee_id: Number(employeeId),
        task_id: TASK.id,
        start_time: range.start as TimeRangeDto["start_time"],
        end_time: range.end as TimeRangeDto["end_time"],
        createdAt: "2026-01-01T00:00:00.000Z" as TimeRangeDto["createdAt"],
        updatedAt: "2026-01-01T00:00:00.000Z" as TimeRangeDto["updatedAt"],
      })),
    );
  }

  const reject = () =>
    Promise.reject({
      isAxiosError: true,
      response: { status: 409, data: { success: false, message: "Cette plage horaire n'est plus disponible." } },
    });

  const availableEmployees = () =>
    Object.values(EMPLOYEES).map((emp) => ({
      ...emp,
      workWindows: WORK_WINDOWS[emp.id] ?? [],
      busyRanges: BUSY_RANGES[emp.id] ?? [],
    }));

  const assignedEmployees = () =>
    Array.from(ranges.entries())
      .filter(([, list]) => list.length > 0)
      .map(([employeeId, list]) => ({
        ...Object.values(EMPLOYEES).find((emp) => emp.id === employeeId)!,
        timeRanges: list,
      }));

  return {
    get: (url: string) => {
      if (url === `/api/tasks/${TASK.id}/available-employees`) {
        return Promise.resolve({ data: { success: true, data: availableEmployees() } });
      }
      if (url === `/api/tasks/${TASK.id}/employees`) {
        return Promise.resolve({ data: { success: true, data: assignedEmployees() } });
      }
      return Promise.reject(new Error(`Unhandled GET ${url}`));
    },
    post: (url: string, body: { employee_id?: number; start_time: string; end_time: string }) => {
      const assignMatch = url === `/api/tasks/${TASK.id}/employees`;
      const rangeMatch = /\/api\/tasks\/\d+\/employees\/(\d+)\/time-ranges$/.exec(url);
      const employeeId = assignMatch ? body.employee_id! : Number(rangeMatch?.[1]);
      if (!assignMatch && !rangeMatch) return Promise.reject(new Error(`Unhandled POST ${url}`));
      if (employeeId === options.rejectWritesFor) return reject();
      const created: TimeRangeDto = {
        id: nextRangeId++,
        employee_id: employeeId,
        task_id: TASK.id,
        start_time: body.start_time as TimeRangeDto["start_time"],
        end_time: body.end_time as TimeRangeDto["end_time"],
        createdAt: "2026-01-01T00:00:00.000Z" as TimeRangeDto["createdAt"],
        updatedAt: "2026-01-01T00:00:00.000Z" as TimeRangeDto["updatedAt"],
      };
      ranges.set(employeeId, [...(ranges.get(employeeId) ?? []), created]);
      return Promise.resolve({ data: { success: true, data: created } });
    },
    put: (url: string, body: { start_time: string; end_time: string }) => {
      const match = /\/api\/tasks\/\d+\/employees\/(\d+)\/time-ranges\/(\d+)$/.exec(url);
      if (!match) return Promise.reject(new Error(`Unhandled PUT ${url}`));
      const employeeId = Number(match[1]);
      const rangeId = Number(match[2]);
      if (employeeId === options.rejectWritesFor) return reject();
      const list = ranges.get(employeeId) ?? [];
      const updated = list.map((range) =>
        range.id === rangeId
          ? { ...range, start_time: body.start_time as TimeRangeDto["start_time"], end_time: body.end_time as TimeRangeDto["end_time"] }
          : range,
      );
      ranges.set(employeeId, updated);
      return Promise.resolve({
        data: { success: true, data: updated.find((range) => range.id === rangeId) },
      });
    },
    delete: (url: string) => {
      const rangeMatch = /\/api\/tasks\/\d+\/employees\/(\d+)\/time-ranges\/(\d+)$/.exec(url);
      const employeeMatch = /\/api\/tasks\/\d+\/employees\/(\d+)$/.exec(url);
      if (rangeMatch) {
        const employeeId = Number(rangeMatch[1]);
        const rangeId = Number(rangeMatch[2]);
        ranges.set(employeeId, (ranges.get(employeeId) ?? []).filter((range) => range.id !== rangeId));
        return Promise.resolve({ data: { success: true, message: "Plage horaire supprimée avec succès" } });
      }
      if (employeeMatch) {
        ranges.delete(Number(employeeMatch[1]));
        return Promise.resolve({ data: { success: true, message: "Employé retiré avec succès" } });
      }
      return Promise.reject(new Error(`Unhandled DELETE ${url}`));
    },
  };
}

function StoryWrapper({
  initialAssignments = { 1: [{ start: "09:00", end: "10:00" }] },
  options = {},
  onAssignEmployee,
  onUnassignEmployee,
  onCloseWithChanges,
}: {
  initialAssignments?: Record<number, { start: string; end: string }[]>;
  options?: FakeServerOptions;
  onAssignEmployee?: (employeeId: number) => void;
  onUnassignEmployee?: (employeeId: number) => void;
  onCloseWithChanges?: () => void;
}) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { retry: false } } }),
  );
  // Patched synchronously during the first render (not in an effect): the dialog's
  // own `useQuery` fires from a child effect, which mounts before this component's
  // own effects would, so patching in an effect here would lose that first request
  // to the real (proxied, backend-less) axios instance.
  const [server] = useState(() => {
    const created = createFakeServer(initialAssignments, options);
    axiosInstance.get = ((url: string) => created.get(url)) as typeof axiosInstance.get;
    axiosInstance.post = ((url: string, body?: unknown) => created.post(url, body as never)) as typeof axiosInstance.post;
    axiosInstance.put = ((url: string, body?: unknown) => created.put(url, body as never)) as typeof axiosInstance.put;
    axiosInstance.delete = ((url: string) => created.delete(url)) as typeof axiosInstance.delete;
    return created;
  });

  useEffect(
    () => () => {
      axiosInstance.get = REAL_AXIOS.get;
      axiosInstance.post = REAL_AXIOS.post;
      axiosInstance.put = REAL_AXIOS.put;
      axiosInstance.delete = REAL_AXIOS.delete;
    },
    [],
  );
  void server;

  return (
    <QueryClientProvider client={queryClient}>
      <TaskAssignmentDialog
        open
        onClose={fn()}
        selectedTask={TASK}
        onAssignEmployee={onAssignEmployee}
        onUnassignEmployee={onUnassignEmployee}
        onCloseWithChanges={onCloseWithChanges}
      />
    </QueryClientProvider>
  );
}

const meta = {
  title: "Planning/TaskAssignmentDialog",
  component: StoryWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Real dialog wired to `/api/tasks/:id`, with axios mocked per story. Léa is free all task, Karim is busy 09:00–10:30 on another task, Sophie's Workday starts after the task ends.",
      },
    },
  },
} satisfies Meta<typeof StoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Léa already has one Time range; Karim shows his free window; Sophie is fully busy. */
export const Default: Story = {};

export const AssignAndUnassign: Story = {
  args: {
    initialAssignments: {},
  },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    // `toBeInTheDocument` rather than `toBeVisible`: right after mount, MUI's Dialog
    // is still mid fade-in, so a strict visibility check here is flaky.
    await expect(
      await screen.findByRole("heading", { name: "Employés assignés (0)" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Assigner Léa Martin" })).toBeEnabled(),
    );
    await expect(
      screen.getByRole("button", { name: "Impossible d'assigner Sophie Durand" }),
    ).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: "Assigner Léa Martin" }));

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Employés assignés (1)" })).toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Retirer Léa Martin de la tâche" }),
      ).toBeInTheDocument(),
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Retirer Léa Martin de la tâche" }),
    );

    await waitFor(() =>
      expect(screen.getByRole("heading", { name: "Employés assignés (0)" })).toBeInTheDocument(),
    );
    await expect(screen.getByRole("button", { name: "Assigner Léa Martin" })).toBeEnabled();
  },
};

/** Adding a second Time range shows a second slider and a per-range delete button. */
export const AddAndRemoveRange: Story = {
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    await screen.findByText("Plage horaire 1 · 09:00–10:00");

    const before = screen.getAllByRole("slider").length;
    await userEvent.click(
      screen.getByRole("button", { name: "Ajouter une plage horaire pour Léa Martin" }),
    );

    // Léa works 08:00–16:00, task runs 08:00–11:00, her first range already covers
    // 09:00–10:00: the earliest remaining free window inside the task is 08:00–09:00.
    // Ranges render sorted by start time, so the new one lands first and the
    // pre-existing one is renumbered "Plage horaire 2".
    await waitFor(() => expect(screen.getAllByRole("slider")).toHaveLength(before + 2));
    await expect(screen.getByText("Plage horaire 1 · 08:00–09:00")).toBeInTheDocument();
    await expect(screen.getByText("Plage horaire 2 · 09:00–10:00")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Retirer le plage horaire 2 de Léa Martin" }),
    );

    await waitFor(() => expect(screen.getAllByRole("slider")).toHaveLength(before));
    await expect(screen.getByText("Plage horaire 1 · 08:00–09:00")).toBeInTheDocument();
    await expect(screen.queryByText(/Plage horaire 2/)).not.toBeInTheDocument();
  },
};

/** A write the server rejects reverts the local edit back to what the server has. */
export const RejectedWriteReverts: Story = {
  args: {
    initialAssignments: {},
    options: { rejectWritesFor: EMPLOYEES.karim.id },
  },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    await screen.findByRole("button", { name: "Assigner Karim Benali" });

    await userEvent.click(screen.getByRole("button", { name: "Assigner Karim Benali" }));

    // Local state shows it assigned right away, then the server rejects the write,
    // so the dialog refetches and reverts — the transient "assigned" state is too
    // fast to assert on reliably, so only the settled, reverted state is checked.
    await waitFor(
      () =>
        expect(
          screen.getByRole("heading", { name: "Employés assignés (0)" }),
        ).toBeInTheDocument(),
      { timeout: 3000 },
    );
    await expect(screen.getByRole("button", { name: "Assigner Karim Benali" })).toBeEnabled();
  },
};
