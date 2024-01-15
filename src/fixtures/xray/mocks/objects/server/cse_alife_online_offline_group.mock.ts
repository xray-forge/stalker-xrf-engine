import { jest } from "@jest/globals";

import type { TConditionList } from "@/engine/core/utils/ini";
import { TCommunity } from "@/engine/lib/constants/communities";
import {
  Optional,
  ServerCreatureObject,
  ServerGroupObject,
  ServerSquadMemberDescriptor,
  TClassId,
  TCount,
  TIndex,
  TNumberId,
} from "@/engine/lib/types";
import { MockAlifeSimulator } from "@/fixtures/xray";
import { mockClsid } from "@/fixtures/xray/mocks/constants";
import {
  MockAlifeDynamicObject,
  mockServerAlifeDynamicObject,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * Class mocking generic server offline-online group.
 */
export class MockAlifeOnlineOfflineGroup extends MockAlifeDynamicObject {
  public members: Array<ServerSquadMemberDescriptor> = [];
  public invulnerable!: TConditionList;
  public faction!: TCommunity;

  public override clsid(): TClassId {
    return mockClsid.online_offline_group_s as TClassId;
  }

  public squad_members(): Array<ServerSquadMemberDescriptor> {
    return this.members;
  }

  public register_member(id: TNumberId): void {
    this.members.push({ id: id, object: MockAlifeSimulator.getFromRegistry(id) as ServerCreatureObject });
  }

  public unregister_member(id: TNumberId): void {
    const index: TIndex = this.members.findIndex((it) => it.id === id);

    if (index !== -1) {
      this.members.splice(index, 1);
    }
  }

  public clear_location_types(): void {}

  public force_change_position(): void {}

  public commander_id(): Optional<TNumberId> {
    return null;
  }

  public npc_count(): TCount {
    return this.members.length;
  }

  public update = jest.fn();

  public asMock(): ServerGroupObject {
    return this as unknown as ServerGroupObject;
  }
}

/**
 * Mock alife group server object for testing.
 */
export function mockServerAlifeOnlineOfflineGroup(base: Partial<ServerGroupObject> = {}): ServerGroupObject {
  const members: Array<ServerSquadMemberDescriptor> = [];

  return mockServerAlifeDynamicObject({
    ...base,
    clsid: () => mockClsid.online_offline_group_s,
    commander_id: jest.fn(() => null),
    assignSmartTerrain: jest.fn(),
    update: jest.fn(),
    createSquadMembers: jest.fn(),
    getCommunity: jest.fn(() => "stalker"),
    squad_members: jest.fn((): Array<ServerSquadMemberDescriptor> => {
      return members;
    }),
    addSquadMember: (object: ServerCreatureObject): void => {
      members.push({ object: object, id: object.id });
    },
  } as unknown as ServerGroupObject) as unknown as ServerGroupObject;
}
