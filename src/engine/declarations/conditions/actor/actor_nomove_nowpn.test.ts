import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { clsid } from "xray16";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_nomove_nowpn");
});

describe("actor_nomove_nowpn", () => {
  it("should check if actor is talking without weapon", () => {
    const { actorGameObject } = mockRegisteredActor();

    expect(callXrCondition("actor_nomove_nowpn", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(actorGameObject, "active_item").mockImplementation(() => MockGameObject.mockWithClassId(clsid.wpn_ak74));
    expect(callXrCondition("actor_nomove_nowpn", actorGameObject, MockGameObject.mock())).toBe(false);

    jest.spyOn(actorGameObject, "is_talking").mockImplementation(() => true);
    expect(callXrCondition("actor_nomove_nowpn", actorGameObject, MockGameObject.mock())).toBe(true);

    jest.spyOn(actorGameObject, "is_talking").mockImplementation(() => false);
    expect(callXrCondition("actor_nomove_nowpn", actorGameObject, MockGameObject.mock())).toBe(false);

    jest
      .spyOn(actorGameObject, "active_item")
      .mockImplementation(() => MockGameObject.mockWithClassId(clsid.device_detector_advanced));
    expect(callXrCondition("actor_nomove_nowpn", actorGameObject, MockGameObject.mock())).toBe(true);
  });
});
