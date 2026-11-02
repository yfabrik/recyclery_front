/**
 * Stories for the Employee day dialog, wired to `GET /api/employees/:id/tasks` and to the
 * task endpoints it writes through (assign, remove).
 * Axios is monkey-patched per story with a tiny in-memory server (`stories/fakeAxios`,
 * `stories/fixtures/employeeDayServer`), so these run the real services, query hook,
 * local state, write queue and components, not a mock. The day is Thursday 2026-01-15;
 * fixtures live in `stories/fixtures/employeeDay`. Toasts render in the story's own
 * `ToastContainer`, so rejected writes can be asserted on their message.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { EmployeeTasksDayDto } from "@recyclerie/api/responses/employeeTasks";
import { useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { Employee } from "../../employee";
import { installFakeServer, restoreAxios } from "../../stories/fakeAxios";
import { createEmployeeDayServer, type FakeApiError, type FakeWrite } from "../../stories/fixtures/employeeDayServer";
import {
  DAY,
  EMPLOYEES,
  emptyDay,
  inesOnVacationDay,
  inesVacationConflictDay,
  karimDay,
  leaDay,
  marcDay,
  sophieDay,
} from "../../stories/fixtures/employeeDay";
import { EmployeeDayDialog } from "./EmployeeDayDialog";

/** Everything on the page, the portaled dialog and tooltips and the toasts included. */
const pageScreen = (canvasElement: HTMLElement) => within(canvasElement.ownerDocument.body);

/** MUI's Dialog portals to `document.body`; locate it there, then scope queries to it. */
const dialogScreen = (canvasElement: HTMLElement) => {
  const body = within(canvasElement.ownerDocument.body);
  return within(body.getByRole("dialog"));
};

interface StoryWrapperProps {
  employee: Employee;
  /** What the server answers for that Employee's day. */
  day: EmployeeTasksDayDto;
  /** The server answers every read with this error instead. */
  failWith?: FakeApiError;
  /** Called with the URL and query params of each employee-tasks request. */
  onRequest?: (url: string, params: unknown) => void;
  /** Return an error to make the server refuse that write. */
  rejectWrite?: (write: FakeWrite) => FakeApiError | undefined;
  /** Called with each write the server receives (refused ones included). */
  onWrite?: (write: FakeWrite) => void;
  onClose?: () => void;
  onCloseWithChanges?: () => void;
  /** Called with the story's QueryClient, to look at its cache. */
  onQueryClient?: (client: QueryClient) => void;
}

function StoryWrapper({
  employee,
  day,
  failWith,
  onRequest,
  rejectWrite,
  onWrite,
  onClose,
  onCloseWithChanges,
  onQueryClient,
}: StoryWrapperProps) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  // Installed synchronously during the first render: see `stories/fakeAxios`.
  useState(() => {
    const { server } = createEmployeeDayServer({
      employeeId: employee.id,
      day,
      ...(failWith ? { failReadsWith: failWith } : {}),
      ...(rejectWrite ? { rejectWrite } : {}),
      ...(onRequest ? { onRead: onRequest } : {}),
      ...(onWrite ? { onWrite } : {}),
    });
    installFakeServer(server);
    onQueryClient?.(queryClient);
    return null;
  });
  useEffect(() => restoreAxios, []);

  return (
    <QueryClientProvider client={queryClient}>
      <EmployeeDayDialog
        open
        onClose={onClose ?? fn()}
        {...(onCloseWithChanges ? { onCloseWithChanges } : {})}
        employee={employee}
        date={DAY}
      />
      <ToastContainer />
    </QueryClientProvider>
  );
}

/** The QueryClient of the story being played, handed over by the wrapper. */
const probe: { client?: QueryClient } = {};

const meta = {
  title: "Planning/EmployeeDayDialog",
  component: StoryWrapper,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Real dialog wired to `GET /api/employees/:id/tasks` with axios mocked per story. Assigned Tasks (with the Employee's Time ranges) on the left, assignable and unavailable Tasks on the right, work hours and Time ranges on the day strip. \"+\" assigns the Employee on the Task's first free window, the trash button removes them from the Task. Each Time range has the Task assignment dialog's slider (blocked zones cannot be entered), \"Ajouter une plage horaire\" and, with several ranges, a per-range delete. All update the dialog at once and are written through the shared write queue.",
      },
    },
  },
  args: {
    employee: EMPLOYEES.lea,
    day: leaDay,
    onRequest: fn(),
    onWrite: fn(),
    onClose: fn(),
    onCloseWithChanges: fn(),
    onQueryClient: (client) => {
      probe.client = client;
    },
  },
} satisfies Meta<typeof StoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * Léa works 08:00-16:00 and holds two Tasks (two Time ranges on the first); one Task is
 * still free. The request carries the day only: no Store parameter.
 */
