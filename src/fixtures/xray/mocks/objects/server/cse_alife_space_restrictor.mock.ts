import { ServerSpaceRestrictorObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * Mock space restrictor server object.
 */
export class MockSpaceRestrictor extends MockAlifeDynamicObject {}

/**
 * Mock data based space restrictor server object.
 */
export function mockServerSpaceRestrictor(
  base: Partial<ServerSpaceRestrictorObject> = {}
): ServerSpaceRestrictorObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerSpaceRestrictorObject;
}
