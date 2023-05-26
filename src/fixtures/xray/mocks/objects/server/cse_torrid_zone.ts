import { cse_torrid_zone } from "xray16";

import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockTorridZone extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerTorridZone(base: Partial<cse_torrid_zone> = {}): cse_torrid_zone {
  return { ...mockServerAlifeObject(), ...base } as unknown as cse_torrid_zone;
}
