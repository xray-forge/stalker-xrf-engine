import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { Vector } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/actor/restore_actor_position");
  require("@/engine/declarations/effects/actor/save_actor_position");
});

beforeEach(() => {
  resetRegistry();
});

describe("restore_actor_position", () => {
  it("should restore actor position", () => {
    const { actorGameObject } = mockRegisteredActor();

    const position: Vector = actorGameObject.position();

    expect(() => callXrEffect("restore_actor_position", actorGameObject, MockGameObject.mock())).toThrow(
      "Trying to restore actor position with effect while not saved previous one."
    );

    callXrEffect("save_actor_position", actorGameObject, MockGameObject.mock());
    callXrEffect("restore_actor_position", actorGameObject, MockGameObject.mock());

    expect(actorGameObject.set_actor_position).toHaveBeenCalledTimes(1);
    expect(actorGameObject.set_actor_position).toHaveBeenCalledWith(position);
  });
});
