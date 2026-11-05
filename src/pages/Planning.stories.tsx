/**
 * The Planning page with a tiny in-memory server (`stories/fakeAxios`): checks that the Store
 * filter narrows the page's own Task list but never reaches the Employee day dialog.
 */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { isoDateSchema, isoDateTimeSchema, isoTimeSchema } from "@recyclerie/api/primitives/zod";
import type { EmployeeDto } from "@recyclerie/api/responses/employees";
import type { EmployeeWorkdayDto } from "@recyclerie/api/responses/employeeWorkdays";
import { useEffect, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { apiError, installFakeServer, ok, restoreAxios } from "../stories/fakeAxios";
import { EMPLOYEES, karimDay } from "../stories/fixtures/employeeDay";
import { mockStores } from "../stories/fixtures/stores";
import { getWeekRangeFromDate, WEEKDAYS_MONDAY_FIRST } from "../services/dateService";
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
// Karim belongs to both Stores, Léa to the first one only.
const [centre, nord] = mockStores;
const STORES = [
  { ...centre, employees: [lea, karim] },
  { ...nord, employees: [karim] },
];

interface StoryWrapperProps {
  /** Called with the query params of every `GET /api/tasks` (the page's own Task list). */
  onTasksRequest: (params: unknown) => void;
  /** Called with the query params of every `GET /api/employees/:id/tasks` (the day dialog). */
  onEmployeeTasksRequest: (params: unknown) => void;
}

function StoryWrapper({ onTasksRequest, onEmployeeTasksRequest }: StoryWrapperProps) {
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  // Installed synchronously during the first render: see `stories/fakeAxios`.
  useState(() => {
    installFakeServer({
      get: (url, config) => {
        if (url === "/api/recycleries") return ok(STORES);
        if (url === "/api/employees") return ok([lea, karim]);
        if (url === "/api/vacations") return ok([]);
        if (url === "/api/tasks") {
          onTasksRequest(config?.params);
          return ok([]);
        }
        const employeeTasks = /^\/api\/employees\/(\d+)\/tasks$/.exec(url);
        if (employeeTasks) {
          onEmployeeTasksRequest(config?.params);
          const date = isoDateSchema("date").parse(config?.params?.date_from);
          return ok({ employee_id: Number(employeeTasks[1]), days: [{ ...karimDay, date }] });
        }
        return apiError(404, `Unhandled GET ${url}`);
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

const meta = {
  title: "Pages/Planning",
  component: StoryWrapper,
  parameters: { layout: "fullscreen" },
  args: { onTasksRequest: fn(), onEmployeeTasksRequest: fn() },
} satisfies Meta<typeof StoryWrapper>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Plain page: no Store selected. */
export const Default: Story = {};

/**
 * Open Karim's day, filter the page on his second Store, open it again: both requests carry
 * the displayed week's Monday as `date_from == date_to` and nothing else, whereas the page's
 * own Task list did start asking for that Store.
 */
export const StoreFilterDoesNotChangeTheDayRequest: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const monday = getWeekRangeFromDate(new Date()).date_from;
    const dayRequest = { date_from: monday, date_to: monday };
    const karimButtons = () => canvas.findAllByRole("button", { name: /^Voir les tâches de Karim Benali le / });
    const dialog = () => within(body.getByRole("dialog"));

    // 1. No Store filter: open Karim's Monday.
    await userEvent.click((await karimButtons())[0]);
    await expect(await dialog().findByRole("heading", { name: "Tâches assignées (1)" })).toBeInTheDocument();
    await expect(args.onEmployeeTasksRequest).toHaveBeenNthCalledWith(1, dayRequest);
    await userEvent.click(dialog().getByRole("button", { name: "Fermer" }));
    await waitFor(() => expect(body.queryByRole("dialog")).not.toBeInTheDocument());

    // 2. Filter the page on the second Store: its own Task list now asks for it.
    await userEvent.click(canvas.getAllByRole("combobox")[0]);
    await userEvent.click(await body.findByRole("option", { name: nord.name }));
    await waitFor(() =>
      expect(args.onTasksRequest).toHaveBeenCalledWith(expect.objectContaining({ store_id: nord.id })),
    );

    // 3. Karim is still on that Store's header: open Monday again. Same bare request.
    await userEvent.click((await karimButtons())[0]);
    await expect(await dialog().findByRole("heading", { name: "Tâches assignées (1)" })).toBeInTheDocument();
    await waitFor(() => expect(args.onEmployeeTasksRequest).toHaveBeenNthCalledWith(2, dayRequest));
  },
};
