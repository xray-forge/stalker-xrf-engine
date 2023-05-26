import { cse_alife_item_ammo, cse_alife_item_explosive } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemExplosive extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemExplosive(base: Partial<cse_alife_item_ammo> = {}): cse_alife_item_explosive {
  return { ...mockServerAlifeItem(base) } as unknown as cse_alife_item_explosive;
}
