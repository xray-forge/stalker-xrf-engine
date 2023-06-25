import { IRegistryObjectState, registerActor } from "@/engine/core/database";
import { ClientObject, ServerActorObject } from "@/engine/lib/types";
import { mockActorClientGameObject, mockServerAlifeCreatureActor } from "@/fixtures/xray/mocks/objects";

export interface IMockActorDetails {
  actorClientObject: ClientObject;
  actorServerObject: ServerActorObject;
  actorState: IRegistryObjectState;
}

/**
 * Mock actor client/server side.
 */
export function mockRegisteredActor(
  actorClientPartial: Partial<ClientObject> = {},
  actorServerPartial: Partial<ServerActorObject> = {}
): IMockActorDetails {
  const actorClientObject: ClientObject = mockActorClientGameObject(actorClientPartial);
  const actorServerObject: ServerActorObject = mockServerAlifeCreatureActor(actorServerPartial);
  const actorState: IRegistryObjectState = registerActor(actorClientObject);

  return { actorClientObject, actorServerObject, actorState };
}
