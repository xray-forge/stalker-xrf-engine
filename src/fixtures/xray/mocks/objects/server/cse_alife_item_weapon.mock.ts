import { ServerWeaponObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemWeapon extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemWeapon(base: Partial<ServerWeaponObject> = {}): ServerWeaponObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerWeaponObject;
}
