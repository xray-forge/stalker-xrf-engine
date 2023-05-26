import { jest } from "@jest/globals";
import { cse_alife_object, cse_alife_object_hanging_lamp, TXR_class_id } from "xray16";

import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeHangingLamp extends MockAlifeDynamicObjectVisual {}

/**
 * todo;
 */
export function mockServerAlifeHangingLamp({
  m_game_vertex_id = 1,
  clsid = jest.fn(() => -1 as TXR_class_id),
}: Partial<cse_alife_object> = {}): cse_alife_object_hanging_lamp {
  return { m_game_vertex_id, clsid } as unknown as cse_alife_object_hanging_lamp;
}
