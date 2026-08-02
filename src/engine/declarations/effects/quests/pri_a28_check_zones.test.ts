import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject, MockVector } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { spawnSquadInSmart } from "@/engine/core/utils/spawn";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/pri_a28_check_zones");
});

jest.mock("@/engine/core/utils/spawn");

beforeEach(() => {
  resetRegistry();
});

describe("pri_a28_check_zones", () => {
  it("should choose the farthest monolith zone and spawn its squad", () => {
    const { actorGameObject } = mockRegisteredActor({ position: MockVector.mock(0, 0, 0) });
    const first = MockAlifeObject.mock({ id: 101, position: MockVector.mock(1, 0, 0) });
    const second = MockAlifeObject.mock({ id: 102, position: MockVector.mock(5, 0, 0) });
    const third = MockAlifeObject.mock({ id: 103, position: MockVector.mock(3, 0, 0) });

    registerSimulator();
    MockAlifeSimulator.addToRegistry(first);
    MockAlifeSimulator.addToRegistry(second);
    MockAlifeSimulator.addToRegistry(third);
    registerStoryLink(first.id, "pri_a28_sr_mono_add_1");
    registerStoryLink(second.id, "pri_a28_sr_mono_add_2");
    registerStoryLink(third.id, "pri_a28_sr_mono_add_3");

    callXrEffect("pri_a28_check_zones", actorGameObject, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.pri_a28_wave_2_spawned)).toBe(true);
    expect(spawnSquadInSmart).toHaveBeenCalledWith("pri_a28_heli_mono_add_2", "pri_a28_heli");
  });
});
