import { beforeAll, beforeEach, describe, expect, it } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyCallable } from "xray16/lib";
import { MockAlifeObject, MockAlifeSimulator, MockGameObject } from "xray16/mocks";
import { replaceFunctionMock } from "xray16/testing/utils";

import { registerObject, registerSimulator, registerStoryLink, registry } from "@/engine/core/database";
import { callXrEffect, resetRegistry } from "@/fixtures/engine";

beforeAll(() => {
  require("@/engine/declarations/effects/object/clear_box");
});

beforeEach(() => {
  resetRegistry();
});

describe("clear_box", () => {
  it("should release every item contained in the story inventory box", () => {
    const box: GameObject = MockGameObject.mock();
    const first: GameObject = MockGameObject.mock();
    const second: GameObject = MockGameObject.mock();
    const firstServer = MockAlifeObject.create({ id: first.id() });
    const secondServer = MockAlifeObject.create({ id: second.id() });

    registerSimulator();

    MockAlifeSimulator.addToRegistry(firstServer);
    MockAlifeSimulator.addToRegistry(secondServer);

    registerObject(box);
    registerStoryLink(box.id(), "test-box");

    replaceFunctionMock(box.iterate_inventory_box, (callback: AnyCallable) => {
      callback(box, first);
      callback(box, second);
    });

    callXrEffect("clear_box", MockGameObject.mockActor(), MockGameObject.mock(), "test-box");

    expect(registry.simulator.release).toHaveBeenCalledTimes(2);
    expect(registry.simulator.release).toHaveBeenNthCalledWith(1, firstServer, true);
    expect(registry.simulator.release).toHaveBeenNthCalledWith(2, secondServer, true);
  });
});
