import { cse_alife_item_pda } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemPda extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemPda(base: Partial<cse_alife_item_pda> = {}): cse_alife_item_pda {
  return { ...mockServerAlifeItem(base) } as unknown as cse_alife_item_pda;
}
