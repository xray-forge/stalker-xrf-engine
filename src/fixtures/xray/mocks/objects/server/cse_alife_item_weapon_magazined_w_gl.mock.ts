import { ServerWeaponMagazinedWGLObject } from "@/engine/lib/types";
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
  base: Partial<ServerWeaponMagazinedWGLObject> = {}
): ServerWeaponMagazinedWGLObject {
  return { ...mockServerAlifeItemWeapon(base) } as unknown as ServerWeaponMagazinedWGLObject;
}
