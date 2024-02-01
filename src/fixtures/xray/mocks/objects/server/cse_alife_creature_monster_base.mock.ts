import { jest } from "@jest/globals";
import type { CALifeMonsterBrain } from "xray16";

import { ServerMonsterBaseObject, TNumberId, TRate } from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray/mocks/constants";
import { MockCAlifeMonsterBrain } from "@/fixtures/xray/mocks/objects/CAlifeMonsterBrain.mock";
import { MockServerAlifeCreatureAbstract } from "@/fixtures/xray/mocks/objects/server/cse_alife_creature_abstract.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock alife monster creature server object.
 */
export class MockAlifeMonsterBase extends MockServerAlifeCreatureAbstract {
  public static override mockWithClassId(classId: TNumberId): ServerMonsterBaseObject {
    return new this({ clsid: classId }) as unknown as ServerMonsterBaseObject;
  }

  public static override mock(config: IMockAlifeObjectConfig = {}): ServerMonsterBaseObject {
    const object: MockAlifeMonsterBase = new this({ ...config, clsid: config.clsid ?? mockClsid.bloodsucker_s });

    object.objectRank = config.rank ?? -1;

    return object as unknown as ServerMonsterBaseObject;
  }

  public aiBrain: CALifeMonsterBrain = MockCAlifeMonsterBrain.mock();

  public objectRank: TRate = -1;

  public brain = jest.fn(() => this.aiBrain);

  public rank = jest.fn(() => this.objectRank);
}
