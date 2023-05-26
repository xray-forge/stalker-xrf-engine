import { cse_alife_item_custom_outfit } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemOutfit extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemOutfit(
  base: Partial<cse_alife_item_custom_outfit> = {}
): cse_alife_item_custom_outfit {
  return { ...mockServerAlifeItem(base) } as unknown as cse_alife_item_custom_outfit;
}
