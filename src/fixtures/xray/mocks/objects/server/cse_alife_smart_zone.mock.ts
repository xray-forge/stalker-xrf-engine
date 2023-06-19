import { jest } from "@jest/globals";

import { ServerSmartZoneObject } from "@/engine/lib/types";
import { MockAlifeObject, mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * todo;
 */
export class MockAlifeSmartZone extends MockAlifeObject {
  public set_available_loopholes = jest.fn();
}

/**
 * todo;
 */
export function mockServerAlifeSmartZone(base: Partial<ServerSmartZoneObject> = {}): ServerSmartZoneObject {
  return mockServerAlifeObject({
    ...base,
    m_level_vertex_id: base.m_level_vertex_id || 430,
  }) as unknown as ServerSmartZoneObject;
}
