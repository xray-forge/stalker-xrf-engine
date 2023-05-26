import { cse_alife_item_ammo } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemAmmo extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemAmmo(base: Partial<cse_alife_item_ammo> = {}): cse_alife_item_ammo {
  return { ...mockServerAlifeItem(), ...base } as unknown as cse_alife_item_ammo;
}
