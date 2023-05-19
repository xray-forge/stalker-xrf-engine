import { XR_cse_alife_item } from "xray16";

import {
  MockAlifeDynamicObjectVisual,
  mockServerAlifeDynamicObjectVisual,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeItem extends MockAlifeDynamicObjectVisual {}

/**
 * todo;
 */
export function mockServerAlifeItem(base: Partial<XR_cse_alife_item> = {}): XR_cse_alife_item {
  return { ...mockServerAlifeDynamicObjectVisual(), ...base } as unknown as XR_cse_alife_item;
}
