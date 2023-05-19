import { XR_cse_alife_item_helmet } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemHelmet extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemHelmet(base: Partial<XR_cse_alife_item_helmet> = {}): XR_cse_alife_item_helmet {
  return { ...mockServerAlifeItem(base) } as unknown as XR_cse_alife_item_helmet;
}
