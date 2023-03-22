import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_torrid_zone } from "xray16";

import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo;
 */
export class MockTorridZone extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerTorridZone({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
}: Partial<XR_cse_torrid_zone> = {}): XR_cse_torrid_zone {
  return { m_game_vertex_id, clsid } as unknown as XR_cse_torrid_zone;
}
