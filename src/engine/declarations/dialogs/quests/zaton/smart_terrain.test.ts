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

beforeAll(() => require("@/engine/declarations/dialogs/quests/zaton/smart_terrain"));

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(isObjectInSmartTerrain);
});

describe("squad_not_in_smart_b101", () => {
  it("should check the zat_b101 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b101", "zat_b101", false);
  });
});

describe("squad_not_in_smart_b103", () => {
  it("should check the zat_b103 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b103", "zat_b103", false);
  });
});

describe("squad_not_in_smart_b104", () => {
  it("should check the zat_b104 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b104", "zat_b104", false);
  });
});

describe("squad_not_in_smart_b40", () => {
  it("should check the zat_b40 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b40", "zat_b40_smart_terrain", false);
  });
});

describe("squad_not_in_smart_b18", () => {
  it("should check the zat_b18 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b18", "zat_b18", false);
  });
});

describe("squad_in_smart_zat_base", () => {
  it("should check the Zaton stalker base terrain", () => {
    checkTerrainPredicate("squad_in_smart_zat_base", "zat_stalker_base_smart", true);
  });
});
