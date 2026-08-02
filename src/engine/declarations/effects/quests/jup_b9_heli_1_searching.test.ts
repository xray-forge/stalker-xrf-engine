import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { registerZone } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/jup_b9_heli_1_searching");
});

beforeEach(() => {
  resetRegistry();
});

function mockActorInsideZone(name: string): GameObject {
  const { actorGameObject } = mockRegisteredActor();
  const zone: GameObject = MockGameObject.mock({ name });

  registerZone(zone);
  jest.spyOn(zone, "inside").mockReturnValue(true);

  return actorGameObject;
}

describe("jup_b9_heli_1_searching", () => {
  it("should mark the first Jupiter helicopter as searched in its zone", () => {
    const actor: GameObject = mockActorInsideZone("jup_b9_heli_1");

    callXrEffect("jup_b9_heli_1_searching", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.jup_b9_heli_1_searching)).toBe(true);
  });
});