export const AssignedTasks: Story = {
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    await expect(screen.getByRole("heading", { name: "Léa Martin" })).toBeInTheDocument();
    await expect(screen.getByText("jeudi 15 janvier")).toBeInTheDocument();
    await expect(
      within(screen.getByRole("group", { name: "Horaires de travail" })).getByText("08:00–16:00"),
    ).toBeInTheDocument();

    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.getByText("Tri arrivage")).toBeInTheDocument();
    await expect(assigned.getByText("08:00–11:00 · Magasin centre")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 08:30–09:30")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 2 · 10:00–11:00")).toBeInTheDocument();
    await expect(assigned.getByText("Vente atelier")).toBeInTheDocument();
    await expect(assigned.getByText("13:00–16:00 · Magasin nord")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 13:00–15:00")).toBeInTheDocument();

    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getByText("Collecte")).toBeInTheDocument();
    await expect(assignable.getByText("Libre 11:00–13:00")).toBeInTheDocument();
    await expect(assignable.queryByText("Tri arrivage")).not.toBeInTheDocument();

    const strip = within(screen.getByRole("group", { name: "Journée de Léa Martin" }));
    await expect(strip.getByText("Journée de l'employé — 4 h assignées sur 8 h de présence")).toBeInTheDocument();
    await expect(strip.getByRole("img", { name: "Horaires de travail 08:00–16:00" })).toBeInTheDocument();
    await expect(strip.getByRole("img", { name: "Tri arrivage · 08:30–09:30" })).toBeInTheDocument();
    await expect(strip.getByRole("img", { name: "Tri arrivage · 10:00–11:00" })).toBeInTheDocument();
    await expect(strip.getByRole("img", { name: "Vente atelier · 13:00–15:00" })).toBeInTheDocument();

    await expect(args.onRequest).toHaveBeenCalledTimes(1);
    await expect(args.onRequest).toHaveBeenCalledWith("/api/employees/1/tasks", {
      date_from: DAY,
      date_to: DAY,
    });
  },
};

/** Sophie only works in the afternoon: the morning Tasks are out of hours, nothing is assigned. */
export const HalfDayOutsideHours: Story = {
  args: { employee: EMPLOYEES.sophie, day: sophieDay },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (0)" })).toBeInTheDocument();
    await expect(
      within(screen.getByRole("group", { name: "Horaires de travail" })).getByText("13:00–17:00"),
    ).toBeInTheDocument();

    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.getByText("Aucune tâche assignée")).toBeInTheDocument();

    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getAllByText("Hors de ses horaires de travail")).toHaveLength(2);
    await expect(assignable.getAllByText("Impossible")).toHaveLength(2);
    await expect(assignable.getByText("Libre 13:00–16:00")).toBeInTheDocument();
    await expect(assignable.getByText("Libre")).toBeInTheDocument();
  },
};

/** Karim holds "Tri textile" 09:00-12:00, so "Tri arrivage" is busy for him; "Vente atelier" is free. */
export const BusyOnAnotherTask: Story = {
  args: { employee: EMPLOYEES.karim, day: karimDay },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (1)" })).toBeInTheDocument();
    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.getByText("Tri textile")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 09:00–12:00")).toBeInTheDocument();

    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getByText("Tri arrivage")).toBeInTheDocument();
    await expect(assignable.getByText("Déjà sur « Tri textile »")).toBeInTheDocument();
    await expect(assignable.getByText("Impossible")).toBeInTheDocument();
    await expect(assignable.getByText("Vente atelier")).toBeInTheDocument();
    await expect(assignable.getByText("Libre 13:00–16:00")).toBeInTheDocument();
  },
};

/** An Employee with no Workday and no Task that day. */
export const EmptyDay: Story = {
  args: { employee: EMPLOYEES.marc, day: emptyDay },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByText("Aucune tâche planifiée ce jour")).toBeInTheDocument();
    await expect(screen.getByText("Ne travaille pas ce jour")).toBeInTheDocument();
    await expect(screen.queryByRole("heading", { name: /Tâches assignées/ })).not.toBeInTheDocument();
    await expect(screen.queryByRole("heading", { name: "Tâches assignables" })).not.toBeInTheDocument();
  },
};

/** Marc holds every Task of the day: the assignable column is empty. */
export const NothingAssignable: Story = {
  args: { employee: EMPLOYEES.marc, day: marcDay },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    await expect(screen.getByText("Aucune autre tâche ce jour")).toBeInTheDocument();
  },
};

/**
 * Inès is on Vacation and holds nothing: an info alert gives the reason and says no Task can
 * be assigned; every Task of the day is unavailable for the same reason.
 */
