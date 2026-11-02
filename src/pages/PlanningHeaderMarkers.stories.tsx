/**
 * The Planning page with a small in-memory server (`stories/fakeAxios`) that holds one week
 * of Tasks, Assignments and Vacations: checks that the presence header's Task count pills and
 * Vacation conflict markers follow the Employee day dialog. Closing the dialog after a change
 * refreshes the `["tasks"]` queries, the header's week query among them; the server then
 * answers with the Assignments as the dialog's writes have left them.
 *
 * Everything is relative to the current week (the page shows today's week); the Tasks are on
 * its Monday.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isoDateSchema, isoDateTimeSchema, isoTimeSchema, type IsoTime } from "@recyclerie/api/primitives/zod";
import type { EmployeeTaskRowDto, EmployeeTasksDayDto } from "@recyclerie/api/responses/employeeTasks";
import type { EmployeeDto } from "@recyclerie/api/responses/employees";
import type { EmployeeWorkdayDto } from "@recyclerie/api/responses/employeeWorkdays";
import type { TaskDto } from "@recyclerie/api/responses/tasks";
import type { EmployeeVacationDto } from "@recyclerie/api/responses/vacations";
import { useEffect, useState } from "react";
import { expect, fn, mocked, userEvent, waitFor, within } from "storybook/test";
import { dateOfWeekday, formatDayLong } from "../services/planning/employeeDayDate";
import { combineDateAndTime, getWeekRangeFromDate, toIsoDate, WEEKDAYS_MONDAY_FIRST } from "../services/dateService";
import { apiError, installFakeServer, ok, restoreAxios } from "../stories/fakeAxios";
import { EMPLOYEES, hm, makeRange, makeTask, paidVacation } from "../stories/fixtures/employeeDay";
import { mockStores } from "../stories/fixtures/stores";
import Planning from "./Planning";

const CREATED = isoDateTimeSchema("date").parse("2026-01-01T00:00:00.000Z");

/** Works every morning and afternoon, both weeks: shows on every day card whatever today is. */
const withWorkdays = (employee: EmployeeDto): EmployeeDto => ({
  ...employee,
  EmployeeWorkdays: WEEKDAYS_MONDAY_FIRST.flatMap((day) =>
    (["week1", "week2"] as const).flatMap((week) =>
      (["morning", "afternoon"] as const).map(
        (slot, index): EmployeeWorkdayDto => ({
          id: employee.id * 1000 + day * 10 + index + (week === "week2" ? 100 : 0),
          employee_id: employee.id,
          day_of_week: day,
          time_slot: slot,
          is_working: true,
          start_time: isoTimeSchema("heure").parse(slot === "morning" ? "08:00" : "13:00"),
          end_time: isoTimeSchema("heure").parse(slot === "morning" ? "12:00" : "17:00"),
          notes: null,
          week,
          createdAt: CREATED,
          updatedAt: CREATED,
        }),
      ),
    ),
  ),
});

const lea = withWorkdays(EMPLOYEES.lea);
const karim = withWorkdays(EMPLOYEES.karim);
const EMPLOYEES_LIST = [lea, karim];
const STORES = [{ ...mockStores[0], employees: EMPLOYEES_LIST }];

const { date_from: MONDAY, date_to: SUNDAY } = getWeekRangeFromDate(new Date());

/** Karim is on Vacation Monday and Tuesday. */
const KARIM_VACATION: EmployeeVacationDto = {
  ...paidVacation(karim.id),
  start_date: MONDAY,
  end_date: dateOfWeekday(MONDAY, 2),
};

interface ServerTask {
  task: TaskDto;
  /** Paris `HH:MM`, also the Time range of whoever holds the Task. */
  from: IsoTime;
  to: IsoTime;
  employeeIds: number[];
}

/** A Task of Monday, from `from` to `to` (Paris). */
const serverTask = (id: number, name: string, from: IsoTime, to: IsoTime, employeeIds: number[]): ServerTask => ({
  task: {
    ...makeTask({ id, name, from: [8], to: [10] }),
    scheduled_date: isoDateTimeSchema("date").parse(`${MONDAY}T00:00:00.000Z`),
    start_time: isoDateTimeSchema("date").parse(combineDateAndTime(MONDAY, from).toISOString()),
    end_time: isoDateTimeSchema("date").parse(combineDateAndTime(MONDAY, to).toISOString()),
    day_of_week: 1,
  },
  from,
  to,
  employeeIds,
});

/** Karim holds the first two Tasks while on Vacation; Léa holds the first one. */
const initialTasks = (): ServerTask[] => [
  serverTask(1, "Tri arrivage", hm(8), hm(10), [karim.id, lea.id]),
  serverTask(2, "Collecte", hm(10), hm(12), [karim.id]),
  serverTask(3, "Vente", hm(13), hm(15), []),
];

/** `GET /api/tasks?include=user`: the Task with its assigned Employees. */
const listTask = ({ task, employeeIds }: ServerTask): TaskDto => ({
  ...task,
  Employees: EMPLOYEES_LIST.filter((employee) => employeeIds.includes(employee.id)),
});

