import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_alife_level_changer } from "xray16";

import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo;
 */
export class MockAlifeLevelChanger extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerAlifeLevelChanger({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
}: Partial<XR_cse_alife_level_changer> = {}): XR_cse_alife_level_changer {
  return { m_game_vertex_id, clsid } as unknown as XR_cse_alife_level_changer;
}
