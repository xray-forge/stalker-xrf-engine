import { ServerItemAmmoObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemAmmo extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemAmmo(base: Partial<ServerItemAmmoObject> = {}): ServerItemAmmoObject {
  return { ...mockServerAlifeItem(), ...base } as unknown as ServerItemAmmoObject;
}
