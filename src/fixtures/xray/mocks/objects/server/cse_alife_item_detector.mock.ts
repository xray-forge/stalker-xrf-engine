import { cse_alife_item, cse_alife_item_detector } from "xray16";

import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemDetector extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemDetector(base: Partial<cse_alife_item> = {}): cse_alife_item_detector {
  return { ...mockServerAlifeObject(base) } as unknown as cse_alife_item_detector;
}
