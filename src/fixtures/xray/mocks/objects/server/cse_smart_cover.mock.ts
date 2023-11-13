import { jest } from "@jest/globals";

import { ServerSmartCoverObject } from "@/engine/lib/types";
import { MockAlifeObject, mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock generic server object handling smart covers.
 */
export class MockAlifeSmartCover extends MockAlifeObject {
  public set_available_loopholes = jest.fn();

  public set_loopholes_table_checker = jest.fn();

  public description = jest.fn(() => "default");

  public FillProps(): void {}
}

/**
 * Mock object representation based on provided data.
 */
export function mockServerAlifeSmartCover(base: Partial<ServerSmartCoverObject> = {}): ServerSmartCoverObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerSmartCoverObject;
}
