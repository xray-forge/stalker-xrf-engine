import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { infoPortions } from "@/engine/constants/info_portions";
import { registerZone } from "@/engine/core/database";
import { hasInfoPortion } from "@/engine/core/utils/info_portion";
import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/pas_b400_switcher");
});

beforeEach(() => {
  resetRegistry();
});

describe("pas_b400_switcher", () => {
  it("should handle pass switcher", () => {
    mockRegisteredActor();

    callXrEffect("pas_b400_switcher", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pas_b400_switcher_use)).toBe(false);

    const object: GameObject = MockGameObject.mock({ name: "pas_b400_sr_switcher" });

    registerZone(object);

    jest.spyOn(object, "inside").mockImplementation(() => true);

    callXrEffect("pas_b400_switcher", MockGameObject.mockActor(), MockGameObject.mock());
    expect(hasInfoPortion(infoPortions.pas_b400_switcher_use)).toBe(true);
  });
});
