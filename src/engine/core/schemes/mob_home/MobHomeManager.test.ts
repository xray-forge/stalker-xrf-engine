import { describe, expect, it, jest } from "@jest/globals";

import { ISchemeMobHomeState } from "@/engine/core/schemes/mob_home/ISchemeMobHomeState";
import { MobHomeManager } from "@/engine/core/schemes/mob_home/MobHomeManager";
import { EMonsterState } from "@/engine/lib/constants/monsters";
import {
  ClientObject,
  EScheme,
  ServerCreatureObject,
  ServerSmartZoneObject,
  TDistance,
  TName,
} from "@/engine/lib/types";
import { mockSchemeState } from "@/fixtures/engine/mocks";
import {
  MockAlifeSimulator,
  mockClientGameObject,
  mockServerAlifeHumanStalker,
  mockServerAlifeSmartZone,
} from "@/fixtures/xray";

describe("MobHomeManager functionality", () => {
  it("should correctly call set home", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeMobHomeState = mockSchemeState<ISchemeMobHomeState>(EScheme.MOB_HOME, {
      homeMinRadius: 40,
      homeMaxRadius: 60,
      homeWayPoint: "test-wp",
      isAggressive: true,
      monsterState: EMonsterState.NONE,
      isSmartTerrainPoint: false,
    });
    const mobHomeManager: MobHomeManager = new MobHomeManager(object, state);

    jest.spyOn(mobHomeManager, "getHomeParameters").mockImplementation(() => {
      return $multi(
        state.homeWayPoint as TName,
        state.homeMinRadius as TDistance,
        state.homeMaxRadius as TDistance,
        state.isAggressive,
        state.homeMidRadius as TDistance
      );
    });

    mobHomeManager.activate();

    expect(mobHomeManager.getHomeParameters).toHaveBeenCalledTimes(1);
    expect(object.set_home).toHaveBeenCalledWith(
      state.homeWayPoint,
      state.homeMinRadius,
      state.homeMaxRadius,
      state.isAggressive,
      state.homeMidRadius
    );

    mobHomeManager.deactivate();

    expect(object.remove_home).toHaveBeenCalledTimes(1);
  });

  it("should correctly get home location for generic points", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeMobHomeState = mockSchemeState<ISchemeMobHomeState>(EScheme.MOB_HOME, {
      homeMinRadius: 100,
      homeMaxRadius: 200,
      homeWayPoint: "test-wp",
      isAggressive: true,
      monsterState: EMonsterState.NONE,
      isSmartTerrainPoint: false,
    });
    const mobHomeManager: MobHomeManager = new MobHomeManager(object, state);

    const [name, minRadius, maxRadius, isAggressive, midRadius] = mobHomeManager.getHomeParameters();

    expect(name).toBe("test-wp");
    expect(minRadius).toBe(100);
    expect(maxRadius).toBe(200);
    expect(midRadius).toBe(150);
    expect(isAggressive).toBe(true);
  });

  it("should correctly get home location for defaults", () => {
    const object: ClientObject = mockClientGameObject();
    const state: ISchemeMobHomeState = mockSchemeState<ISchemeMobHomeState>(EScheme.MOB_HOME, {
      homeWayPoint: "test-wp",
    });
    const mobHomeManager: MobHomeManager = new MobHomeManager(object, state);

    const [name, minRadius, maxRadius, isAggressive, midRadius] = mobHomeManager.getHomeParameters();

    expect(name).toBe("test-wp");
    expect(minRadius).toBe(10);
    expect(maxRadius).toBe(70);
    expect(isAggressive).toBe(false);
    expect(midRadius).toBe(40);
  });

  it("should correctly get home location for smart terrains", () => {
    const smartTerrain: ServerSmartZoneObject = mockServerAlifeSmartZone({ m_level_vertex_id: 333 });
    const object: ClientObject = mockClientGameObject();
    const serverObject: ServerCreatureObject = mockServerAlifeHumanStalker({
      id: object.id(),
      m_smart_terrain_id: smartTerrain.id,
    });

    MockAlifeSimulator.addToRegistry(serverObject);
    MockAlifeSimulator.addToRegistry(smartTerrain);

    const state: ISchemeMobHomeState = mockSchemeState<ISchemeMobHomeState>(EScheme.MOB_HOME, {
      homeWayPoint: "test-wp",
      isSmartTerrainPoint: true,
    });
    const mobHomeManager: MobHomeManager = new MobHomeManager(object, state);

    const [name, minRadius, maxRadius, isAggressive, midRadius] = mobHomeManager.getHomeParameters();

    expect(name).toBe(333);
    expect(minRadius).toBe(10);
    expect(maxRadius).toBe(70);
    expect(isAggressive).toBe(false);
    expect(midRadius).toBe(40);
  });
});
