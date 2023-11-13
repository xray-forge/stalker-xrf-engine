import { ServerItemAmmoObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * Mock alife ammo item server object.
 */
export class MockAlifeItemAmmo extends MockAlifeItem {}

/**
 * Mock data based alife ammo item server object.
 */
export function mockServerAlifeItemAmmo(base: Partial<ServerItemAmmoObject> = {}): ServerItemAmmoObject {
  return { ...mockServerAlifeItem(), ...base } as unknown as ServerItemAmmoObject;
}
