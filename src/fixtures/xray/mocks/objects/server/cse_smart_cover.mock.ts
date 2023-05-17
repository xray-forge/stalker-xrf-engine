import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_smart_cover } from "xray16";

import { MockAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * todo;
 */
export class MockAlifeSmartCover extends MockAlifeObject {
  public set_available_loopholes = jest.fn();
}

/**
 * todo;
 */
export function mockServerAlifeSmartCover({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
}: Partial<XR_cse_smart_cover> = {}): XR_cse_smart_cover {
  return { m_game_vertex_id, clsid } as unknown as XR_cse_smart_cover;
}
