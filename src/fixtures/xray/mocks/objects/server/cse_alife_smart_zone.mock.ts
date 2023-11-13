import { jest } from "@jest/globals";

import { ServerSmartZoneObject, TNumberId } from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray/mocks/constants";
import { MockAlifeObject, mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock alife smart zone server object.
 */
export class MockAlifeSmartZone extends MockAlifeObject {
  public override m_level_vertex_id: TNumberId = 255;
  public override m_game_vertex_id: TNumberId = 512;

  public set_available_loopholes = jest.fn();

  public clsid(): TNumberId {
    return mockClsid.smart_zone;
  }

  public updateMapDisplay(): void {}
}

/**
 * Mock data based alife smart zone server object.
 */
export function mockServerAlifeSmartZone(base: Partial<ServerSmartZoneObject> = {}): ServerSmartZoneObject {
  return mockServerAlifeObject({
    ...base,
    clsid: () => mockClsid.smart_zone,
    m_level_vertex_id: base.m_level_vertex_id || 255,
    m_game_vertex_id: base.m_game_vertex_id || 512,
    updateMapDisplay: jest.fn(),
  } as unknown as ServerSmartZoneObject) as unknown as ServerSmartZoneObject;
}
