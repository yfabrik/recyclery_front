import { AsyncQueuer, Debouncer } from "@tanstack/react-pacer";

/** A single write to persist, already capturing everything it needs to run and to recover from a rejection. */
export type WriteTask = () => Promise<void>;

export interface TimeRangeWriteQueue {
  /** Runs after whatever is already queued, in submission order. */
  enqueue: (task: WriteTask) => void;
  /**
   * Debounces `task` per `key`: only the latest task scheduled for that key within
   * `wait` ms is sent, once it fires it joins the single serial queue like `enqueue`.
   */
  scheduleDebounced: (key: string, task: WriteTask, wait: number) => void;
  /** Drops a key's pending debounced write, e.g. because its range was just deleted locally. */
  cancel: (key: string) => void;
  /** Fires every pending debounced write now, then waits for the queue to drain. */
  flush: () => Promise<void>;
}

/**
 * One shared serial queue per dialog instance, backed by `@tanstack/react-pacer`.
 * Concurrency 1 keeps writes reaching the server in the order they were scheduled,
 * even across different Time ranges being dragged at the same time.
 */
export function createTimeRangeWriteQueue(
  onTaskError?: (error: unknown) => void,
): TimeRangeWriteQueue {
  const queuer = new AsyncQueuer<WriteTask>(
    async (task) => {
      await task();
    },
    {
      concurrency: 1,
      started: true,
      onError: (error) => onTaskError?.(error),
    },
  );
  const debouncers = new Map<string, Debouncer<(task: WriteTask) => void>>();

  const enqueue: TimeRangeWriteQueue["enqueue"] = (task) => {
    queuer.addItem(task);
  };

  const scheduleDebounced: TimeRangeWriteQueue["scheduleDebounced"] = (key, task, wait) => {
    let debouncer = debouncers.get(key);
    if (!debouncer) {
      debouncer = new Debouncer<(task: WriteTask) => void>((pending) => enqueue(pending), {
        wait,
      });
      debouncers.set(key, debouncer);
    } else {
      debouncer.setOptions({ wait });
    }
    debouncer.maybeExecute(task);
  };

  const cancel: TimeRangeWriteQueue["cancel"] = (key) => {
    debouncers.get(key)?.cancel();
  };

  const flush: TimeRangeWriteQueue["flush"] = async () => {
    for (const debouncer of debouncers.values()) debouncer.flush();
    await queuer.flush();
  };

  return { enqueue, scheduleDebounced, cancel, flush };
}
