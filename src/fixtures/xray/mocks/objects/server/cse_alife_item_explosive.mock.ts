import { ServerItemAmmoObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * Mock alife explosive server object.
 */
export class MockAlifeItemExplosive extends MockAlifeItem {}

/**
 * Mock data based alife explosive server object.
 */
export function mockServerAlifeItemExplosive(base: Partial<ServerItemAmmoObject> = {}): ServerItemAmmoObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemAmmoObject;
}
