import { cse_alife_item_helmet } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemHelmet extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemHelmet(base: Partial<cse_alife_item_helmet> = {}): cse_alife_item_helmet {
  return { ...mockServerAlifeItem(base) } as unknown as cse_alife_item_helmet;
}
