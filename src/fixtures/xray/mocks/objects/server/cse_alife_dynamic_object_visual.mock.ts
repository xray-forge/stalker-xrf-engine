import { cse_alife_dynamic_object_visual, cse_alife_inventory_box } from "xray16";

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
  base: Partial<cse_alife_dynamic_object_visual> = {}
): cse_alife_inventory_box {
  return mockServerAlifeDynamicObject(base) as cse_alife_dynamic_object_visual;
}
