import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName, TSection } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { isObjectInSmartTerrain } from "@/engine/core/utils/position";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/utils/position");
function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs"]);
}

function resetActor(): GameObject {
  resetRegistry();

  return mockRegisteredActor().actorGameObject;
}

function checkTerrainPredicate(name: TName, terrain: TSection, expectedWhenInside: boolean): void {
  const actorGameObject: GameObject = resetActor();
  const npc: GameObject = MockGameObject.mock();

  replaceFunctionMock(isObjectInSmartTerrain, () => true);
  expect(callDialogsBinding(name, [actorGameObject, npc])).toBe(expectedWhenInside);
  expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, terrain);

  replaceFunctionMock(isObjectInSmartTerrain, () => false);
  expect(callDialogsBinding(name, [actorGameObject, npc])).toBe(!expectedWhenInside);
  expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, terrain);
}

beforeAll(() => require("@/engine/declarations/dialogs/quests/pripyat/smart_terrain"));

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(isObjectInSmartTerrain);
});

describe("squad_not_in_smart_b304", () => {
  it("should check the pri_b304 monsters terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b304", "pri_b304_monsters_smart_terrain", false);
  });
});

describe("squad_not_in_smart_b303", () => {
  it("should check the pri_b303 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b303", "pri_b303", false);
  });
});
