import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerHumanObject, ServerMonsterBaseObject } from "xray16/alias";
import { MockAlifeHumanStalker, MockAlifeMonsterBase, MockGameObject } from "xray16/mocks";

import { registerSimulator, registerStoryLink } from "@/engine/core/database";
import { callXrCondition, resetRegistry } from "@/fixtures/engine";

beforeEach(() => {
  resetRegistry();
  registerSimulator();
});

beforeAll(() => {
  require("@/engine/declarations/conditions/object/is_alive");
});

describe("is_alive", () => {
  it("should check if stalker is alive", () => {
    const first: GameObject = MockGameObject.mock();
    const firstServer: ServerHumanObject = MockAlifeHumanStalker.mock({ id: first.id() });
    const second: GameObject = MockGameObject.mock();
    const secondServer: ServerMonsterBaseObject = MockAlifeMonsterBase.mock({ id: second.id() });

    registerStoryLink(first.id(), "first-sid");
    registerStoryLink(second.id(), "second-sid");

    expect(callXrCondition("is_alive", MockGameObject.mockActor(), MockGameObject.mock(), "unknown")).toBe(false);

    expect(callXrCondition("is_alive", MockGameObject.mockActor(), first, "first-sid")).toBe(true);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), first, "second-sid")).toBe(false);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), first)).toBe(true);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), firstServer as unknown as GameObject)).toBe(true);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), second, "first-sid")).toBe(true);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), second, "second-sid")).toBe(false);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), second)).toBe(false);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), secondServer as unknown as GameObject)).toBe(false);

    jest.spyOn(firstServer, "alive").mockImplementation(() => false);

    expect(callXrCondition("is_alive", MockGameObject.mockActor(), first)).toBe(false);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), firstServer as unknown as GameObject)).toBe(false);
    expect(callXrCondition("is_alive", MockGameObject.mockActor(), first, "first-sid")).toBe(false);
  });
});
