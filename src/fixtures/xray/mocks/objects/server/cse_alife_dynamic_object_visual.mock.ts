import { ServerDynamicVisualObject } from "@/engine/lib/types";
import {
  MockAlifeDynamicObject,
  mockServerAlifeDynamicObject,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockAlifeDynamicObjectVisual extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerAlifeDynamicObjectVisual(
  base: Partial<ServerDynamicVisualObject> = {}
): ServerDynamicVisualObject {
  return mockServerAlifeDynamicObject(base) as ServerDynamicVisualObject;
}
