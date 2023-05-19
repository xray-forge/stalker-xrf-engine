import { XR_cse_alife_item_weapon_auto_shotgun } from "xray16";

import {
  MockAlifeItemWeapon,
  mockServerAlifeItemWeapon,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_item_weapon.mock";

/**
 * todo;
 */
export class MockAlifeItemWeaponAutoShotgun extends MockAlifeItemWeapon {}

/**
 * todo;
 */
export function mockServerAlifeItemWeaponAutoShotgun(
  base: Partial<XR_cse_alife_item_weapon_auto_shotgun> = {}
): XR_cse_alife_item_weapon_auto_shotgun {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as XR_cse_alife_item_weapon_auto_shotgun;
}
