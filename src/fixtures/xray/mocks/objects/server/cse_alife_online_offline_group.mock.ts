import { jest } from "@jest/globals";

import type { Squad } from "@/engine/core/objects/server/squad";
import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ServerCreatureObject, ServerGroupObject, ServerSquadMemberDescriptor } from "@/engine/lib/types";
import {
  MockAlifeDynamicObject,
  mockServerAlifeDynamicObject,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * Class mocking generic server offline-online group.
 */
export class MockAlifeOnlineOfflineGroup extends MockAlifeDynamicObject {
  public members: Array<ServerSquadMemberDescriptor> = [];

  public squad_members(): Array<ServerSquadMemberDescriptor> {
    return this.members;
  }

  public addSquadMember(object: ServerCreatureObject): void {
    this.members.push({ object: object, id: object.id });
  }

  public createSquadMembers(): void {}

  public assignSmartTerrain(): void {}

  public update(): void {}

  public asMock(): ServerGroupObject {
    return this as unknown as ServerGroupObject;
  }

  public getCommunity(): TCommunity {
    return communities.stalker;
  }

  public updateSquadRelationToActor(): void {}

  public asSquad(): Squad {
    return this as unknown as Squad;
  }
}

/**
 * todo;
 */
export function mockServerAlifeOnlineOfflineGroup(base: Partial<ServerGroupObject> = {}): ServerGroupObject {
  const members: Array<ServerSquadMemberDescriptor> = [];

  return mockServerAlifeDynamicObject({
    ...base,
    assignSmartTerrain: jest.fn(),
    update: jest.fn(),
    createSquadMembers: jest.fn(),
    squad_members: jest.fn((): Array<ServerSquadMemberDescriptor> => {
      return members;
    }),
    addSquadMember: (object: ServerCreatureObject): void => {
      members.push({ object: object, id: object.id });
    },
  } as unknown as ServerGroupObject) as unknown as ServerGroupObject;
}