/** The Employee's Monday as `GET /api/employees/:id/tasks` answers it. */
const employeeDay = (tasks: readonly ServerTask[], employeeId: number): EmployeeTasksDayDto => {
  const onVacation = employeeId === karim.id;
  const rows = tasks.map(({ task, from, to, employeeIds }): EmployeeTaskRowDto => {
    const window = { start_time: from, end_time: to };
    if (employeeIds.includes(employeeId)) {
      return {
        task,
        status: "assigned",
        timeRanges: [makeRange(task.id * 100 + employeeId, employeeId, task.id, from, to)],
        freeWindows: [window],
      };
    }
    if (onVacation) return { task, status: "unavailable", timeRanges: [], freeWindows: [], reason: "vacation" };
    return { task, status: "assignable", timeRanges: [], freeWindows: [window] };
  });
  return {
    date: MONDAY,
    workWindows: [{ start_time: hm(8), end_time: hm(17) }],
    vacation: onVacation ? KARIM_VACATION : null,
    rows,
  };
};

interface StoryWrapperProps {
  /** Called with the query params of every `GET /api/tasks`. */
  onTasksRequest: (params: unknown) => void;
}

function StoryWrapper({ onTasksRequest }: StoryWrapperProps) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  // Installed synchronously during the first render: see `stories/fakeAxios`.
  useState(() => {
    const tasks = initialTasks();
    const taskOf = (id: string | undefined) => tasks.find(({ task }) => String(task.id) === id);
    installFakeServer({
      get: (url, config) => {
        if (url === "/api/recycleries") return ok(STORES);
        if (url === "/api/employees") return ok(EMPLOYEES_LIST);
        if (url === "/api/vacations") return ok([KARIM_VACATION]);
        if (url === "/api/tasks") {
          onTasksRequest(config?.params);
          const { date_from, date_to } = isoRange(config?.params);
          return ok(
            tasks
              .filter(({ task }) => {
                const day = toIsoDate(task.scheduled_date);
                return date_from <= day && day <= date_to;
              })
              .map(listTask),
          );
        }
        const day = /^\/api\/employees\/(\d+)\/tasks$/.exec(url);
        if (day) return ok({ employee_id: Number(day[1]), days: [employeeDay(tasks, Number(day[1]))] });
        return apiError(404, `Unhandled GET ${url}`);
      },
      post: (url, _config, body) => {
        const target = taskOf(/^\/api\/tasks\/(\d+)\/employees$/.exec(url)?.[1]);
        if (!target) return apiError(404, `Unhandled POST ${url}`);
        const { employee_id } = body as { employee_id: number };
        target.employeeIds.push(employee_id);
        return ok(makeRange(target.task.id * 100 + employee_id, employee_id, target.task.id, target.from, target.to));
      },
      delete: (url) => {
        const match = /^\/api\/tasks\/(\d+)\/employees\/(\d+)$/.exec(url);
        const target = taskOf(match?.[1]);
        if (!target || !match?.[2]) return apiError(404, `Unhandled DELETE ${url}`);
        target.employeeIds = target.employeeIds.filter((id) => id !== Number(match[2]));
        return ok({ removed: true });
      },
    });
    return null;
  });
  useEffect(() => restoreAxios, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Planning />
    </QueryClientProvider>
  );
}

/** The `date_from`/`date_to` of a request's params. */
const isoRange = (params: unknown) => {
  const { date_from, date_to } = params as { date_from: string; date_to: string };
  return { date_from: isoDateSchema("date").parse(date_from), date_to: isoDateSchema("date").parse(date_to) };
};

const meta = {
  title: "Pages/PlanningHeaderMarkers",
  component: StoryWrapper,
  parameters: { layout: "fullscreen" },
  args: { onTasksRequest: fn() },
} satisfies Meta<typeof StoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

const MONDAY_LONG = formatDayLong(MONDAY);

/** The Employee's button on Monday's card. */
const mondayButton = (canvas: ReturnType<typeof within>, name: string) =>
  canvas.findByRole("button", { name: `Voir les tâches de ${name} le ${MONDAY_LONG}` });

/**
 * Karim is on Vacation on Monday and holds two Tasks: red badge, "1 conflit" on the card,
 * and his two Tasks counted. Léa has one Task: a pill, no conflict. Then, in the Employee day
 * dialog, Karim is removed from his Tasks one at a time and Léa is assigned to a second one;
 * each time the dialog closes, the header follows without a reload.
 */
