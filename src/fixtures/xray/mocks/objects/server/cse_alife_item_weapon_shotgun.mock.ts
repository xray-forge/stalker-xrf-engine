import { ServerWeaponShotgunObject } from "@/engine/lib/types";
import {
  MockAlifeItemWeapon,
  mockServerAlifeItemWeapon,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_item_weapon.mock";

/**
 * Mock alife shotgun weapon server object.
 */
export class MockAlifeItemWeaponShotgun extends MockAlifeItemWeapon {}

/**
 * Mock data based alife shotgun weapon server object.
 */
export function mockServerAlifeItemWeaponShotgun(
  base: Partial<ServerWeaponShotgunObject> = {}
): ServerWeaponShotgunObject {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as ServerWeaponShotgunObject;
}
