import { ServerWeaponMagazinedWGLObject } from "@/engine/lib/types";
import {
  MockAlifeItemWeapon,
  mockServerAlifeItemWeapon,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_item_weapon.mock";

/**
 * Mock alife magazined weapon with grenade launcher server object.
 */
export class MockAlifeItemWeaponMagazinedWGL extends MockAlifeItemWeapon {}

/**
 * Mock data based alife magazined weapon with grenade launcher server object.
 */
export function mockServerAlifeItemWeaponMagazinedWGL(
  base: Partial<ServerWeaponMagazinedWGLObject> = {}
): ServerWeaponMagazinedWGLObject {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as ServerWeaponMagazinedWGLObject;
}
