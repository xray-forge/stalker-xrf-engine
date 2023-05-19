import { XR_cse_alife_item, XR_cse_alife_item_detector } from "xray16";

import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemDetector extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemDetector(base: Partial<XR_cse_alife_item> = {}): XR_cse_alife_item_detector {
  return { ...mockServerAlifeObject(base) } as unknown as XR_cse_alife_item_detector;
}
