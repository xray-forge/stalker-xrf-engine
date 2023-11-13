import { ServerDynamicVisualObject } from "@/engine/lib/types";
import {
  MockAlifeDynamicObject,
  mockServerAlifeDynamicObject,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * Mock alife dynamic visual server object.
 */
export class MockAlifeDynamicObjectVisual extends MockAlifeDynamicObject {}

/**
 * Mock data based alife dynamic visual server object.
 */
export function mockServerAlifeDynamicObjectVisual(
  base: Partial<ServerDynamicVisualObject> = {}
): ServerDynamicVisualObject {
  return mockServerAlifeDynamicObject(base) as ServerDynamicVisualObject;
}
