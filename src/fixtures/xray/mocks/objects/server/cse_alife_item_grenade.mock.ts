import { ServerItemGrenadeObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemGrenade extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemGrenade(base: Partial<ServerItemGrenadeObject> = {}): ServerItemGrenadeObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemGrenadeObject;
}
