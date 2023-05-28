import { ServerPhysicObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeObjectPhysic extends MockAlifeDynamicObjectVisual {}

/**
 * todo;
 */
export function mockServerAlifeObjectPhysic(base: Partial<ServerPhysicObject> = {}): ServerPhysicObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerPhysicObject;
}
