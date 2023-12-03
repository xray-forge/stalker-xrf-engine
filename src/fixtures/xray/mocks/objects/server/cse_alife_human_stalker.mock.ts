import { jest } from "@jest/globals";
import { CALifeMonsterBrain, rotation } from "xray16";

import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { ServerHumanObject, TNumberId, TSection } from "@/engine/lib/types";
import { MockCAlifeMonsterBrain } from "@/fixtures/xray";
import { mockClsid } from "@/fixtures/xray/mocks/constants";
import {
  MockServerAlifeCreatureAbstract,
  mockServerAlifeCreatureAbstract,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_creature_abstract.mock";

/**
 * Mock server human object representation.
 */
export class MockAlifeHumanStalker extends MockServerAlifeCreatureAbstract {
  public static mock(section: TSection = "test_human_stalker"): MockAlifeHumanStalker {
    return new MockAlifeHumanStalker(section);
  }

  public override m_smart_terrain_id: TNumberId = MAX_U16;
  public aiBrain: CALifeMonsterBrain = MockCAlifeMonsterBrain.mock();

  public smart_terrain_id = jest.fn(() => this.m_smart_terrain_id);

  public clsid = jest.fn(() => mockClsid.script_stalker);

  public brain = jest.fn(() => this.aiBrain);

  public community(): TCommunity {
    return communities.stalker;
  }

  public override can_switch_online(): boolean {
    return false;
  }

  public override can_switch_offline(): boolean {
    return false;
  }
}

/**
 * Mock generic stalker server object.
 *
 * @deprecated
 */
export function mockServerAlifeHumanStalker(base: Partial<ServerHumanObject> = {}): ServerHumanObject {
  return mockServerAlifeCreatureAbstract({
    ...base,
    clsid: base.clsid || jest.fn(() => mockClsid.script_stalker),
    community: base.community || jest.fn(() => "stalker"),
    force_set_goodwill: base.force_set_goodwill || jest.fn(),
    o_torso: base.o_torso || jest.fn(() => ({}) as unknown as rotation),
  } as unknown as ServerHumanObject) as unknown as ServerHumanObject;
}
