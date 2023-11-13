import { ServerAnomalousZoneObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * Mock anomalous zone server object.
 */
export class MockAnomalousZone extends MockAlifeDynamicObject {}

/**
 * Mock data based anomalous zone server object.
 */
export function mockServerAnomalousZone({
  ...base
}: Partial<ServerAnomalousZoneObject> = {}): ServerAnomalousZoneObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerAnomalousZoneObject;
}
