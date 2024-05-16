import { jest } from "@jest/globals";

import type { TConditionList } from "@/engine/core/utils/ini";
import { TCommunity } from "@/engine/lib/constants/communities";
import {
  Optional,
  ServerCreatureObject,
  ServerGroupObject,
  ServerSquadMemberDescriptor,
  TCount,
  TIndex,
  TNumberId,
} from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray/mocks/constants/clsid.mock";
import { MockAlifeSimulator } from "@/fixtures/xray/mocks/objects/AlifeSimulator.mock";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Class mocking generic server offline-online group.
 */
export class MockAlifeOnlineOfflineGroup extends MockAlifeDynamicObject {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerGroupObject {
    return new this({ ...config, clsid: mockClsid.online_offline_group_s }) as unknown as ServerGroupObject;
  }

  public members: Array<ServerSquadMemberDescriptor> = [];
  public invulnerable!: TConditionList;
  public faction!: TCommunity;

  public squad_members = jest.fn((): Array<ServerSquadMemberDescriptor> => {
    return this.members;
  });

  public register_member(id: TNumberId): void {
    this.members.push({ id: id, object: MockAlifeSimulator.getFromRegistry(id) as ServerCreatureObject });
  }

  public unregister_member(id: TNumberId): void {
    const index: TIndex = this.members.findIndex((it) => it.id === id);

    if (index !== -1) {
      this.members.splice(index, 1);
    }
  }

  public add_location_type = jest.fn(() => {});

  public clear_location_types = jest.fn(() => {});

  public force_change_position = jest.fn(() => {});

  public commander_id(): Optional<TNumberId> {
    return null;
  }

  public npc_count = jest.fn((): TCount => {
    return this.members.length;
  });

  public force_set_goodwill = jest.fn();

  public asMock(): ServerGroupObject {
    return this as unknown as ServerGroupObject;
  }
}
