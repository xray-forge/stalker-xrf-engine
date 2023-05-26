import { jest } from "@jest/globals";
import { cse_smart_cover, TXR_class_id } from "xray16";

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
}: Partial<cse_smart_cover> = {}): cse_smart_cover {
  return { m_game_vertex_id, clsid } as unknown as cse_smart_cover;
}
