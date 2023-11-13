import { ServerItemOutfitObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * Mock alife outfit server object.
 */
export class MockAlifeItemOutfit extends MockAlifeItem {}

/**
 * Mock data based alife outfit server object.
 */
export function mockServerAlifeItemOutfit(base: Partial<ServerItemOutfitObject> = {}): ServerItemOutfitObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemOutfitObject;
}
