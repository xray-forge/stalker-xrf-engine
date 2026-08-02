import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { MockGameObject } from "xray16/mocks";

import { getManager } from "@/engine/core/database";
import { SurgeManager } from "@/engine/core/managers/surge";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/world/set_surge_mess_and_task");
});

beforeEach(() => {
  resetRegistry();
});

describe("set_surge_mess_and_task", () => {
  it("should configure the surge message and optional task", () => {
    const surgeManager: SurgeManager = getManager(SurgeManager);

    callXrEffect("set_surge_mess_and_task", MockGameObject.mockActor(), MockGameObject.mock(), "surge_message");

    expect(surgeManager.surgeMessage).toBe("surge_message");
    expect(surgeManager.surgeTaskSection).toBe("");

    callXrEffect(
      "set_surge_mess_and_task",
      MockGameObject.mockActor(),
      MockGameObject.mock(),
      "surge_message_with_task",
      "surge_task"
    );

    expect(surgeManager.surgeMessage).toBe("surge_message_with_task");
    expect(surgeManager.surgeTaskSection).toBe("surge_task");
  });
});
