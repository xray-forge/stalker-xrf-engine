import { ServerSpaceRestrictorObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockSpaceRestrictor extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerSpaceRestrictor(
  base: Partial<ServerSpaceRestrictorObject> = {}
): ServerSpaceRestrictorObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerSpaceRestrictorObject;
}
