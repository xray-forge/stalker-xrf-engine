import { ServerWeaponAutoShotgunObject } from "@/engine/lib/types";
import {
  MockAlifeItemWeapon,
  mockServerAlifeItemWeapon,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_item_weapon.mock";

/**
 * Mock alife auto shotgun server object.
 */
export class MockAlifeItemWeaponAutoShotgun extends MockAlifeItemWeapon {}

/**
 * Mock data based alife auto shotgun server object.
 */
export function mockServerAlifeItemWeaponAutoShotgun(
  base: Partial<ServerWeaponAutoShotgunObject> = {}
): ServerWeaponAutoShotgunObject {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as ServerWeaponAutoShotgunObject;
}
