import { jest } from "@jest/globals";

import { ServerMonsterAbstractObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray/mocks/constants";
import {
  MockServerAlifeCreatureAbstract,
  mockServerAlifeCreatureAbstract,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_creature_abstract.mock";

/**
 * todo;
 */
export class MockAlifeMonsterBase extends MockServerAlifeCreatureAbstract {
  public clsid = jest.fn(() => mockClsid.bloodsucker_s);
}

/**
 * todo;
 */
export function mockServerAlifeMonsterBase(base: Partial<ServerMonsterBaseObject> = {}): ServerMonsterAbstractObject {
  return mockServerAlifeCreatureAbstract({
    ...base,
    clsid: base.clsid || jest.fn(() => mockClsid.bloodsucker_s),
  } as ServerMonsterBaseObject) as unknown as ServerMonsterBaseObject;
}
