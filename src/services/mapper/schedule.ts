import type {
  CreateCollectionPointPresenceDataInput,
  CreateStoreHoursDataInput,
} from "@recyclerie/api/schemas/schedules";
import type { TaskScheduleDataInput } from "@recyclerie/api/schemas/taskSchedule";
import {
  dateFromWeekday,
  toIsoTime,
  weekday,
} from "@recyclerie/api/domain/date";
import dayjs from "dayjs";
import type {
  CollectionPointModel,
  ScheduleModel,
} from "../../interfaces/Models";

import type {
  CollecteFormOutput,
  CollecteFormValues,
  PlanningFormOutput,
  PlanningFormValues,
  PresenceFormOutput,
  PresenceFormValues,
  StoreOpeningFormOutput,
  StoreOpeningFormValues,
} from "../schema/schedule";
import { emptyToNull } from "../zodTransform";

/** Parse API HH:mm or ISO datetime into a Date for form TimePickers. */
function parseTimeToDate(
  time: string | Date | null | undefined,
): Date | undefined {
  if (time == null || time === "") return undefined;
  if (time instanceof Date) return time;
  const s = String(time);
  if (/^\d{1,2}:\d{2}/.test(s) && !s.includes("T")) {
    const [h, m] = s.split(":").map(Number);
    return dayjs()
      .hour(h ?? 0)
      .minute(m ?? 0)
      .second(0)
      .millisecond(0)
      .toDate();
  }
  const d = dayjs(s);
  return d.isValid() ? d.toDate() : undefined;
}

function formDayOfWeek(
  day: ScheduleModel["day_of_week"] | undefined,
  scheduledDate?: ScheduleModel["scheduled_date"] | null,
): PresenceFormValues["day_of_week"] {
  if (typeof day === "number") return day;
  if (scheduledDate != null) return weekday(scheduledDate);
  return "";
}

export function scheduleToCollectFormValues(
  collecte: ScheduleModel,
): Partial<CollecteFormValues> {
  return {
    day_of_week: formDayOfWeek(collecte.day_of_week, collecte.scheduled_date),
    is_active: collecte.is_recurring ?? false,
    start_time: new Date(collecte.start_time),
    end_time: new Date(collecte.end_time),
    notes: collecte.notes ?? "",
    store_id: collecte.store_id ?? "",
    location: collecte.location ? collecte.location.split(",") : [],
  };
}

export const scheduleCollectPayloadFromForm = (
  data: CollecteFormOutput,
): TaskScheduleDataInput => {
  const { is_active, location, store_id, day_of_week, notes, ...rest } = data;
  return {
    ...rest,
    notes: emptyToNull(notes),
    scheduled_date: dateFromWeekday(day_of_week),
    is_recurring: is_active,
    location: location.length > 0 ? location.join(",") : null,
    store_id: store_id === "" ? null : store_id,
    name: "collecte",
    category: "collection",
    recurrence_pattern: "weekly",
    collection_point_id: null,
  } satisfies TaskScheduleDataInput;
};

export const scheduleToCustomFormValues = (
  schedule: ScheduleModel,
): Partial<PlanningFormValues> => ({
  name: schedule.name,
  category: schedule.category,
  scheduled_date: new Date(schedule.scheduled_date),
  start_time: new Date(schedule.start_time),
  end_time: new Date(schedule.end_time),
  ...(schedule.priority ? { priority: schedule.priority } : {}),
  ...(schedule.store_id ? { store_id: schedule.store_id } : {}),
  ...(schedule.notes ? { notes: schedule.notes } : {}),
});

export const scheduleCustomPayloadFromForm = (
  data: PlanningFormOutput,
): TaskScheduleDataInput => {
  return {
    name: data.name,
    scheduled_date: data.scheduled_date,
    start_time: data.start_time,
    end_time: data.end_time,
    category: "custom",
    notes: emptyToNull(data.notes),
    store_id: data.store_id === "" ? null : data.store_id,
    is_recurring: !!data.recurrence_pattern,
    recurrence_pattern:
      data.recurrence_pattern === "" ? null : data.recurrence_pattern,
  } satisfies TaskScheduleDataInput;
};

export function storeHoursToFormValues(
  hours: Partial<ScheduleModel> & {
    open_time?: string;
    close_time?: string;
    is_open?: boolean;
    is_24h?: boolean;
  },
): Partial<StoreOpeningFormValues> {
  const start =
    parseTimeToDate(hours.start_time) ?? parseTimeToDate(hours.open_time);
  const end =
    parseTimeToDate(hours.end_time) ?? parseTimeToDate(hours.close_time);
  return {
    store_id: hours.store_id != null ? hours.store_id : "",
    day_of_week: formDayOfWeek(hours.day_of_week, hours.scheduled_date),
    is_recurring: hours.is_recurring ?? hours.is_open ?? true,
    ...(start ? { start_time: start } : {}),
    ...(end ? { end_time: end } : {}),
    is_24h: Boolean(hours.is_24h),
    notes: hours.notes ?? "",
  };
}

export function storeHoursPayloadFromForm(
  data: StoreOpeningFormOutput,
): CreateStoreHoursDataInput {
  return {
    store_id: data.store_id,
    day_of_week: data.day_of_week,
    is_recurring: data.is_recurring,
    start_time: toIsoTime(data.start_time),
    end_time: toIsoTime(data.end_time),
    is_24h: data.is_24h,
    notes: emptyToNull(data.notes),
  } satisfies CreateStoreHoursDataInput;
}

export function presenceToFormValues(
  presence: ScheduleModel | null,
  pointId: CollectionPointModel["id"] | null,
): Partial<PresenceFormValues> | null {
  if (!presence && !pointId) return null;
  return {
    collection_point_id:
      presence?.collection_point_id != null
        ? Number(presence.collection_point_id)
        : (pointId ?? ""),
    day_of_week: formDayOfWeek(
      presence?.day_of_week,
      presence?.scheduled_date,
    ),
    is_present: presence?.is_recurring ?? true,
    ...(presence?.start_time
      ? { start_time: parseTimeToDate(presence.start_time) }
      : {}),
    ...(presence?.end_time
      ? { end_time: parseTimeToDate(presence.end_time) }
      : {}),
    notes: presence?.notes ?? "",
  };
}

export function presencePayloadFromForm(
  data: PresenceFormOutput,
): CreateCollectionPointPresenceDataInput {
  return {
    collection_point_id: data.collection_point_id,
    day_of_week: data.day_of_week,
    is_present: data.is_present,
    start_time: toIsoTime(data.start_time),
    end_time: toIsoTime(data.end_time),
    notes: emptyToNull(data.notes),
  } satisfies CreateCollectionPointPresenceDataInput;
}
