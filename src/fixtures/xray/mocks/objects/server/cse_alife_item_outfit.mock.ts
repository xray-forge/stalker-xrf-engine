import { XR_cse_alife_item_custom_outfit } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemOutfit extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemOutfit(
  base: Partial<XR_cse_alife_item_custom_outfit> = {}
): XR_cse_alife_item_custom_outfit {
  return { ...mockServerAlifeItem(base) } as unknown as XR_cse_alife_item_custom_outfit;
}
