import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { EGoodwill } from "@/engine/core/utils/relation";
import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/relation/actor_friend");
});

jest.mock("@/engine/core/utils/relation");

describe("actor_friend", () => {
  it("should set object goodwill", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();

    callXrEffect("actor_friend", actor, object);

    expect(object.force_set_goodwill).toHaveBeenCalledTimes(1);
    expect(object.force_set_goodwill).toHaveBeenCalledWith(EGoodwill.FRIENDS, actor);
  });
});