export const OnVacationNothingAssigned: Story = {
  args: { employee: EMPLOYEES.ines, day: inesOnVacationDay },
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (0)" })).toBeInTheDocument();
    await expect(screen.getByRole("alert")).toHaveTextContent(
      "En congé (Congé payé) : aucune tâche ne peut lui être assignée.",
    );

    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getAllByText("En congé")).toHaveLength(3);
    await expect(assignable.getAllByText("Impossible")).toHaveLength(3);
    await expect(assignable.queryByText(/^Libre/)).not.toBeInTheDocument();
  },
};

/** The server refuses the request: the dialog shows the API message and lets the user retry. */
export const LoadError: Story = {
  args: { failWith: { status: 500, message: "Erreur serveur" } },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("alert")).toHaveTextContent("Erreur serveur");
    await userEvent.click(screen.getByRole("button", { name: "Réessayer" }));
    await waitFor(() => expect(args.onRequest).toHaveBeenCalledTimes(2));
  },
};

/** Léa's "+" on the free Task moves it to the assigned column at once, on its first free window. */
export const AssignTask: Story = {
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: "Assigner Léa Martin à Collecte" }));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (3)" })).toBeInTheDocument();
    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.getByText("Collecte")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 11:00–13:00")).toBeInTheDocument();
    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.queryByText("Collecte")).not.toBeInTheDocument();
    await expect(assignable.getByText("Aucune autre tâche ce jour")).toBeInTheDocument();

    const strip = within(screen.getByRole("group", { name: "Journée de Léa Martin" }));
    await expect(strip.getByText("Journée de l'employé — 6 h assignées sur 8 h de présence")).toBeInTheDocument();
    await expect(strip.getByRole("img", { name: "Collecte · 11:00–13:00" })).toBeInTheDocument();

    // One write, through the existing assign endpoint, on that first free window.
    await waitFor(() =>
      expect(args.onWrite).toHaveBeenCalledWith({
        method: "POST",
        url: "/api/tasks/2/employees",
        body: { employee_id: 1, start_time: "11:00", end_time: "13:00" },
      }),
    );
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
  },
};

/** The trash button removes Léa from the Task at once: it is assignable again, with its free window. */
export const UnassignTask: Story = {
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: "Retirer Léa Martin de Tri arrivage" }));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (1)" })).toBeInTheDocument();
    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.queryByText("Tri arrivage")).not.toBeInTheDocument();
    await expect(assigned.getByText("Vente atelier")).toBeInTheDocument();
    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getByText("Tri arrivage")).toBeInTheDocument();
    await expect(assignable.getByText("Libre 08:00–11:00")).toBeInTheDocument();

    const strip = within(screen.getByRole("group", { name: "Journée de Léa Martin" }));
    await expect(strip.getByText("Journée de l'employé — 2 h assignées sur 8 h de présence")).toBeInTheDocument();
    await expect(strip.queryByRole("img", { name: "Tri arrivage · 08:30–09:30" })).not.toBeInTheDocument();

    // One write for all of the Employee's Time ranges on that Task.
    await waitFor(() =>
      expect(args.onWrite).toHaveBeenCalledWith({
        method: "DELETE",
        url: "/api/tasks/1/employees/1",
        body: undefined,
      }),
    );
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
  },
};

/** Statuses follow the local Time ranges: freeing "Tri textile" frees "Tri arrivage", taking that one blocks it again. */
export const OtherTasksFollowLocalChanges: Story = {
  args: { employee: EMPLOYEES.karim, day: karimDay },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    const assignable = within(await screen.findByRole("region", { name: "Tâches assignables" }));
    await expect(await assignable.findByText("Déjà sur « Tri textile »")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Retirer Karim Benali de Tri textile" }));

    await expect(await assignable.findByText("Libre 09:00–11:00")).toBeInTheDocument();
    await expect(assignable.queryByText("Déjà sur « Tri textile »")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Assigner Karim Benali à Tri arrivage" }));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (1)" })).toBeInTheDocument();
    await expect(await assignable.findByText("Libre 11:00–12:00")).toBeInTheDocument();
    await waitFor(() => expect(args.onWrite).toHaveBeenCalledTimes(2));
    await expect(args.onWrite).toHaveBeenLastCalledWith({
      method: "POST",
      url: "/api/tasks/1/employees",
      body: { employee_id: 2, start_time: "09:00", end_time: "11:00" },
    });
  },
};

