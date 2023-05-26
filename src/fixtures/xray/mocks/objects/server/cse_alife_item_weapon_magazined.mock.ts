import { cse_alife_item_weapon_magazined } from "xray16";

import {
  MockAlifeItemWeapon,
  mockServerAlifeItemWeapon,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_item_weapon.mock";

/**
 * todo;
 */
export class MockAlifeItemWeaponMagazined extends MockAlifeItemWeapon {}

/**
 * todo;
 */
export function mockServerAlifeItemWeaponMagazined(
  base: Partial<cse_alife_item_weapon_magazined> = {}
): cse_alife_item_weapon_magazined {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as cse_alife_item_weapon_magazined;
}
