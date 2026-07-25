import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { GameObject, ServerCreatureObject } from "xray16/alias";
import { ACTOR_ID, AnyObject, MAX_ALIFE_ID, ZERO_VECTOR } from "xray16/lib";
import { MockGameObject, MockVector } from "xray16/mocks";
import { replaceFunctionMock, resetFunctionMock } from "xray16/testing/utils";

import { registerObject, registry } from "@/engine/core/database";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain";
import { combatConfig } from "@/engine/core/schemes/stalker/combat/CombatConfig";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore/combat_igore_types";
import { CombatProcessEnemyManager } from "@/engine/core/schemes/stalker/combat_ignore/CombatProcessEnemyManager";
import { canObjectSelectAsEnemy } from "@/engine/core/schemes/stalker/danger/utils";
import { EScheme } from "@/engine/core/schemes/types";
import { startTerrainAlarm } from "@/engine/core/utils/smart_terrain";
import { mockRegisteredActor, mockSchemeState, MockSmartTerrain, resetRegistry } from "@/fixtures/engine";

jest.mock("@/engine/core/schemes/stalker/danger/utils", () => ({ canObjectSelectAsEnemy: jest.fn(() => true) }));
jest.mock("@/engine/core/utils/smart_terrain", () => ({ startTerrainAlarm: jest.fn() }));

/**
 * Register a minimal server creature stand-in in the simulator registry.
 */
function mockServerObject(id: number, smartTerrainId: number, position = MockVector.create(0, 0, 0)): AnyObject {
  return { id, m_smart_terrain_id: smartTerrainId, position };
}

function createManager(base: Partial<ISchemeCombatIgnoreState> = {}): {
  manager: CombatProcessEnemyManager;
  object: GameObject;
  state: ISchemeCombatIgnoreState;
} {
  const object: GameObject = MockGameObject.mock();
  const state: ISchemeCombatIgnoreState = mockSchemeState<ISchemeCombatIgnoreState>(EScheme.COMBAT_IGNORE, {
    enabled: true,
    ...base,
  });

  registerObject(object);

  return { manager: new CombatProcessEnemyManager(object, state), object, state };
}

describe("CombatProcessEnemyManager", () => {
  beforeEach(() => {
    resetRegistry();
    resetFunctionMock(canObjectSelectAsEnemy);
    resetFunctionMock(startTerrainAlarm);
    replaceFunctionMock(canObjectSelectAsEnemy, () => true);
    mockRegisteredActor();

    registry.simulator = { object: jest.fn(() => null) } as unknown as AnyObject as typeof registry.simulator;
  });

  it("should register actor combat when actor becomes an enemy", () => {
    const { manager, object } = createManager();
    const actor: GameObject = MockGameObject.mock({ id: ACTOR_ID });

    expect(manager.onObjectEnemy(object, actor)).toBe(true);
    expect(registry.actorCombat.get(object.id())).toBe(true);
  });

  it("should not select enemy that is filtered out by danger utils", () => {
    const { manager, object } = createManager();

    replaceFunctionMock(canObjectSelectAsEnemy, () => false);

    expect(manager.onObjectEnemy(object, MockGameObject.mock())).toBe(false);
    expect(startTerrainAlarm).not.toHaveBeenCalled();
  });

  it("should not raise alarm for object outside of a smart terrain", () => {
    const { manager, object } = createManager();

    registry.simulator = {
      object: jest.fn(() => mockServerObject(object.id(), MAX_ALIFE_ID)),
    } as unknown as AnyObject as typeof registry.simulator;

    expect(manager.onObjectEnemy(object, MockGameObject.mock())).toBe(true);
    expect(startTerrainAlarm).not.toHaveBeenCalled();
  });

  it("should raise smart terrain alarm when object is in a terrain", () => {
    const { manager, object } = createManager();
    const enemy: GameObject = MockGameObject.mock();
    const terrain: SmartTerrain = MockSmartTerrain.mock("test-terrain");

    registry.simulator = {
      object: jest.fn((id: number) =>
        id === 700 ? terrain : mockServerObject(id, 700)
      ) as unknown as typeof registry.simulator.object,
    } as unknown as AnyObject as typeof registry.simulator;

    expect(manager.onObjectEnemy(object, enemy)).toBe(true);
    expect(startTerrainAlarm).toHaveBeenCalledWith(terrain);
  });

  it("should notify terrain control when actor attacks the terrain", () => {
    const { manager, object } = createManager();
    const actor: GameObject = MockGameObject.mock({ id: ACTOR_ID });
    const terrain: SmartTerrain = MockSmartTerrain.mock("test-terrain");

    terrain.terrainControl = { onActorAttackSmartTerrain: jest.fn() } as unknown as SmartTerrain["terrainControl"];

    registry.simulator = {
      object: jest.fn((id: number) =>
        id === 700 ? terrain : mockServerObject(id, 700)
      ) as unknown as typeof registry.simulator.object,
    } as unknown as AnyObject as typeof registry.simulator;

    expect(manager.onObjectEnemy(object, actor)).toBe(true);
    expect(terrain.terrainControl!.onActorAttackSmartTerrain).toHaveBeenCalledTimes(1);
  });

  it("should reject enemies that are too far away", () => {
    const { manager, object } = createManager();
    const enemy: GameObject = MockGameObject.mock();
    const far: number = combatConfig.ATTACK_DISTANCE_SQR + 100;

    registry.simulator = {
      object: jest.fn((id: number) =>
        mockServerObject(id, MAX_ALIFE_ID, {
          distance_to_sqr: () => (id === object.id() ? far : far),
        } as unknown as ReturnType<typeof MockVector.create>)
      ) as unknown as typeof registry.simulator.object,
    } as unknown as AnyObject as typeof registry.simulator;

    expect(manager.onObjectEnemy(object, enemy)).toBe(false);
  });

  it("should accept enemies within attack distance", () => {
    const { manager, object } = createManager();
    const enemy: GameObject = MockGameObject.mock();

    registry.simulator = {
      object: jest.fn((id: number) =>
        mockServerObject(id, MAX_ALIFE_ID, {
          distance_to_sqr: () => 1,
        } as unknown as ReturnType<typeof MockVector.create>)
      ) as unknown as typeof registry.simulator.object,
    } as unknown as AnyObject as typeof registry.simulator;

    expect(manager.onObjectEnemy(object, enemy)).toBe(true);
  });

  it("should ignore hits without source or damage", () => {
    const { manager, object, state } = createManager();

    manager.onHit(object, 10, ZERO_VECTOR, null, 1);
    expect(state.enabled).toBe(true);

    manager.onHit(object, 0, ZERO_VECTOR, MockGameObject.mock({ id: ACTOR_ID }), 1);
    expect(state.enabled).toBe(true);
  });

  it("should ignore hits from objects other than the actor", () => {
    const { manager, object, state } = createManager();

    manager.onHit(object, 10, ZERO_VECTOR, MockGameObject.mock(), 1);

    expect(state.enabled).toBe(true);
  });

  it("should disable combat ignore when actor hits the object", () => {
    const { manager, object, state } = createManager();

    manager.onHit(object, 10, ZERO_VECTOR, MockGameObject.mock({ id: ACTOR_ID }), 1);

    expect(state.enabled).toBe(false);
  });

  it("should keep combat ignore when overrides request it", () => {
    const { manager, object, state } = createManager();

    state.overrides = { combatIgnoreKeepWhenAttacked: true } as never;

    manager.onHit(object, 10, ZERO_VECTOR, MockGameObject.mock({ id: ACTOR_ID }), 1);

    expect(state.enabled).toBe(true);
  });
});