/** A Task the Employee has no free window on cannot be assigned: disabled button, the reason in a tooltip. */
export const BusyTaskCannotBeAssigned: Story = {
  args: { employee: EMPLOYEES.karim, day: karimDay },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    const button = await screen.findByRole("button", { name: "Impossible d'assigner Tri arrivage" });
    await expect(button).toBeDisabled();
    await expect(screen.queryByRole("button", { name: "Assigner Karim Benali à Tri arrivage" })).not.toBeInTheDocument();
    // The assignable Task next to it still has its "+".
    await expect(screen.getByRole("button", { name: "Assigner Karim Benali à Vente atelier" })).toBeEnabled();

    if (!button.parentElement) throw new Error("the disabled button is wrapped so that it can carry a tooltip");
    await userEvent.hover(button.parentElement);
    await expect(await pageScreen(canvasElement).findByRole("tooltip")).toHaveTextContent("Déjà sur « Tri textile »");
    await expect(args.onWrite).not.toHaveBeenCalled();
  },
};

/** On Vacation, every Task has a disabled assign button whose tooltip says why. */
export const VacationDisablesAssigning: Story = {
  args: { employee: EMPLOYEES.ines, day: inesOnVacationDay },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    const button = await screen.findByRole("button", { name: "Impossible d'assigner Tri arrivage" });
    await expect(button).toBeDisabled();
    await expect(screen.getByRole("button", { name: "Impossible d'assigner Collecte" })).toBeDisabled();
    await expect(screen.getByRole("button", { name: "Impossible d'assigner Vente atelier" })).toBeDisabled();
    await expect(screen.queryByRole("button", { name: /^Assigner / })).not.toBeInTheDocument();

    if (!button.parentElement) throw new Error("the disabled button is wrapped so that it can carry a tooltip");
    await userEvent.hover(button.parentElement);
    await expect(await pageScreen(canvasElement).findByRole("tooltip")).toHaveTextContent("En congé");
    await expect(args.onWrite).not.toHaveBeenCalled();
  },
};

/** The server refuses the assignment (409): the dialog goes back to the server's day and toasts the message. */
export const RejectedAssignRevertsWithToast: Story = {
  args: {
    rejectWrite: ({ method }) =>
      method === "POST" ? { status: 409, message: "Léa Martin est déjà occupée sur cette plage" } : undefined,
  },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: "Assigner Léa Martin à Collecte" }));

    // The toast comes after the revert, so what follows is the server's state.
    await expect(
      await pageScreen(canvasElement).findByText("Léa Martin est déjà occupée sur cette plage", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    await expect(await screen.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getByText("Collecte")).toBeInTheDocument();
    await expect(assignable.getByText("Libre 11:00–13:00")).toBeInTheDocument();
    await expect(
      within(screen.getByRole("group", { name: "Journée de Léa Martin" })).queryByRole("img", {
        name: "Collecte · 11:00–13:00",
      }),
    ).not.toBeInTheDocument();
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
    await expect(args.onRequest).toHaveBeenCalledTimes(2); // the day, then the revert's refetch
  },
};

/** The server refuses the removal (409): Léa is back on the Task with her Time ranges, and the message is toasted. */
export const RejectedUnassignRevertsWithToast: Story = {
  args: {
    rejectWrite: ({ method }) =>
      method === "DELETE" ? { status: 409, message: "Impossible de retirer Léa Martin de cette tâche" } : undefined,
  },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: "Retirer Léa Martin de Tri arrivage" }));

    await expect(
      await pageScreen(canvasElement).findByText("Impossible de retirer Léa Martin de cette tâche", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    await expect(await screen.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.getByText("Plage horaire 1 · 08:30–09:30")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 2 · 10:00–11:00")).toBeInTheDocument();
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
    await expect(args.onRequest).toHaveBeenCalledTimes(2);
  },
};

/** The input behind one thumb of a Time range's slider (`Début`/`Fin`), focusable and driven by the keyboard. */
const thumb = (screen: ReturnType<typeof dialogScreen>, which: "Début" | "Fin", position: number, subject: string) =>
  screen.getByRole("slider", { name: `${which} plage horaire ${position} de ${subject}` });

const LEA_ON_TRI = "Léa Martin sur Tri arrivage";
const LEA_ON_VENTE = "Léa Martin sur Vente atelier";

/**
 * "Ajouter une plage horaire" puts a second range in the first window left on the Task and
 * writes it through the Time range endpoint; the Task is then full, so the button is disabled.
 * The day strip follows.
 */
export const AddTimeRange: Story = {
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    const assigned = within(await screen.findByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.queryByText("Plage horaire 2 · 15:00–16:00")).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole("button", { name: `Ajouter une plage horaire pour ${LEA_ON_VENTE}` }));

    await expect(await assigned.findByText("Plage horaire 2 · 15:00–16:00")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 13:00–15:00")).toBeInTheDocument();
    // Two ranges now: each can be deleted, and each has its own slider.
    await expect(screen.getByRole("button", { name: `Retirer le plage horaire 2 de ${LEA_ON_VENTE}` })).toBeEnabled();
    await expect(thumb(screen, "Début", 2, LEA_ON_VENTE)).toBeInTheDocument();
    await expect(thumb(screen, "Fin", 2, LEA_ON_VENTE)).toBeInTheDocument();

    const strip = within(screen.getByRole("group", { name: "Journée de Léa Martin" }));
    await expect(strip.getByRole("img", { name: "Vente atelier · 15:00–16:00" })).toBeInTheDocument();
    await expect(strip.getByText("Journée de l'employé — 5 h assignées sur 8 h de présence")).toBeInTheDocument();

    // The Task has no free window left.
    await expect(screen.getByRole("button", { name: `Ajouter une plage horaire pour ${LEA_ON_VENTE}` })).toBeDisabled();

    await waitFor(() =>
      expect(args.onWrite).toHaveBeenCalledWith({
        method: "POST",
        url: "/api/tasks/3/employees/1/time-ranges",
        body: { start_time: "15:00", end_time: "16:00" },
      }),
    );
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
  },
};