export const MarkersFollowTheDayDialog: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const dialog = () => within(body.getByRole("dialog"));
    const closeDialog = async () => {
      await userEvent.click(dialog().getByRole("button", { name: "Fermer" }));
      await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    };

    // 1. Initial markers, from a request of its own over the displayed week.
    const karimBadge = within(await mondayButton(canvas, "Karim Benali"));
    await expect(
      await karimBadge.findByRole("img", { name: "En congé mais assigné à 2 tâches" }),
    ).toBeInTheDocument();
    await expect(karimBadge.getByRole("img", { name: "2 tâches ce jour" })).toBeInTheDocument();
    await expect(await canvas.findByText("1 conflit")).toBeInTheDocument();
    await expect(
      within(await mondayButton(canvas, "Léa Martin")).getByRole("img", { name: "1 tâche ce jour" }),
    ).toBeInTheDocument();
    await expect(args.onTasksRequest).toHaveBeenCalledWith({ include: "user", date_from: MONDAY, date_to: SUNDAY });

    // 2. Remove Karim from one Task: still in conflict, with one Task.
    await userEvent.click(await mondayButton(canvas, "Karim Benali"));
    await expect(await dialog().findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    await userEvent.click(dialog().getByRole("button", { name: "Retirer Karim Benali de Collecte" }));
    await expect(await dialog().findByRole("heading", { name: "Tâches assignées (1)" })).toBeInTheDocument();
    await closeDialog();
    await expect(
      await within(await mondayButton(canvas, "Karim Benali")).findByRole("img", {
        name: "En congé mais assigné à 1 tâche",
      }),
    ).toBeInTheDocument();
    await expect(canvas.getByText("1 conflit")).toBeInTheDocument();

    // 3. Remove him from the last one: the conflict is cleared, badge, pill and chip are gone.
    await userEvent.click(await mondayButton(canvas, "Karim Benali"));
    await userEvent.click(await dialog().findByRole("button", { name: "Retirer Karim Benali de Tri arrivage" }));
    await expect(await dialog().findByRole("heading", { name: "Tâches assignées (0)" })).toBeInTheDocument();
    await closeDialog();
    await waitFor(() => expect(canvas.queryByText(/conflit/)).not.toBeInTheDocument());
    await expect(within(await mondayButton(canvas, "Karim Benali")).queryByRole("img")).not.toBeInTheDocument();

    // 4. Assign Léa to a second Task: her pill goes from 1 to 2.
    await userEvent.click(await mondayButton(canvas, "Léa Martin"));
    await userEvent.click(await dialog().findByRole("button", { name: "Assigner Léa Martin à Collecte" }));
    await expect(await dialog().findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    await closeDialog();
    await expect(
      await within(await mondayButton(canvas, "Léa Martin")).findByRole("img", { name: "2 tâches ce jour" }),
    ).toBeInTheDocument();
  },
};

/** Closing the dialog without a change refreshes nothing: no new Task request, same markers. */
export const ClosingWithoutChangeKeepsTheMarkers: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await expect(await canvas.findByText("1 conflit")).toBeInTheDocument();
    const requestsBefore = mocked(args.onTasksRequest).mock.calls.length;

    await userEvent.click(await mondayButton(canvas, "Karim Benali"));
    const dialog = within(await body.findByRole("dialog"));
    await expect(await dialog.findByRole("heading", { name: "Tâches assignées (2)" })).toBeInTheDocument();
    await userEvent.click(dialog.getByRole("button", { name: "Fermer" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());
    // An invalidation would refetch within a few milliseconds.
    await new Promise((resolve) => setTimeout(resolve, 300));

    await expect(args.onTasksRequest).toHaveBeenCalledTimes(requestsBefore);
    await expect(canvas.getByText("1 conflit")).toBeInTheDocument();
    await expect(
      within(await mondayButton(canvas, "Karim Benali")).getByRole("img", { name: "En congé mais assigné à 2 tâches" }),
    ).toBeInTheDocument();
  },
};

/** The page's "next" arrow (an icon button without a name). */
const nextButton = (canvasElement: HTMLElement) => {
  const button = canvasElement.querySelector('[data-testid="ArrowForwardIosIcon"]')?.closest("button");
  if (!button) throw new Error("Bouton suivant introuvable");
  return button;
};

/**
 * The header's week query follows the displayed week in every view mode and ignores the view
 * mode otherwise: one week ahead in the day view, then two months further in the calendar view,
 * each time a request with `include=user` over exactly that Monday-Sunday week and nothing
 * else (no Store, no view mode).
 */
export const WeekQueryRunsInEveryViewMode: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const weekOf = (date: Date) => ({ include: "user", ...getWeekRangeFromDate(date) });
    const now = new Date();

    // Day view, seven days ahead.
    const inAWeek = new Date(now.getTime() + 7 * 24 * 3600 * 1000);
    await userEvent.click(canvas.getByText("Jour"));
    for (let day = 0; day < 7; day++) await userEvent.click(nextButton(canvasElement));
    await waitFor(() => expect(args.onTasksRequest).toHaveBeenCalledWith(weekOf(inAWeek)));

    // Calendar view (its header is empty): each arrow goes to the first of the next month.
    await userEvent.click(canvas.getByText("Calendrier"));
    await userEvent.click(nextButton(canvasElement));
    await userEvent.click(nextButton(canvasElement));
    await waitFor(() =>
      expect(args.onTasksRequest).toHaveBeenCalledWith(weekOf(new Date(inAWeek.getFullYear(), inAWeek.getMonth() + 2))),
    );
  },
};
