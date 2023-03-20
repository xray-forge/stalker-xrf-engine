import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_alife_object } from "xray16";

/**
 * todo;
 */
export class MockAlifeObject {}

/**
 * todo;
 */
export function mockServerAlifeObject({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
}: Partial<XR_cse_alife_object> = {}): XR_cse_alife_object {
  return { m_game_vertex_id, clsid } as unknown as XR_cse_alife_object;
}
