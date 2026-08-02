import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { TaskManager } from "@/engine/core/managers/tasks";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/give_task");
});

beforeEach(() => {
  resetRegistry();
});

describe("give_task", () => {
  it("should give tasks for actor", () => {
    const manager: TaskManager = getManager(TaskManager);

    jest.spyOn(manager, "giveTask").mockImplementation(jest.fn());

    expect(() => callXrEffect("give_task", MockGameObject.mockActor(), MockGameObject.mock())).toThrow(
      "No task id parameter in give_task effect."
    );

    callXrEffect("give_task", MockGameObject.mockActor(), MockGameObject.mock(), "test-task-id");

    expect(manager.giveTask).toHaveBeenCalledTimes(1);
    expect(manager.giveTask).toHaveBeenCalledWith("test-task-id");
  });
});
