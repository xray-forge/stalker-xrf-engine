import { ServerWeaponMagazinedObject } from "@/engine/lib/types";
import {
  MockAlifeItemWeapon,
  mockServerAlifeItemWeapon,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_item_weapon.mock";

/**
 * Mock alife magazined weapon item server object.
 */
export class MockAlifeItemWeaponMagazined extends MockAlifeItemWeapon {}

/**
 * Mock data based alife magazined weapon item server object.
 */
export function mockServerAlifeItemWeaponMagazined(
  base: Partial<ServerWeaponMagazinedObject> = {}
): ServerWeaponMagazinedObject {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as ServerWeaponMagazinedObject;
}
