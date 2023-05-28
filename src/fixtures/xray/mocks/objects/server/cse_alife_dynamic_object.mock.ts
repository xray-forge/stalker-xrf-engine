import { ServerDynamicObject } from "@/engine/lib/types";
import { MockAlifeObject, mockServerAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * todo;
 */
export class MockAlifeDynamicObject extends MockAlifeObject {}

/**
 * todo;
 */
export function mockServerAlifeDynamicObject(base: Partial<ServerDynamicObject> = {}): ServerDynamicObject {
  return mockServerAlifeObject(base) as ServerDynamicObject;
}
