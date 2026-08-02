import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { registerZone } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/zat_b28_heli_3_searching");
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

describe("zat_b28_heli_3_searching", () => {
  it("should mark the third Zaton helicopter as searched in its zone", () => {
    const actor: GameObject = mockActorInsideZone("zat_b28_heli_3");

    callXrEffect("zat_b28_heli_3_searching", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.zat_b28_heli_3_searching)).toBe(true);
  });
});
