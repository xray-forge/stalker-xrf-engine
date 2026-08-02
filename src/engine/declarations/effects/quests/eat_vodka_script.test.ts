import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { MockGameObject } from "xray16/mocks";

import { callXrEffect } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/quests/eat_vodka_script");
});

describe("eat_vodka_script", () => {
  it("should handle vodka", () => {
    const actor: MockGameObject = MockGameObject.createActor();
    const item: GameObject = MockGameObject.mock({ section: "vodka_script" });

    jest.spyOn(actor, "eat").mockImplementation(() => {});

    callXrEffect("eat_vodka_script", actor.asGameObject(), MockGameObject.mock());
    expect(actor.eat).not.toHaveBeenCalled();

    actor.objectInventory.set(item.section(), item);

    callXrEffect("eat_vodka_script", actor.asGameObject(), MockGameObject.mock());
    expect(actor.eat).toHaveBeenCalledWith(item);
  });
});
