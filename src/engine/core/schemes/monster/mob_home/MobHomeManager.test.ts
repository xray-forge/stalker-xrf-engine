import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { registerSimulator } from "@/engine/core/database";
import { ISchemeMobHomeState } from "@/engine/core/schemes/monster/mob_home/mob_home_types";
import { MobHomeManager } from "@/engine/core/schemes/monster/mob_home/MobHomeManager";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import { EScheme, GameObject, ServerCreatureObject, ServerSmartZoneObject, TDistance, TName } from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine/mocks";
import {
  MockAlifeSimulator,
  MockAlifeSmartZone,
  MockGameObject,
  MockServerAlifeCreatureAbstract,
} from "@/fixtures/xray";

describe("MobHomeManager functionality", () => {
  beforeEach(() => {
    registerSimulator();
  });

  it("should correctly call set home", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobHomeState = mockSchemeState<ISchemeMobHomeState>(EScheme.MOB_HOME, {
      homeMinRadius: 40,
      homeMaxRadius: 60,
      homeWayPoint: "test-wp",
      isAggressive: true,
      monsterState: EMonsterState.NONE,
      isSmartTerrainPoint: false,
    });
    const manager: MobHomeManager = new MobHomeManager(object, state);

    jest.spyOn(manager, "getHomeParameters").mockImplementation(() => {
      return $multi(
        state.homeWayPoint as TName,
        state.homeMinRadius as TDistance,
        state.homeMaxRadius as TDistance,
        state.isAggressive,
        state.homeMidRadius as TDistance
      );
    });

    manager.activate();

    expect(manager.getHomeParameters).toHaveBeenCalledTimes(1);
    expect(object.set_home).toHaveBeenCalledWith(
      state.homeWayPoint,
      state.homeMinRadius,
      state.homeMaxRadius,
      state.isAggressive,
      state.homeMidRadius
    );

    manager.deactivate();

    expect(object.remove_home).toHaveBeenCalledTimes(1);
  });

  it("should correctly get home location for generic points", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobHomeState = mockSchemeState<ISchemeMobHomeState>(EScheme.MOB_HOME, {
      homeMinRadius: 100,
      homeMaxRadius: 200,
      homeWayPoint: "test-wp",
      isAggressive: true,
      monsterState: EMonsterState.NONE,
      isSmartTerrainPoint: false,
    });
    const manager: MobHomeManager = new MobHomeManager(object, state);

    const [name, minRadius, maxRadius, isAggressive, midRadius] = manager.getHomeParameters();

    expect(name).toBe("test-wp");
    expect(minRadius).toBe(100);
    expect(maxRadius).toBe(200);
    expect(midRadius).toBe(150);
    expect(isAggressive).toBe(true);
  });

  it("should correctly get home location for defaults", () => {
    const object: GameObject = MockGameObject.mock();
    const state: ISchemeMobHomeState = mockSchemeState<ISchemeMobHomeState>(EScheme.MOB_HOME, {
      homeWayPoint: "test-wp",
    });
    const manager: MobHomeManager = new MobHomeManager(object, state);

    const [name, minRadius, maxRadius, isAggressive, midRadius] = manager.getHomeParameters();

    expect(name).toBe("test-wp");
    expect(minRadius).toBe(10);
    expect(maxRadius).toBe(70);
    expect(isAggressive).toBe(false);
    expect(midRadius).toBe(40);
  });

  it("should correctly get home location for smart terrains", () => {
    const terrain: ServerSmartZoneObject = MockAlifeSmartZone.mock({ levelVertexId: 333 });
    const object: GameObject = MockGameObject.mock();
    const serverObject: ServerCreatureObject = MockServerAlifeCreatureAbstract.mock({
      id: object.id(),
      smartTerrainId: terrain.id,
    });

    MockAlifeSimulator.addToRegistry(serverObject);
    MockAlifeSimulator.addToRegistry(terrain);

    const state: ISchemeMobHomeState = mockSchemeState<ISchemeMobHomeState>(EScheme.MOB_HOME, {
      homeWayPoint: "test-wp",
      isSmartTerrainPoint: true,
    });
    const manager: MobHomeManager = new MobHomeManager(object, state);

    const [name, minRadius, maxRadius, isAggressive, midRadius] = manager.getHomeParameters();

    expect(name).toBe(333);
    expect(minRadius).toBe(10);
    expect(maxRadius).toBe(70);
    expect(isAggressive).toBe(false);
    expect(midRadius).toBe(40);
  });
});
