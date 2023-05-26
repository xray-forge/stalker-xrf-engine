import { cse_alife_inventory_box } from "xray16";

import {
  MockAlifeDynamicObjectVisual,
  mockServerAlifeDynamicObjectVisual,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeInventoryBox extends MockAlifeDynamicObjectVisual {}

/**
 * todo;
 */
export function mockServerAlifeInventoryBox(base: Partial<cse_alife_inventory_box> = {}): cse_alife_inventory_box {
  return { ...mockServerAlifeDynamicObjectVisual(), ...base } as unknown as cse_alife_inventory_box;
}
