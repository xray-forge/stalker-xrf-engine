import { XR_cse_alife_item_grenade } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemGrenade extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemGrenade(base: Partial<XR_cse_alife_item_grenade> = {}): XR_cse_alife_item_grenade {
  return { ...mockServerAlifeItem(base) } as unknown as XR_cse_alife_item_grenade;
}
