import { ServerDynamicObject } from "@/engine/lib/types";
import { MockAlifeObject, mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock dynamic alife server object.
 */
export class MockAlifeDynamicObject extends MockAlifeObject {}

/**
 * Mock data based dynamic alife server object.
 */
export function mockServerAlifeDynamicObject(base: Partial<ServerDynamicObject> = {}): ServerDynamicObject {
  return mockServerAlifeObject(base) as ServerDynamicObject;
}
