import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { EGameObjectRelation, GameObject } from "xray16/alias";
import { AnyArgs, AnyObject, TName } from "xray16/lib";
import { MockGameObject } from "xray16/mocks";
import { resetFunctionMock } from "xray16/testing/utils";

import { smartTerrainNames } from "@/engine/constants/smart_terrain_names";
import { registry } from "@/engine/core/database";
import { isObjectInSmartTerrain } from "@/engine/core/utils/position";
import { getObjectsRelationSafe, isActorEnemyWithFaction } from "@/engine/core/utils/relation";
import { callBinding, mockRegisteredActor, resetRegistry } from "@/fixtures/engine";

function callDialogsBinding<T = boolean>(name: TName, args: AnyArgs = []): T {
  return callBinding(name, args, (_G as AnyObject)["dialogs_jupiter"]);
}

jest.mock("@/engine/core/utils/relation");
jest.mock("@/engine/core/utils/position");

beforeAll(() => {
  require("@/engine/declarations/dialogs/jupiter/jup_b4/factions");
});

beforeEach(() => {
  resetRegistry();
  mockRegisteredActor();
  resetFunctionMock(getObjectsRelationSafe);
  resetFunctionMock(isActorEnemyWithFaction);
  resetFunctionMock(isObjectInSmartTerrain);
});

describe("npc_in_b4_smart", () => {
  it("should check the jup_b4 terrain for the NPC speaker", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(isObjectInSmartTerrain).mockReturnValue(true);
    expect(callDialogsBinding("npc_in_b4_smart", [registry.actor, npc])).toBe(true);
    expect(isObjectInSmartTerrain).toHaveBeenLastCalledWith(npc, smartTerrainNames.jup_b4);

    jest.mocked(isObjectInSmartTerrain).mockReturnValue(false);
    expect(callDialogsBinding("npc_in_b4_smart", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_enemies_to_freedom", () => {
  it("should follow the Freedom speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_enemies_to_freedom", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.NEUTRAL);
    expect(callDialogsBinding("jup_b4_is_actor_enemies_to_freedom", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_not_enemies_to_freedom", () => {
  it("should invert the Freedom enemy check", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_not_enemies_to_freedom", [registry.actor, npc])).toBe(false);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.FRIEND);
    expect(callDialogsBinding("jup_b4_is_actor_not_enemies_to_freedom", [registry.actor, npc])).toBe(true);
  });
});

describe("jup_b4_is_actor_friend_to_freedom", () => {
  it("should follow the Freedom speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.FRIEND);
    expect(callDialogsBinding("jup_b4_is_actor_friend_to_freedom", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_friend_to_freedom", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_neutral_to_freedom", () => {
  it("should follow the Freedom speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.NEUTRAL);
    expect(callDialogsBinding("jup_b4_is_actor_neutral_to_freedom", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_neutral_to_freedom", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_enemies_to_dolg", () => {
  it("should follow the Duty speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_enemies_to_dolg", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.NEUTRAL);
    expect(callDialogsBinding("jup_b4_is_actor_enemies_to_dolg", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_not_enemies_to_dolg", () => {
  it("should invert the Duty enemy check", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_not_enemies_to_dolg", [registry.actor, npc])).toBe(false);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.FRIEND);
    expect(callDialogsBinding("jup_b4_is_actor_not_enemies_to_dolg", [registry.actor, npc])).toBe(true);
  });
});

describe("jup_b4_is_actor_friend_to_dolg", () => {
  it("should follow the Duty speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.FRIEND);
    expect(callDialogsBinding("jup_b4_is_actor_friend_to_dolg", [registry.actor, npc])).toBe(true);

    jest.mocked(getObjectsRelationSafe).mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_friend_to_dolg", [registry.actor, npc])).toBe(false);
  });
});

describe("jup_b4_is_actor_neutral_to_dolg", () => {
  // Unlike its seven siblings this predicate reads `relation` off the speaker directly instead of going
  // through `getObjectsRelationSafe`.
  it("should follow the Duty speaker relation", () => {
    const npc: GameObject = MockGameObject.mock();

    MockGameObject.asMock(registry.actor).relation.mockReturnValue(EGameObjectRelation.NEUTRAL);
    expect(callDialogsBinding("jup_b4_is_actor_neutral_to_dolg", [registry.actor, npc])).toBe(true);

    MockGameObject.asMock(registry.actor).relation.mockReturnValue(EGameObjectRelation.ENEMY);
    expect(callDialogsBinding("jup_b4_is_actor_neutral_to_dolg", [registry.actor, npc])).toBe(false);
  });
});
