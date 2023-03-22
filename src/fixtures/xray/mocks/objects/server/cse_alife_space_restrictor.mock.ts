import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_alife_space_restrictor } from "xray16";

import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo;
 */
export class MockSpaceRestrictor extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerSpaceRestrictor({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
}: Partial<XR_cse_alife_space_restrictor> = {}): XR_cse_alife_space_restrictor {
  return { m_game_vertex_id, clsid } as unknown as XR_cse_alife_space_restrictor;
}
