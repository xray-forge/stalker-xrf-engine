import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { FALSE, TRUE } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/polter_actor_ignore");
});

describe("polter_actor_ignore", () => {
  it("should force poltergeist to ignore actor", () => {
    const object: GameObject = MockGameObject.mock();

    callXrEffect("polter_actor_ignore", MockGameObject.mockActor(), object, TRUE);

    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledTimes(1);
    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledWith(true);

    callXrEffect("polter_actor_ignore", MockGameObject.mockActor(), object, FALSE);

    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledTimes(2);
    expect(object.poltergeist_set_actor_ignore).toHaveBeenCalledWith(false);
  });
});
