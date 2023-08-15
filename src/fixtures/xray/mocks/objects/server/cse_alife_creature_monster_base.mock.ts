import { ServerMonsterAbstractObject, ServerMonsterBaseObject } from "@/engine/lib/types";
import {
  MockAlifeDynamicObject,
  mockServerAlifeDynamicObject,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockAlifeMonsterBase extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerAlifeMonsterBase(base: Partial<ServerMonsterBaseObject> = {}): ServerMonsterAbstractObject {
  return mockServerAlifeDynamicObject(base) as unknown as ServerMonsterBaseObject;
}
