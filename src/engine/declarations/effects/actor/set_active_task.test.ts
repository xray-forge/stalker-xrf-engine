import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject, GameTask } from "xray16/alias";
import { MockCGameTask, MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/set_active_task");
});

describe("set_active_task", () => {
  it("should set tasks for actor", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const task: GameTask = MockCGameTask.mock();

    jest.spyOn(actor, "get_task").mockImplementation((taskId) => (taskId === "test-task" ? task : null));

    callXrEffect("set_active_task", actor, MockGameObject.mock(), "no-task");

    expect(actor.get_task).toHaveBeenCalledWith("no-task", true);
    expect(actor.set_active_task).not.toHaveBeenCalled();

    callXrEffect("set_active_task", actor, MockGameObject.mock(), "test-task");

    expect(actor.get_task).toHaveBeenCalledWith("test-task", true);
    expect(actor.set_active_task).toHaveBeenCalledTimes(1);
    expect(actor.set_active_task).toHaveBeenCalledWith(task);
  });
});
