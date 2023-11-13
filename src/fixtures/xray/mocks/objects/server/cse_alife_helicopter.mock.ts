import { ServerHelicopterObject } from "@/engine/lib/types";
import { mockServerAlifeItem } from "@/fixtures/xray";
import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * Mock helicopter server object.
 */
export class MockAlifeHelicopter extends MockAlifeDynamicObjectVisual {}

/**
 * Mock data based helicopter server object.
 */
export function mockServerAlifeHelicopter(base: Partial<ServerHelicopterObject> = {}): ServerHelicopterObject {
  return { ...mockServerAlifeItem(), ...base } as unknown as ServerHelicopterObject;
}
