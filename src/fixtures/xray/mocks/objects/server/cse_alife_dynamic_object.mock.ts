import { XR_cse_alife_dynamic_object } from "xray16";

import { MockAlifeObject, mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * todo;
 */
export class MockAlifeDynamicObject extends MockAlifeObject {}

/**
 * todo;
 */
export function mockServerAlifeDynamicObject(
  base: Partial<XR_cse_alife_dynamic_object> = {}
): XR_cse_alife_dynamic_object {
  return { ...mockServerAlifeObject(base) } as unknown as XR_cse_alife_dynamic_object;
}
