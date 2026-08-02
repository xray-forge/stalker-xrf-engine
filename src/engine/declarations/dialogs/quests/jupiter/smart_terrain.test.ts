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

beforeAll(() => require("@/engine/declarations/dialogs/quests/jupiter/smart_terrain"));

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(isObjectInSmartTerrain);
});

describe("squad_not_in_smart_b213", () => {
  it("should check the jup_b213 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b213", "jup_b213", false);
  });
});

describe("squad_not_in_smart_b214", () => {
  it("should check the jup_b214 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b214", "jup_b214", false);
  });
});

describe("squad_not_in_smart_b6", () => {
  // Named after b6 but bound to the jup_b41 terrain, same as the original game script.
  it("should check the jup_b41 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b6", "jup_b41", false);
  });
});

describe("squad_not_in_smart_b205", () => {
  it("should check the jup_b205 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b205", "jup_b205_smart_terrain", false);
  });
});

describe("squad_not_in_smart_b47", () => {
  it("should check the jup_b47 terrain", () => {
    checkTerrainPredicate("squad_not_in_smart_b47", "jup_b47", false);
  });
});
