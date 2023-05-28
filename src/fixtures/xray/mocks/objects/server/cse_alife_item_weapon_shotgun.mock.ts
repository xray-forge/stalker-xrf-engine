import { ServerWeaponShotgunObject } from "@/engine/lib/types";
import {
  MockAlifeItemWeapon,
  mockServerAlifeItemWeapon,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_item_weapon.mock";

/**
 * todo;
 */
export class MockAlifeItemWeaponShotgun extends MockAlifeItemWeapon {}

/**
 * todo;
 */
export function mockServerAlifeItemWeaponShotgun(
  base: Partial<ServerWeaponShotgunObject> = {}
): ServerWeaponShotgunObject {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as ServerWeaponShotgunObject;
}
