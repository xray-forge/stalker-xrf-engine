import { XR_cse_alife_item_ammo } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemAmmo extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemAmmo(base: Partial<XR_cse_alife_item_ammo> = {}): XR_cse_alife_item_ammo {
  return { ...mockServerAlifeItem(), ...base } as unknown as XR_cse_alife_item_ammo;
}