/** The new range takes the first free window, even before the existing ranges: ranges are numbered by start. */
export const AddTimeRangeInFirstFreeWindow: Story = {
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    const assigned = within(await screen.findByRole("region", { name: "Tâches assignées" }));

    // 08:30-09:30 and 10:00-11:00 are held; 08:00-08:30 is the first window left.
    await userEvent.click(await screen.findByRole("button", { name: `Ajouter une plage horaire pour ${LEA_ON_TRI}` }));

    await expect(await assigned.findByText("Plage horaire 3 · 10:00–11:00")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 08:00–08:30")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 2 · 08:30–09:30")).toBeInTheDocument();
    await waitFor(() =>
      expect(args.onWrite).toHaveBeenCalledWith({
        method: "POST",
        url: "/api/tasks/1/employees/1/time-ranges",
        body: { start_time: "08:00", end_time: "08:30" },
      }),
    );
  },
};

/** A Task whose Time range fills it has no room for another: disabled button, tooltip, no write. */
export const NoFreeWindowDisablesAddTimeRange: Story = {
  args: { employee: EMPLOYEES.marc, day: marcDay },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    const button = await screen.findByRole("button", { name: "Ajouter une plage horaire pour Marc Petit sur Tri arrivage" });
    await expect(button).toBeDisabled();
    await expect(
      screen.getByRole("button", { name: "Ajouter une plage horaire pour Marc Petit sur Collecte" }),
    ).toBeDisabled();

    if (!button.parentElement) throw new Error("the disabled button is wrapped so that it can carry a tooltip");
    await userEvent.hover(button.parentElement);
    await expect(await pageScreen(canvasElement).findByRole("tooltip")).toHaveTextContent("Plus de plage horaire libre");
    await expect(args.onWrite).not.toHaveBeenCalled();
  },
};

/**
 * A Task with several Time ranges lets each be deleted (one write for that range); the last
 * one cannot, it is removed by unassigning. The day strip follows.
 */
export const RemoveTimeRange: Story = {
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    const assigned = within(await screen.findByRole("region", { name: "Tâches assignées" }));
    // Only the Task with two ranges offers a delete.
    await expect(await screen.findAllByRole("button", { name: /^Retirer le plage horaire/ })).toHaveLength(2);

    await userEvent.click(screen.getByRole("button", { name: `Retirer le plage horaire 1 de ${LEA_ON_TRI}` }));

    await expect(await assigned.findByText("Plage horaire 1 · 10:00–11:00")).toBeInTheDocument();
    await expect(assigned.queryByText("Plage horaire 1 · 08:30–09:30")).not.toBeInTheDocument();
    await expect(assigned.queryByText(/^Plage horaire 2 · 10:00/)).not.toBeInTheDocument();
    // Left with one range, the Task offers no delete any more.
    await expect(screen.queryAllByRole("button", { name: /^Retirer le plage horaire/ })).toHaveLength(0);
    await expect(screen.getByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();

    const strip = within(screen.getByRole("group", { name: "Journée de Léa Martin" }));
    await expect(strip.queryByRole("img", { name: "Tri arrivage · 08:30–09:30" })).not.toBeInTheDocument();
    await expect(strip.getByRole("img", { name: "Tri arrivage · 10:00–11:00" })).toBeInTheDocument();

    await waitFor(() =>
      expect(args.onWrite).toHaveBeenCalledWith({
        method: "DELETE",
        url: "/api/tasks/1/employees/1/time-ranges/100",
        body: undefined,
      }),
    );
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
  },
};

/**
 * Dragging moves the range and the day strip at once; the writes of one drag are debounced
 * into a single update of that range.
 */
