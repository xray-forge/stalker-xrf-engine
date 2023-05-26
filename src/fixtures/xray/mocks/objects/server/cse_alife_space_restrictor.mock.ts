import { cse_alife_space_restrictor } from "xray16";

import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockSpaceRestrictor extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerSpaceRestrictor(base: Partial<cse_alife_space_restrictor> = {}): cse_alife_space_restrictor {
  return { ...mockServerAlifeObject(), ...base } as unknown as cse_alife_space_restrictor;
}
