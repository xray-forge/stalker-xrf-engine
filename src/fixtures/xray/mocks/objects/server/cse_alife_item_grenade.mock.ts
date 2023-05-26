import { cse_alife_item_grenade } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemGrenade extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemGrenade(base: Partial<cse_alife_item_grenade> = {}): cse_alife_item_grenade {
  return { ...mockServerAlifeItem(base) } as unknown as cse_alife_item_grenade;
}
