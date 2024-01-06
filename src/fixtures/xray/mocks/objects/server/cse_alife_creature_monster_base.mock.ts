import { jest } from "@jest/globals";
import { CALifeMonsterBrain } from "xray16";

import { MAX_U16 } from "@/engine/lib/constants/memory";
import {
  ServerCreatureObject,
  ServerMonsterAbstractObject,
  ServerMonsterBaseObject,
  TClassId,
  TNumberId,
  TSection,
} from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray/mocks/constants";
import { MockCAlifeMonsterBrain } from "@/fixtures/xray/mocks/objects/CAlifeMonsterBrain.mock";
import {
  MockServerAlifeCreatureAbstract,
  mockServerAlifeCreatureAbstract,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_creature_abstract.mock";

/**
 * Mock alife monster creature server object.
 */
export class MockAlifeMonsterBase extends MockServerAlifeCreatureAbstract {
  public static override mock(section: TSection = "test_alife_object"): ServerCreatureObject {
    return new MockAlifeMonsterBase(section) as unknown as ServerCreatureObject;
  }

  public static override mockWithClassId(classId: TNumberId): ServerMonsterBaseObject {
    const object: MockAlifeMonsterBase = new MockAlifeMonsterBase("test_alife_object");

    jest.spyOn(object, "clsid").mockImplementation(() => classId as TClassId);

    return object as unknown as ServerMonsterBaseObject;
  }

  public override m_smart_terrain_id: TNumberId = MAX_U16;
  public aiBrain: CALifeMonsterBrain = MockCAlifeMonsterBrain.mock();

  public smart_terrain_id = jest.fn(() => this.m_smart_terrain_id);

  public override clsid = jest.fn(() => mockClsid.bloodsucker_s as TClassId);

  public brain = jest.fn(() => this.aiBrain);
}

/**
 * Mock data based alife monster creature server object.
 */
export function mockServerAlifeMonsterBase(base: Partial<ServerMonsterBaseObject> = {}): ServerMonsterAbstractObject {
  return mockServerAlifeCreatureAbstract({
    ...base,
    clsid: base.clsid || jest.fn(() => mockClsid.bloodsucker_s),
  } as ServerMonsterBaseObject) as unknown as ServerMonsterBaseObject;
}
