import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_has_weapon");
});

describe("actor_has_weapon", () => {
  it("should check if actor active item is weapon", () => {
    const actor: GameObject = MockGameObject.mockActor();

    expect(callXrCondition("actor_has_weapon", actor, MockGameObject.mock())).toBe(false);

    jest.spyOn(actor, "active_item").mockImplementation(() => MockGameObject.mockWithClassId(clsid.wpn_ak74));

    expect(callXrCondition("actor_has_weapon", actor, MockGameObject.mock())).toBe(true);

    jest
      .spyOn(actor, "active_item")
      .mockImplementation(() => MockGameObject.mockWithClassId(clsid.device_detector_elite));

    expect(callXrCondition("actor_has_weapon", actor, MockGameObject.mock())).toBe(false);

    jest.spyOn(actor, "active_item").mockImplementation(() => MockGameObject.mockWithClassId(clsid.wpn_pm));

    expect(callXrCondition("actor_has_weapon", actor, MockGameObject.mock())).toBe(true);
  });
});
