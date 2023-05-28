import { ServerItemOutfitObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemOutfit extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemOutfit(base: Partial<ServerItemOutfitObject> = {}): ServerItemOutfitObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemOutfitObject;
}