export const AdjustTimeRange: Story = {
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    const assigned = within(await screen.findByRole("region", { name: "Tâches assignées" }));

    const end = await waitFor(() => thumb(screen, "Fin", 1, LEA_ON_VENTE));
    end.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");

    await expect(assigned.getByText("Plage horaire 1 · 13:00–15:30")).toBeInTheDocument();
    const strip = within(screen.getByRole("group", { name: "Journée de Léa Martin" }));
    await expect(strip.getByRole("img", { name: "Vente atelier · 13:00–15:30" })).toBeInTheDocument();

    await waitFor(() => expect(args.onWrite).toHaveBeenCalledTimes(1));
    await expect(args.onWrite).toHaveBeenCalledWith({
      method: "PUT",
      url: "/api/tasks/3/employees/1/time-ranges/300",
      body: { start_time: "13:00", end_time: "15:30" },
    });
  },
};

/**
 * A range cannot be dragged into a zone the Employee cannot work: the 2nd range of "Tri arrivage"
 * stops at 09:30, where the 1st range (08:30-09:30) ends.
 */
export const DragStopsAtBlockedZone: Story = {
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    const assigned = within(await screen.findByRole("region", { name: "Tâches assignées" }));

    const start = await waitFor(() => thumb(screen, "Début", 2, LEA_ON_TRI));
    start.focus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowLeft}");

    await expect(assigned.getByText("Plage horaire 2 · 09:30–11:00")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 08:30–09:30")).toBeInTheDocument();

    await waitFor(() => expect(args.onWrite).toHaveBeenCalledTimes(1));
    await expect(args.onWrite).toHaveBeenCalledWith({
      method: "PUT",
      url: "/api/tasks/1/employees/1/time-ranges/101",
      body: { start_time: "09:30", end_time: "11:00" },
    });
  },
};

/** The server refuses the new range (409): it disappears again and the message is toasted. */
export const RejectedAddTimeRangeRevertsWithToast: Story = {
  args: {
    rejectWrite: ({ method }) =>
      method === "POST" ? { status: 409, message: "Cette plage horaire n'est plus disponible" } : undefined,
  },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: `Ajouter une plage horaire pour ${LEA_ON_VENTE}` }));

    await expect(
      await pageScreen(canvasElement).findByText("Cette plage horaire n'est plus disponible", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    const assigned = within(await screen.findByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.queryByText("Plage horaire 2 · 15:00–16:00")).not.toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 1 · 13:00–15:00")).toBeInTheDocument();
    await expect(
      within(screen.getByRole("group", { name: "Journée de Léa Martin" })).queryByRole("img", {
        name: "Vente atelier · 15:00–16:00",
      }),
    ).not.toBeInTheDocument();
    await expect(
      screen.getByRole("button", { name: `Ajouter une plage horaire pour ${LEA_ON_VENTE}` }),
    ).toBeEnabled();
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
    await expect(args.onRequest).toHaveBeenCalledTimes(2);
  },
};

/** The server refuses the new position (409): the range goes back to where the server has it. */
export const RejectedAdjustTimeRangeRevertsWithToast: Story = {
  args: {
    rejectWrite: ({ method }) =>
      method === "PUT" ? { status: 409, message: "Léa Martin est déjà occupée sur cette plage" } : undefined,
  },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));
    const assigned = within(await screen.findByRole("region", { name: "Tâches assignées" }));

    const end = await waitFor(() => thumb(screen, "Fin", 1, LEA_ON_VENTE));
    end.focus();
    await userEvent.keyboard("{ArrowRight}");

    await expect(
      await pageScreen(canvasElement).findByText("Léa Martin est déjà occupée sur cette plage", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    await expect(await assigned.findByText("Plage horaire 1 · 13:00–15:00")).toBeInTheDocument();
    await expect(
      within(screen.getByRole("group", { name: "Journée de Léa Martin" })).getByRole("img", {
        name: "Vente atelier · 13:00–15:00",
      }),
    ).toBeInTheDocument();
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
    await expect(args.onRequest).toHaveBeenCalledTimes(2);
  },
};

/** The server refuses to delete the range (409): it is back, and the message is toasted. */
export const RejectedRemoveTimeRangeRevertsWithToast: Story = {
  args: {
    rejectWrite: ({ method }) =>
      method === "DELETE" ? { status: 409, message: "Impossible de supprimer cette plage horaire" } : undefined,
  },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: `Retirer le plage horaire 1 de ${LEA_ON_TRI}` }));

    await expect(
      await pageScreen(canvasElement).findByText("Impossible de supprimer cette plage horaire", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    const assigned = within(await screen.findByRole("region", { name: "Tâches assignées" }));
    await expect(await assigned.findByText("Plage horaire 1 · 08:30–09:30")).toBeInTheDocument();
    await expect(assigned.getByText("Plage horaire 2 · 10:00–11:00")).toBeInTheDocument();
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
    await expect(args.onRequest).toHaveBeenCalledTimes(2);
  },
};

