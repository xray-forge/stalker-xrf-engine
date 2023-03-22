import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_alife_object_physic } from "xray16";

import { AbstractLuabindClass } from "@/fixtures/xray/mocks/objects/AbstractLuabindClass";

/**
 * todo;
 */
export class MockAlifeObjectPhysic extends AbstractLuabindClass {}

/**
 * todo;
 */
export function mockServerAlifeObjectPhysic({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
}: Partial<XR_cse_alife_object_physic> = {}): XR_cse_alife_object_physic {
  return { m_game_vertex_id, clsid } as unknown as XR_cse_alife_object_physic;
}
