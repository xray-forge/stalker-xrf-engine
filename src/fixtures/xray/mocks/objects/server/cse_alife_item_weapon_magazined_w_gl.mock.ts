import { XR_cse_alife_item_weapon_magazined_w_gl } from "xray16";

import {
  MockAlifeItemWeapon,
  mockServerAlifeItemWeapon,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_item_weapon.mock";

/**
 * todo;
 */
export class MockAlifeItemWeaponMagazinedWGL extends MockAlifeItemWeapon {}

/**
 * todo;
 */
export function mockServerAlifeItemWeaponMagazinedWGL(
  base: Partial<XR_cse_alife_item_weapon_magazined_w_gl> = {}
): XR_cse_alife_item_weapon_magazined_w_gl {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as XR_cse_alife_item_weapon_magazined_w_gl;
}
