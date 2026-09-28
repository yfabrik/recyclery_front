import { describe, expect, it, vi } from "vitest";
import { createTimeRangeWriteQueue } from "./timeRangeWriteQueue";

describe("createTimeRangeWriteQueue", () => {
  it("sends two quick edits to different ranges in submission order", async () => {
    const order: string[] = [];
    const queue = createTimeRangeWriteQueue();

    queue.scheduleDebounced(
      "range-1",
      async () => {
        order.push("a");
      },
      20,
    );
    queue.scheduleDebounced(
      "range-2",
      async () => {
        order.push("b");
      },
      20,
    );

    await queue.flush();

    expect(order).toEqual(["a", "b"]);
  });

  it("collapses rapid edits to the same range into only the latest value", async () => {
    const order: number[] = [];
    const queue = createTimeRangeWriteQueue();

    for (const value of [1, 2, 3]) {
      queue.scheduleDebounced(
        "range-1",
        async () => {
          order.push(value);
        },
        20,
      );
    }

    await queue.flush();

    expect(order).toEqual([3]);
  });

  it("a rejected write still lets the task revert, and later writes keep running", async () => {
    const revert = vi.fn();
    const after = vi.fn();
    const queue = createTimeRangeWriteQueue();

    queue.enqueue(async () => {
      try {
        await Promise.reject(new Error("conflict"));
      } catch {
        revert();
      }
    });
    queue.enqueue(async () => {
      after();
    });

    await queue.flush();

    expect(revert).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);
  });

  it("reports a task that throws without catching, without breaking the queue", async () => {
    const onTaskError = vi.fn();
    const after = vi.fn();
    const queue = createTimeRangeWriteQueue(onTaskError);

    queue.enqueue(async () => {
      throw new Error("boom");
    });
    queue.enqueue(async () => {
      after();
    });

    await queue.flush();

    expect(onTaskError).toHaveBeenCalledTimes(1);
    expect(after).toHaveBeenCalledTimes(1);
  });

  it("closing the dialog flushes pending debounced writes immediately", async () => {
    const write = vi.fn(async () => {});
    const queue = createTimeRangeWriteQueue();

    // A wait long enough that it would never fire on its own within this test.
    queue.scheduleDebounced("range-1", write, 10_000);

    await queue.flush();

    expect(write).toHaveBeenCalledTimes(1);
  });

  it("cancel drops a pending debounced write for that key", async () => {
    const write = vi.fn(async () => {});
    const queue = createTimeRangeWriteQueue();

    queue.scheduleDebounced("range-1", write, 20);
    queue.cancel("range-1");

    await queue.flush();

    expect(write).not.toHaveBeenCalled();
  });
});
