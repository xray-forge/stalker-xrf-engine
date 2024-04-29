import { jest } from "@jest/globals";
import type { CALifeMonsterBrain } from "xray16";

import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { ServerHumanObject, TNumberId, TSection } from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray/mocks/constants";
import { MockCAlifeMonsterBrain } from "@/fixtures/xray/mocks/objects/CAlifeMonsterBrain.mock";
import { MockServerAlifeCreatureAbstract } from "@/fixtures/xray/mocks/objects/server/cse_alife_creature_abstract.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock server human object representation.
 */
export class MockAlifeHumanStalker extends MockServerAlifeCreatureAbstract {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerHumanObject {
    return new this({
      ...config,
      community: config.community ?? "stalker",
      clsid: config.clsid ?? mockClsid.script_stalker,
    }) as unknown as ServerHumanObject;
  }

  public static create(section: TSection = "test_human_stalker"): MockAlifeHumanStalker {
    return new MockAlifeHumanStalker({ section });
  }

  public static override mockWithClassId(clsid: TNumberId): ServerHumanObject {
    const object: MockAlifeHumanStalker = new MockAlifeHumanStalker({
      section: "test_alife_object",
      community: "stalker",
      clsid: clsid,
    });

    return object as unknown as ServerHumanObject;
  }

  public override m_smart_terrain_id: TNumberId = MAX_ALIFE_ID;
  public aiBrain: CALifeMonsterBrain = MockCAlifeMonsterBrain.mock();

  public brain = jest.fn(() => this.aiBrain);

  public override can_switch_online(): boolean {
    return false;
  }

  public override can_switch_offline(): boolean {
    return false;
  }
}
