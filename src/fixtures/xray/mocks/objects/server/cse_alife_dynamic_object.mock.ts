import { cse_alife_dynamic_object } from "xray16";

import { MockAlifeObject, mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * todo;
 */
export class MockAlifeDynamicObject extends MockAlifeObject {}

/**
 * todo;
 */
export function mockServerAlifeDynamicObject(base: Partial<cse_alife_dynamic_object> = {}): cse_alife_dynamic_object {
  return mockServerAlifeObject(base) as cse_alife_dynamic_object;
}
