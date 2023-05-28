import { ServerAnomalousZoneObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockAnomalousZone extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerAnomalousZone({
  ...base
}: Partial<ServerAnomalousZoneObject> = {}): ServerAnomalousZoneObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerAnomalousZoneObject;
}
