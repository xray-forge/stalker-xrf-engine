import { ServerHangingLampObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * Mock alife hanging lamp server object.
 */
export class MockAlifeHangingLamp extends MockAlifeDynamicObjectVisual {}

/**
 * Mock data based alife hanging lamp server object.
 */
export function mockServerAlifeHangingLamp(base: Partial<ServerHangingLampObject> = {}): ServerHangingLampObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerHangingLampObject;
}