/** The page's caches that depend on the day's Tasks, seeded so the stories can see them go stale. */
const SEEDED_CACHES = [
  ["tasks", { store: 1, date_from: DAY, date_to: DAY }],
  ["taskAvailableEmployees", 2],
  ["taskAssignedEmployees", 2],
] as const;
const UNRELATED_CACHE = ["stores", { include: ["employees"] }] as const;

const seedCaches = (client: QueryClient) => {
  for (const key of [...SEEDED_CACHES, UNRELATED_CACHE]) client.setQueryData(key, []);
};
const isStale = (client: QueryClient, key: readonly unknown[]) => client.getQueryState(key)?.isInvalidated === true;

/**
 * Closing after a change refreshes the Planning `tasks` queries, what the Task assignment dialog
 * seeds from and the day's own query (still on screen here, so it is fetched again); other
 * caches are left alone. `onCloseWithChanges` fires once the writes were sent.
 */
export const ClosingWithChangesRefreshes: Story = {
  play: async ({ canvasElement, args }) => {
    const client = probe.client;
    if (!client) throw new Error("the story did not hand over its QueryClient");
    seedCaches(client);
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: "Assigner Léa Martin à Collecte" }));
    await expect(await screen.findByRole("heading", { name: "Tâches assignées (3)" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Fermer" }));

    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(args.onCloseWithChanges).toHaveBeenCalledTimes(1));
    // The write was sent before anything was refreshed.
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
    for (const key of SEEDED_CACHES) await expect(isStale(client, key)).toBe(true);
    await expect(isStale(client, UNRELATED_CACHE)).toBe(false);
    await waitFor(() => expect(args.onRequest).toHaveBeenCalledTimes(2));
  },
};

/** Closing a dialog nothing was changed in refreshes nothing. */
export const ClosingWithoutChangesDoesNotRefresh: Story = {
  play: async ({ canvasElement, args }) => {
    const client = probe.client;
    if (!client) throw new Error("the story did not hand over its QueryClient");
    seedCaches(client);
    const screen = await waitFor(() => dialogScreen(canvasElement));
    await expect(await screen.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Fermer" }));

    await expect(args.onClose).toHaveBeenCalledTimes(1);
    // Give a (wrongly) scheduled refresh the time to happen.
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(args.onCloseWithChanges).not.toHaveBeenCalled();
    for (const key of [...SEEDED_CACHES, UNRELATED_CACHE]) await expect(isStale(client, key)).toBe(false);
    await expect(args.onRequest).toHaveBeenCalledTimes(1);
    await expect(args.onWrite).not.toHaveBeenCalled();
  },
};

/**
 * Inès is on Vacation yet still holds two Tasks: a red banner says so and names the number of
 * Tasks, the "En congé" info alert is not shown, and her Tasks stay in the assigned column.
 */
export const VacationConflict: Story = {
  args: { employee: EMPLOYEES.ines, day: inesVacationConflictDay },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    const banner = screen.getByRole("alert");
    await expect(banner).toHaveTextContent("En congé (Congé payé) mais encore assigné");
    await expect(banner).toHaveTextContent("Assigné à 2 tâches ce jour.");
    await expect(within(banner).getByRole("button", { name: "Retirer de 2 tâches" })).toBeEnabled();
    await expect(screen.queryByText(/aucune tâche ne peut lui être assignée/)).not.toBeInTheDocument();

    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.getByText("Tri arrivage")).toBeInTheDocument();
    await expect(assigned.getByText("Collecte")).toBeInTheDocument();
    // The Task she does not hold stays unavailable to her.
    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getByText("En congé")).toBeInTheDocument();
    await expect(args.onWrite).not.toHaveBeenCalled();
  },
};

/** An Employee not on Vacation gets no banner, whatever Tasks they hold. */
export const NoVacationConflictWithoutVacation: Story = {
  play: async ({ canvasElement }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    await expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    await expect(screen.queryByRole("button", { name: /^Retirer de \d+ tâche/ })).not.toBeInTheDocument();
  },
};

/**
 * One click removes Inès from every Task she holds: the assigned column empties at once, the
 * banner gives way to the "En congé" info alert, and one delete request per Task is sent.
 */
