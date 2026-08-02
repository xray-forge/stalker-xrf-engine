import { beforeAll, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyObject, LuaArray, TName } from "xray16/lib";
import { $fromArray } from "xray16/macros";
import { MockGameObject } from "xray16/mocks";

beforeAll(() => {
  require("@/engine/declarations/conditions/object/check_npc_name");
});

describe("check_npc_name", () => {
  it("should check object name", () => {
    const actor: GameObject = MockGameObject.mockActor();
    const object: GameObject = MockGameObject.mock();
    const checkNpcName = (_G as AnyObject).xr_conditions.check_npc_name as (
      actor: GameObject,
      object: GameObject,
      params: LuaArray<TName>
    ) => boolean;

    jest.spyOn(object, "name").mockImplementation(() => "some-name");

    expect(checkNpcName(actor, object, $fromArray(["test"]))).toBe(false);

    jest.spyOn(object, "name").mockImplementation(() => "aXb");
    expect(checkNpcName(actor, object, $fromArray(["a.b"]))).toBe(false);

    jest.spyOn(object, "name").mockImplementation(() => "test-123");

    expect(checkNpcName(actor, object, $fromArray(["test"]))).toBe(true);
    expect(checkNpcName(actor, object, $fromArray(["123"]))).toBe(true);
    expect(checkNpcName(actor, object, $fromArray(["abc", "efg", "test"]))).toBe(true);
  });
});
