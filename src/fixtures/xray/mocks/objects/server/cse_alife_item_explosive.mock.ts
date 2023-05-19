import { XR_cse_alife_item_ammo, XR_cse_alife_item_explosive } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemExplosive extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemExplosive(base: Partial<XR_cse_alife_item_ammo> = {}): XR_cse_alife_item_explosive {
  return { ...mockServerAlifeItem(base) } as unknown as XR_cse_alife_item_explosive;
}
