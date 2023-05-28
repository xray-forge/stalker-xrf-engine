import { ServerTorridZoneObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeDynamicObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object.mock";

/**
 * todo;
 */
export class MockTorridZone extends MockAlifeDynamicObject {}

/**
 * todo;
 */
export function mockServerTorridZone(base: Partial<ServerTorridZoneObject> = {}): ServerTorridZoneObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerTorridZoneObject;
}
