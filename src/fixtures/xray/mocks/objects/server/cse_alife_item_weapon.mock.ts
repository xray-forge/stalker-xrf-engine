import { XR_cse_alife_item_weapon } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemWeapon extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemWeapon(base: Partial<XR_cse_alife_item_weapon> = {}): XR_cse_alife_item_weapon {
  return { ...mockServerAlifeItem(base) } as unknown as XR_cse_alife_item_weapon;
}
