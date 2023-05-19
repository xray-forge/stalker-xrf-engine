import { XR_cse_torrid_zone } from "xray16";

import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockTorridZone extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerTorridZone(base: Partial<XR_cse_torrid_zone> = {}): XR_cse_torrid_zone {
  return { ...mockServerAlifeObject(), ...base } as unknown as XR_cse_torrid_zone;
}
