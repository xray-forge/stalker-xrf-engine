import { beforeAll, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/restore_health");
});

describe("restore_health", () => {
  it("should correctly restore health of object", () => {
    const object: GameObject = MockGameObject.mock({ health: 0.2 });

    callXrEffect("restore_health", MockGameObject.mockActor(), object);

    expect(object.health).toBe(1);
  });
});
