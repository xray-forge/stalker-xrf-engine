import { XR_cse_alife_item_torch } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemTorch extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemTorch(base: Partial<XR_cse_alife_item_torch> = {}): XR_cse_alife_item_torch {
  return { ...mockServerAlifeItem(base) } as unknown as XR_cse_alife_item_torch;
}
