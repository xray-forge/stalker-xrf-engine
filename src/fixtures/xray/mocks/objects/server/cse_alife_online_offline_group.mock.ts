import type { Squad } from "@/engine/core/objects/server/squad";
import { ServerCreatureObject, ServerGroupObject, ServerSquadMemberDescriptor } from "@/engine/lib/types";
import {
  MockAlifeDynamicObject,
  mockServerAlifeDynamicObject,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockAlifeOnlineOfflineGroup extends MockAlifeDynamicObject {
  public members: Array<ServerSquadMemberDescriptor> = [];

  public squad_members(): Array<ServerSquadMemberDescriptor> {
    return this.members;
  }

  public addSquadMember(object: ServerCreatureObject): void {
    this.members.push({ object: object, id: object.id });
  }

  public asMock(): ServerGroupObject {
    return this as unknown as ServerGroupObject;
  }

  public asSquad(): Squad {
    return this as unknown as Squad;
  }
}

/**
 * todo;
 */
export function mockServerAlifeOnlineOfflineGroup(base: Partial<ServerGroupObject> = {}): ServerGroupObject {
  return mockServerAlifeDynamicObject(base) as unknown as ServerGroupObject;
}
