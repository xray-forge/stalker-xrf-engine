import { XR_cse_anomalous_zone } from "xray16";

import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockAnomalousZone extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerAnomalousZone({ ...base }: Partial<XR_cse_anomalous_zone> = {}): XR_cse_anomalous_zone {
  return { ...mockServerAlifeObject(), ...base } as unknown as XR_cse_anomalous_zone;
}
