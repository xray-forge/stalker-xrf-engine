import { describe, expect, it } from "@jest/globals";

import { taskIds } from "@/engine/constants/task_ids";

describe("task ID constants integrity", () => {
  it("should match key-value entries", () => {
    Object.entries(taskIds).forEach(([key, value]) => expect(key).toBe(value));
  });
});
