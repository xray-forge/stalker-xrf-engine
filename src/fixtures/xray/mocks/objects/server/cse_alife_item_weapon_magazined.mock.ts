import { ServerWeaponMagazinedObject } from "@/engine/lib/types";
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
  base: Partial<ServerWeaponMagazinedObject> = {}
): ServerWeaponMagazinedObject {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as ServerWeaponMagazinedObject;
}
