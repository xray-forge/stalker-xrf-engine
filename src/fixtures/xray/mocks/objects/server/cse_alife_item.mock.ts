import { cse_alife_item } from "xray16";

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
export function mockServerAlifeItem(base: Partial<cse_alife_item> = {}): cse_alife_item {
  return { ...mockServerAlifeDynamicObjectVisual(), ...base } as unknown as cse_alife_item;
}
