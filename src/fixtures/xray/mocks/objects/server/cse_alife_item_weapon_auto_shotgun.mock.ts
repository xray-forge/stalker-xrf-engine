import { ServerWeaponAutoShotgunObject } from "@/engine/lib/types";
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
  base: Partial<ServerWeaponAutoShotgunObject> = {}
): ServerWeaponAutoShotgunObject {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as ServerWeaponAutoShotgunObject;
}
