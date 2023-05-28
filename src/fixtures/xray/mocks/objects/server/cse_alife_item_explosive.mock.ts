import { ServerItemAmmoObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemExplosive extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemExplosive(base: Partial<ServerItemAmmoObject> = {}): ServerItemAmmoObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemAmmoObject;
}
