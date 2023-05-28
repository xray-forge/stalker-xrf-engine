import { jest } from "@jest/globals";

import { ServerSmartCoverObject } from "@/engine/lib/types";
import { MockAlifeObject, mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * todo;
 */
export class MockAlifeSmartCover extends MockAlifeObject {
  public set_available_loopholes = jest.fn();
}

/**
 * todo;
 */
export function mockServerAlifeSmartCover(base: Partial<ServerSmartCoverObject> = {}): ServerSmartCoverObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerSmartCoverObject;
}
