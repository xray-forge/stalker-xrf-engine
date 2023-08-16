import { jest } from "@jest/globals";

import { ServerSmartZoneObject, TNumberId } from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray/mocks/constants";
import { MockAlifeObject, mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * todo;
 */
export class MockAlifeSmartZone extends MockAlifeObject {
  public m_game_vertex_id = 150;
  public m_level_vertex_id = 250;

  public set_available_loopholes = jest.fn();

  public clsid(): TNumberId {
    return mockClsid.smart_zone;
  }

  public updateMapDisplay(): void {}
}

/**
 * todo;
 */
export function mockServerAlifeSmartZone(base: Partial<ServerSmartZoneObject> = {}): ServerSmartZoneObject {
  return mockServerAlifeObject({
    ...base,
    clsid: () => mockClsid.smart_zone,
    m_level_vertex_id: base.m_level_vertex_id || 430,
    updateMapDisplay: jest.fn(),
  } as unknown as ServerSmartZoneObject) as unknown as ServerSmartZoneObject;
}
