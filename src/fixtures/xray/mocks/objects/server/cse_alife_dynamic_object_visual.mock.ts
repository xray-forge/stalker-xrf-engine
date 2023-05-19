import { XR_cse_alife_dynamic_object_visual, XR_cse_alife_inventory_box } from "xray16";

import {
  MockAlifeDynamicObject,
  mockServerAlifeDynamicObject,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockAlifeDynamicObjectVisual extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerAlifeDynamicObjectVisual(
  base: Partial<XR_cse_alife_dynamic_object_visual> = {}
): XR_cse_alife_inventory_box {
  return mockServerAlifeDynamicObject(base) as XR_cse_alife_dynamic_object_visual;
}
