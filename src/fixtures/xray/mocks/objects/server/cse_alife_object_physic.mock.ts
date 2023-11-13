import { ServerPhysicObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * Mock alife physic server object.
 */
export class MockAlifeObjectPhysic extends MockAlifeDynamicObjectVisual {}

/**
 * Mock data based alife physic server object.
 */
export function mockServerAlifeObjectPhysic(base: Partial<ServerPhysicObject> = {}): ServerPhysicObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerPhysicObject;
}
