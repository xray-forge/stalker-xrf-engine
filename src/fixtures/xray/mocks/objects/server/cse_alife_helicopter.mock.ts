import { jest } from "@jest/globals";
import { TXR_class_id, XR_cse_alife_helicopter, XR_cse_alife_object } from "xray16";

import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeHelicopter extends MockAlifeDynamicObjectVisual {}

/**
 * todo;
 */
export function mockServerAlifeHelicopter({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
}: Partial<XR_cse_alife_object> = {}): XR_cse_alife_helicopter {
  return { m_game_vertex_id, clsid } as unknown as XR_cse_alife_helicopter;
}
