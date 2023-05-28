import { ServerZoneObject } from "@/engine/lib/types";
import {
  MockAnomalousZone,
  mockServerAnomalousZone,
} from "@/fixtures/xray/mocks/objects/server/cse_anomalous_zone.mock";

/**
 * todo;
 */
export class MockZoneVisual extends MockAnomalousZone {}

/**
 * todo;
 */
export function mockServerVisual(base: Partial<ServerZoneObject> = {}): ServerZoneObject {
  return { ...mockServerAnomalousZone(), ...base } as unknown as ServerZoneObject;
}
