import { ServerWeaponObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * Mock alife weapon item server object.
 */
export class MockAlifeItemWeapon extends MockAlifeItem {}

/**
 * Mock data based alife weapon item server object.
 */
export function mockServerAlifeItemWeapon(base: Partial<ServerWeaponObject> = {}): ServerWeaponObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerWeaponObject;
}
