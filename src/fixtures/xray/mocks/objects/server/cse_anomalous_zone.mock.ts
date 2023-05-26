import { cse_anomalous_zone } from "xray16";

import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockAnomalousZone extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerAnomalousZone({ ...base }: Partial<cse_anomalous_zone> = {}): cse_anomalous_zone {
  return { ...mockServerAlifeObject(), ...base } as unknown as cse_anomalous_zone;
}
