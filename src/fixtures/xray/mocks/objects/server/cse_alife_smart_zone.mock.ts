import { jest } from "@jest/globals";

import { ServerSmartZoneObject } from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray/mocks/constants/clsid.mock";
import { IMockAlifeObjectConfig, MockAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock alife smart zone server object.
 */
export class MockAlifeSmartZone extends MockAlifeObject {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerSmartZoneObject {
    return new this({ ...config, clsid: mockClsid.smart_zone }) as unknown as ServerSmartZoneObject;
  }

  public set_available_loopholes = jest.fn();
}
