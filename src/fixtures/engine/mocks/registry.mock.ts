import { registerActor, registerActorServer } from "@/engine/core/database/actor";
import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerRanks } from "@/engine/core/database/ranks";
import { registry } from "@/engine/core/database/registry";
import { AlifeSimulator, GameObject, ServerActorObject } from "@/engine/lib/types";
import {
  IMockAlifeObjectConfig,
  IMockGameObjectConfig,
  MockAlifeCreatureActor,
  MockAlifeSimulator,
  MockGameObject,
} from "@/fixtures/xray/mocks/objects";

export interface IMockActorDetails {
  actorGameObject: GameObject;
  actorServerObject: ServerActorObject;
  actorState: IRegistryObjectState;
}

/**
 * Mock actor client/server side.
 */
export function mockRegisteredActor(
  actorGameConfig: IMockGameObjectConfig = {},
  actorServerConfig: IMockAlifeObjectConfig = {}
): IMockActorDetails {
  const actorGameObject: GameObject = MockGameObject.mockActor(actorGameConfig);
  const actorServerObject: ServerActorObject = registerActorServer(MockAlifeCreatureActor.mock(actorServerConfig));
  const actorState: IRegistryObjectState = registerActor(actorGameObject);

  return { actorGameObject: actorGameObject, actorServerObject, actorState };
}

/**
 * Reset managers registry state.
 */
export function resetRegistry(): void {
  registry.actor = null as unknown as GameObject;
  registry.actorCombat = new LuaTable();
  registry.artefacts.parentZones = new LuaTable();
  registry.artefacts.points = new LuaTable();
  registry.artefacts.ways = new LuaTable();
  registry.camps = new LuaTable();
  registry.crows.count = 0;
  registry.crows.storage = new LuaTable();
  registry.doors = new LuaTable();
  registry.dynamicData = {
    event: {},
    extensions: {},
    store: {},
    objects: new LuaTable(),
  };
  registry.effectsVolume = 0;
  registry.extensions = new LuaTable();
  registry.helicopter.storage = new LuaTable();
  registry.managers = new LuaTable();
  registry.managersByName = new LuaTable();
  registry.musicVolume = 0;
  registry.noWeaponZones = new LuaTable();
  registry.objects = new LuaTable();
  registry.offlineObjects = new LuaTable();
  registry.schemes = new LuaTable();
  registry.signalLights = new LuaTable();
  registry.simulationObjects = new LuaTable();
  registry.simulator = null as unknown as AlifeSimulator;
  registry.smartCovers = new LuaTable();
  registry.smartTerrainsCampfires = new LuaTable();
  registry.spawnedVertexes = new LuaTable();
  registry.storyLink = { sidById: new LuaTable(), idBySid: new LuaTable() };
  registry.trade = new LuaTable();
  registry.zones = new LuaTable();

  registerRanks();

  MockAlifeSimulator.reset();
}
