import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { clsid, danger_object } from "xray16";

import {
  ILogicsOverrides,
  IRegistryObjectState,
  registerObject,
  registerSimulator,
  registry,
} from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/simulation/SimulationBoardManager";
import { SmartTerrain, SmartTerrainControl } from "@/engine/core/objects/smart_terrain";
import { ESmartTerrainStatus } from "@/engine/core/objects/smart_terrain/smart_terrain_types";
import { ISchemeCombatIgnoreState } from "@/engine/core/schemes/stalker/combat_ignore";
import {
  canObjectSelectAsEnemy,
  isObjectFacingDanger,
} from "@/engine/core/schemes/stalker/danger/utils/danger_generic";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded";
import { WoundManager } from "@/engine/core/schemes/stalker/wounded/WoundManager";
import { parseConditionsList } from "@/engine/core/utils/ini";
import { FALSE, TRUE } from "@/engine/lib/constants/words";
import { EGameObjectRelation, EScheme, GameObject, ServerSmartZoneObject, TClassId } from "@/engine/lib/types";
import { mockBaseSchemeLogic, mockSchemeState } from "@/fixtures/engine";
import { replaceFunctionMock } from "@/fixtures/jest";
import {
  MockDangerObject,
  MockGameObject,
  mockServerAlifeHumanStalker,
  mockServerAlifeSmartZone,
} from "@/fixtures/xray";

