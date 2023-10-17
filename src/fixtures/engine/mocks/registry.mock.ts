import { registerActor, registerActorServer } from "@/engine/core/database/actor";
import { IRegistryObjectState } from "@/engine/core/database/database_types";
import { registerRanks } from "@/engine/core/database/ranks";
import { registry } from "@/engine/core/database/registry";
import { GameObject, ServerActorObject } from "@/engine/lib/types";
import { mockActorGameObject, mockServerAlifeCreatureActor } from "@/fixtures/xray/mocks/objects";

export interface IMockActorDetails {
  actorGameObject: GameObject;
  actorServerObject: ServerActorObject;
  actorState: IRegistryObjectState;
}

/**
 * Mock actor client/server side.
 */
export function mockRegisteredActor(
  actorClientPartial: Partial<GameObject> = {},
  actorServerPartial: Partial<ServerActorObject> = {}
): IMockActorDetails {
  const actorGameObject: GameObject = mockActorGameObject(actorClientPartial);
  const actorServerObject: ServerActorObject = registerActorServer(mockServerAlifeCreatureActor(actorServerPartial));
  const actorState: IRegistryObjectState = registerActor(actorGameObject);

  return { actorGameObject: actorGameObject, actorServerObject, actorState };
}

/**
 * Reset managers registry state.
 */
export function resetRegistry(): void {
  registry.actor = null as unknown as GameObject;
  registry.managers = new LuaTable();
  registry.objects = new LuaTable();
  registry.zones = new LuaTable();
  registry.offlineObjects = new LuaTable();
  registry.crows.storage = new LuaTable();
  registry.crows.count = 0;
  registry.storyLink = { sidById: new LuaTable(), idBySid: new LuaTable() };

  registerRanks();
}

/**
 * Reset managers registry state.
 */
export function resetManagers(): void {
  registry.managers = new LuaTable();
}

/**
 * Reset managers registry state.
 */
export function resetRanks(): void {
  registerRanks();
}

/**
 * Reset offline objects registry state.
 */
export function resetOfflineObjects(): void {
  registry.offlineObjects = new LuaTable();
}

/**
 * Reset story objects registry state.
 */
export function resetStoryObjects(): void {
  registry.storyLink = { sidById: new LuaTable(), idBySid: new LuaTable() };
}
