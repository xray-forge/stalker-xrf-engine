import { ServerItemGrenadeObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * Mock alife grenade item server object.
 */
export class MockAlifeItemGrenade extends MockAlifeItem {}

/**
 * Mock data based alife grenade item server object.
 */
export function mockServerAlifeItemGrenade(base: Partial<ServerItemGrenadeObject> = {}): ServerItemGrenadeObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemGrenadeObject;
}
