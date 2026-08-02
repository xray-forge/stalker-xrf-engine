import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { storyNames } from "@/engine/constants/story_names";
import { getManager, registerZone } from "@/engine/core/database";
import { SleepManager } from "@/engine/core/managers/sleep";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/sleep");
});

beforeEach(() => {
  resetRegistry();
});

describe("sleep", () => {
  it("should show sleep dialog", () => {
    mockRegisteredActor();

    const manager: SleepManager = getManager(SleepManager);

    jest.spyOn(manager, "showSleepDialog").mockImplementation(jest.fn());

    callXrEffect("sleep", MockGameObject.mockActor(), MockGameObject.mock());

    expect(manager.showSleepDialog).not.toHaveBeenCalled();

    const first: GameObject = MockGameObject.mock({ name: storyNames.zat_a2_sr_sleep });
    const second: GameObject = MockGameObject.mock({ name: storyNames.pri_a16_sr_sleep });

    jest.spyOn(first, "inside").mockImplementation(() => false);
    jest.spyOn(second, "inside").mockImplementation(() => true);

    registerZone(first);
    registerZone(second);

    callXrEffect("sleep", MockGameObject.mockActor(), MockGameObject.mock());

    expect(manager.showSleepDialog).toHaveBeenCalledTimes(1);
  });
});
