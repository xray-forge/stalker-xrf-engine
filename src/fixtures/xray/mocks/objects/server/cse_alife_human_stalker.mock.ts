import { jest } from "@jest/globals";
import { CALifeMonsterBrain, rotation } from "xray16";

import { MAX_U16 } from "@/engine/lib/constants/memory";
import { ServerHumanObject, TNumberId } from "@/engine/lib/types";
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
  public override m_smart_terrain_id: TNumberId = MAX_U16;
  public aiBrain: CALifeMonsterBrain = MockCAlifeMonsterBrain.mock();

  public smart_terrain_id = jest.fn(() => this.m_smart_terrain_id);

  public clsid = jest.fn(() => mockClsid.script_stalker);

  public brain = jest.fn(() => this.aiBrain);
}

/**
 * todo;
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
