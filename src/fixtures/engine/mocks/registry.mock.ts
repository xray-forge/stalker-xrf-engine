import { registerActor, registerActorServer } from "@/engine/core/database/actor";
import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerRanks } from "@/engine/core/database/ranks";
import { registry } from "@/engine/core/database/registry";
import { AlifeSimulator, GameObject, ServerActorObject, TName, TNumberId, TSection } from "@/engine/lib/types";
import { MockAlifeSimulator, MockGameObject, mockServerAlifeCreatureActor } from "@/fixtures/xray/mocks/objects";

export interface IMockActorDetails {
  actorGameObject: GameObject;
  actorServerObject: ServerActorObject;
  actorState: IRegistryObjectState;
}

/**
 * Mock actor client/server side.
 */
export function mockRegisteredActor(
  actorGamePartial: Partial<
    GameObject & {
      idOverride?: TNumberId;
      sectionOverride?: TSection;
      infoPortions?: Array<TName>;
      inventory: Array<[TSection | TNumberId, GameObject]>;
      upgrades: Array<TSection>;
    }
  > = {},
  actorServerPartial: Partial<ServerActorObject> = {}
): IMockActorDetails {
  const actorGameObject: GameObject = MockGameObject.mockActor(actorGamePartial);
  const actorServerObject: ServerActorObject = registerActorServer(mockServerAlifeCreatureActor(actorServerPartial));
  const actorState: IRegistryObjectState = registerActor(actorGameObject);

  return { actorGameObject: actorGameObject, actorServerObject, actorState };
}

/**
 * Reset managers registry state.
 */
export function resetRegistry(): void {
  registry.actor = null as unknown as GameObject;
  registry.actorCombat = new LuaTable();
  registry.camps = new LuaTable();
  registry.crows.count = 0;
  registry.crows.storage = new LuaTable();
  registry.doors = new LuaTable();
  registry.effectsVolume = 0;
  registry.extensions = new LuaTable();
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