export const ClearVacationConflict: Story = {
  args: { employee: EMPLOYEES.ines, day: inesVacationConflictDay },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: "Retirer de 2 tâches" }));

    await expect(await screen.findByRole("heading", { name: "Tâches assignées (0)" })).toBeInTheDocument();
    await expect(screen.getByRole("alert")).toHaveTextContent(
      "En congé (Congé payé) : aucune tâche ne peut lui être assignée.",
    );
    await expect(screen.queryByText(/mais encore assigné/)).not.toBeInTheDocument();
    await expect(screen.queryByRole("button", { name: /^Retirer de \d+ tâche/ })).not.toBeInTheDocument();
    await expect(
      within(screen.getByRole("region", { name: "Tâches assignées" })).getByText("Aucune tâche assignée"),
    ).toBeInTheDocument();
    // Every Task of the day is unavailable to her again, the two she held included.
    const assignable = within(screen.getByRole("region", { name: "Tâches assignables" }));
    await expect(assignable.getAllByText("En congé")).toHaveLength(3);

    // One removal per Task held, in order; nothing was sent twice.
    await waitFor(() => expect(args.onWrite).toHaveBeenCalledTimes(2));
    await expect(args.onWrite).toHaveBeenNthCalledWith(1, {
      method: "DELETE",
      url: "/api/tasks/1/employees/5",
      body: undefined,
    });
    await expect(args.onWrite).toHaveBeenNthCalledWith(2, {
      method: "DELETE",
      url: "/api/tasks/2/employees/5",
      body: undefined,
    });
    await expect(args.onRequest).toHaveBeenCalledTimes(1);
  },
};

/**
 * The server refuses the first removal: the dialog goes back to the server's day (banner and
 * both Tasks back), the error is toasted, and the second removal, queued behind it, is dropped.
 */
export const RejectedVacationConflictRemovalReverts: Story = {
  args: {
    employee: EMPLOYEES.ines,
    day: inesVacationConflictDay,
    rejectWrite: ({ method }) =>
      method === "DELETE" ? { status: 500, message: "Impossible de retirer Inès Roux de cette tâche" } : undefined,
  },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: "Retirer de 2 tâches" }));

    await expect(
      await pageScreen(canvasElement).findByText(
        "Impossible de retirer Inès Roux de cette tâche",
        {},
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();
    await expect(await screen.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    await expect(screen.getByRole("button", { name: "Retirer de 2 tâches" })).toBeInTheDocument();
    await expect(screen.queryByText(/aucune tâche ne peut lui être assignée/)).not.toBeInTheDocument();
    // Only the refused write reached the server; the one behind it was dropped with the revert.
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(args.onWrite).toHaveBeenCalledTimes(1);
    await expect(args.onRequest).toHaveBeenCalledTimes(2); // the day, then the revert's refetch
  },
};

/**
 * The server refuses only the second removal: the first went through, so the revert shows
 * the server's real day, one Task left and the banner counting it.
 */
export const PartiallyRejectedVacationConflictRemovalReverts: Story = {
  args: {
    employee: EMPLOYEES.ines,
    day: inesVacationConflictDay,
    rejectWrite: ({ url }) =>
      url === "/api/tasks/2/employees/5"
        ? { status: 500, message: "Impossible de retirer Inès Roux de Collecte" }
        : undefined,
  },
  play: async ({ canvasElement, args }) => {
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: "Retirer de 2 tâches" }));

    await expect(
      await pageScreen(canvasElement).findByText("Impossible de retirer Inès Roux de Collecte", {}, { timeout: 3000 }),
    ).toBeInTheDocument();
    await expect(await screen.findByRole("heading", { name: "Tâches assignées (1)" })).toBeInTheDocument();
    await expect(screen.getByRole("button", { name: "Retirer de 1 tâche" })).toBeInTheDocument();
    const assigned = within(screen.getByRole("region", { name: "Tâches assignées" }));
    await expect(assigned.getByText("Collecte")).toBeInTheDocument();
    await expect(assigned.queryByText("Tri arrivage")).not.toBeInTheDocument();
    await expect(args.onWrite).toHaveBeenCalledTimes(2);
  },
};

/** Closing after clearing a Vacation conflict refreshes the Planning page's caches, as after any change. */
export const ClosingAfterClearingVacationConflictRefreshes: Story = {
  args: { employee: EMPLOYEES.ines, day: inesVacationConflictDay },
  play: async ({ canvasElement, args }) => {
    const client = probe.client;
    if (!client) throw new Error("the story did not hand over its QueryClient");
    seedCaches(client);
    const screen = await waitFor(() => dialogScreen(canvasElement));

    await userEvent.click(await screen.findByRole("button", { name: "Retirer de 2 tâches" }));
    await expect(await screen.findByRole("heading", { name: "Tâches assignées (0)" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Fermer" }));

    await expect(args.onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(args.onCloseWithChanges).toHaveBeenCalledTimes(1));
    // Both removals were sent before anything was refreshed.
    await expect(args.onWrite).toHaveBeenCalledTimes(2);
    for (const key of SEEDED_CACHES) await expect(isStale(client, key)).toBe(true);
    await expect(isStale(client, UNRELATED_CACHE)).toBe(false);
  },
};