describe("danger generic utils", () => {
  beforeEach(() => registerSimulator());

  it("isObjectFacingDanger should correctly check generic danger", () => {
    expect(isObjectFacingDanger(MockGameObject.mock())).toBe(false);

    const object: GameObject = MockGameObject.mock();
    const bestDanger: MockDangerObject = new MockDangerObject();
    const state: IRegistryObjectState = registerObject(object);

    state[EScheme.COMBAT_IGNORE] = mockSchemeState(EScheme.COMBAT_IGNORE);
    replaceFunctionMock(object.best_danger, () => bestDanger);

    expect(isObjectFacingDanger(object)).toBe(false);

    bestDanger.dangerDependentObject = MockGameObject.mock();
    expect(isObjectFacingDanger(object)).toBe(false);

    replaceFunctionMock(object.relation, () => EGameObjectRelation.ENEMY);
    expect(isObjectFacingDanger(object)).toBe(false);

    bestDanger.dangerType = danger_object.hit;
    jest.spyOn(bestDanger.dangerPosition, "distance_to_sqr").mockImplementation(() => 150 * 150);
    expect(isObjectFacingDanger(object)).toBe(true);
  });

  it("isObjectFacingDanger should correctly check generic danger", () => {
    expect(isObjectFacingDanger(MockGameObject.mock())).toBe(false);

    const object: GameObject = MockGameObject.mock();
    const bestDanger: MockDangerObject = new MockDangerObject();
    const state: IRegistryObjectState = registerObject(object);

    state[EScheme.COMBAT_IGNORE] = mockSchemeState(EScheme.COMBAT_IGNORE);
    replaceFunctionMock(object.best_danger, () => bestDanger);

    bestDanger.dangerDependentObject = MockGameObject.mock();
    replaceFunctionMock(object.relation, () => EGameObjectRelation.ENEMY);
    bestDanger.dangerType = danger_object.hit;
    jest.spyOn(bestDanger.dangerPosition, "distance_to_sqr").mockImplementation(() => 150 * 150);

    jest.spyOn(object, "alive").mockImplementation(() => false);
    expect(isObjectFacingDanger(object)).toBe(false);

    jest.spyOn(object, "alive").mockImplementation(() => true);
    expect(isObjectFacingDanger(object)).toBe(true);
  });

  it("isObjectFacingDanger should correctly ignore corpses", () => {
    const object: GameObject = MockGameObject.mock();
    const bestDanger: MockDangerObject = new MockDangerObject();
    const state: IRegistryObjectState = registerObject(object);

    state[EScheme.COMBAT_IGNORE] = mockSchemeState(EScheme.COMBAT_IGNORE);
    replaceFunctionMock(object.best_danger, () => bestDanger);

    bestDanger.dangerType = danger_object.entity_corpse;
    expect(isObjectFacingDanger(object)).toBe(false);
  });

  it("isObjectFacingDanger should correctly check ignore distance", () => {
    const object: GameObject = MockGameObject.mock();
    const bestDanger: MockDangerObject = new MockDangerObject();
    const state: IRegistryObjectState = registerObject(object);

    state[EScheme.COMBAT_IGNORE] = mockSchemeState(EScheme.COMBAT_IGNORE);
    replaceFunctionMock(object.best_danger, () => bestDanger);

    bestDanger.dangerType = danger_object.entity_death;
    jest.spyOn(bestDanger.dangerPosition, "distance_to_sqr").mockImplementation(() => 100);
    expect(isObjectFacingDanger(object)).toBe(true);

    bestDanger.dangerType = danger_object.entity_death;
    jest.spyOn(bestDanger.dangerPosition, "distance_to_sqr").mockImplementation(() => 101);
    expect(isObjectFacingDanger(object)).toBe(false);
  });

  it("isObjectFacingDanger should correctly check grenades", () => {
    const object: GameObject = MockGameObject.mock({ clsid: () => clsid.script_stalker as TClassId });
    const bestDanger: MockDangerObject = new MockDangerObject();
    const state: IRegistryObjectState = registerObject(object);

    state[EScheme.COMBAT_IGNORE] = mockSchemeState(EScheme.COMBAT_IGNORE);
    bestDanger.dangerType = danger_object.grenade;
    replaceFunctionMock(object.best_danger, () => bestDanger);

    // Out of range.
    jest.spyOn(bestDanger.dangerPosition, "distance_to_sqr").mockImplementation(() => 226);
    expect(isObjectFacingDanger(object)).toBe(false);

    // In range.
    jest.spyOn(bestDanger.dangerPosition, "distance_to_sqr").mockImplementation(() => 225);
    expect(isObjectFacingDanger(object)).toBe(true);

    // When zombied.
    jest.spyOn(object, "character_community").mockImplementation(() => "zombied");
    expect(isObjectFacingDanger(object)).toBe(false);

    // When stalker.
    jest.spyOn(object, "character_community").mockImplementation(() => "stalker");
    expect(isObjectFacingDanger(object)).toBe(true);

    // When injured.
    state[EScheme.WOUNDED] = mockSchemeState<ISchemeWoundedState>(EScheme.WOUNDED, {
      woundManager: { woundState: "true" } as WoundManager,
    });
    expect(isObjectFacingDanger(object)).toBe(false);
  });

  it("canObjectSelectAsEnemy should correctly check enemies selection possibility", () => {
    const object: GameObject = MockGameObject.mock({ clsid: () => clsid.script_stalker as TClassId });
    const enemy: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const combatIgnoreState: ISchemeCombatIgnoreState = mockSchemeState(EScheme.COMBAT_IGNORE);

    state[EScheme.COMBAT_IGNORE] = combatIgnoreState;
    expect(canObjectSelectAsEnemy(object, enemy)).toBe(true);
    expect(state.enemyId).toBe(enemy.id());

    state.enemyId = null;
    jest.spyOn(object, "alive").mockImplementationOnce(() => false);
    expect(canObjectSelectAsEnemy(object, enemy)).toBe(false);
    expect(state.enemyId).toBeNull();

    expect(canObjectSelectAsEnemy(MockGameObject.mock(), enemy)).toBe(true);

    state.enemyId = null;
    combatIgnoreState.overrides = {
      combatIgnore: mockBaseSchemeLogic({
        condlist: parseConditionsList(TRUE),
      }),
    } as ILogicsOverrides;
    expect(canObjectSelectAsEnemy(object, enemy)).toBe(false);
    expect(state.enemyId).toBe(enemy.id());

    state.enemyId = null;
    combatIgnoreState.overrides = {
      combatIgnore: mockBaseSchemeLogic({
        condlist: parseConditionsList(FALSE),
      }),
    } as ILogicsOverrides;
    expect(canObjectSelectAsEnemy(object, enemy)).toBe(true);
    expect(state.enemyId).toBe(enemy.id());
  });

  it("canObjectSelectAsEnemy should correctly check enemies in no-combat zones", () => {
    const object: GameObject = MockGameObject.mock({ clsid: () => clsid.script_stalker as TClassId });
    const enemy: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const combatIgnoreState: ISchemeCombatIgnoreState = mockSchemeState(EScheme.COMBAT_IGNORE);

    const noCombatZone: GameObject = MockGameObject.mock();
    const noCombatSmart: ServerSmartZoneObject = mockServerAlifeSmartZone({
      name: <T>() => "zat_stalker_base_smart" as T,
    });

    state[EScheme.COMBAT_IGNORE] = combatIgnoreState;

    registry.zones.set("zat_a2_sr_no_assault", noCombatZone);
    jest.spyOn(noCombatZone, "inside").mockImplementation(() => true);
    SimulationBoardManager.getInstance().registerSmartTerrain(noCombatSmart as SmartTerrain);

    (noCombatSmart as SmartTerrain).smartTerrainActorControl = {
      status: ESmartTerrainStatus.NORMAL,
    } as SmartTerrainControl;

    expect(canObjectSelectAsEnemy(object, enemy)).toBe(false);
    expect(state.enemyId).toBe(enemy.id());
  });

  it("canObjectSelectAsEnemy should correctly ignore enemies in no-combat smarts", () => {
    const object: GameObject = MockGameObject.mock({ clsid: () => clsid.script_stalker as TClassId });
    const enemy: GameObject = MockGameObject.mock();
    const state: IRegistryObjectState = registerObject(object);
    const combatIgnoreState: ISchemeCombatIgnoreState = mockSchemeState(EScheme.COMBAT_IGNORE);

    const noCombatSmart: ServerSmartZoneObject = mockServerAlifeSmartZone({
      name: <T>() => "zat_stalker_base_smart" as T,
    });

    mockServerAlifeHumanStalker({ id: enemy.id(), m_smart_terrain_id: noCombatSmart.id });

    state[EScheme.COMBAT_IGNORE] = combatIgnoreState;
    expect(canObjectSelectAsEnemy(object, enemy)).toBe(false);
    expect(state.enemyId).toBe(enemy.id());
  });
});
