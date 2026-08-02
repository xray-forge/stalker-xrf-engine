import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { registerZone } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/pri_a18_use_idol");
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

describe("pri_a18_use_idol", () => {
  it("should start the run camera in the idol restrictor", () => {
    const actor: GameObject = mockActorInsideZone("pri_a18_use_idol_restrictor");

    callXrEffect("pri_a18_use_idol", actor, MockGameObject.mock());

    expect(hasInfoPortion(infoPortions.pri_a18_run_cam)).toBe(true);
  });
});
