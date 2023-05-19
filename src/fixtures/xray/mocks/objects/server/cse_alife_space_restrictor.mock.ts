import { XR_cse_alife_space_restrictor } from "xray16";

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
  base: Partial<XR_cse_alife_space_restrictor> = {}
): XR_cse_alife_space_restrictor {
  return { ...mockServerAlifeObject(), ...base } as unknown as XR_cse_alife_space_restrictor;
}
