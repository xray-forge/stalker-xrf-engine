import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrCondition, mockRegisteredActor } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/conditions/actor/actor_see_npc");
});

describe("actor_see_npc", () => {
  it("should check if actor sees NPC", () => {
    const { actorGameObject } = mockRegisteredActor();
    const object: GameObject = MockGameObject.mock();

    jest.spyOn(actorGameObject, "see").mockImplementation(() => true);

    expect(callXrCondition("actor_see_npc", actorGameObject, object)).toBe(true);
    expect(actorGameObject.see).toHaveBeenCalledTimes(1);
    expect(actorGameObject.see).toHaveBeenCalledWith(object);

    jest.spyOn(actorGameObject, "see").mockImplementation(() => false);

    expect(callXrCondition("actor_see_npc", actorGameObject, object)).toBe(false);
    expect(actorGameObject.see).toHaveBeenCalledTimes(2);
    expect(actorGameObject.see).toHaveBeenCalledWith(object);
  });
});
