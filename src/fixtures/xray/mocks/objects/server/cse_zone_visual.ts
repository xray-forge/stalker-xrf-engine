import { ServerZoneObject } from "@/engine/lib/types";
import {
  MockAnomalousZone,
  mockServerAnomalousZone,
} from "@/fixtures/xray/mocks/objects/server/cse_anomalous_zone.mock";

/**
 * Mock visual zone server object.
 */
export class MockZoneVisual extends MockAnomalousZone {}

/**
 * Mock data based visual zone server object.
 */
export function mockServerVisual(base: Partial<ServerZoneObject> = {}): ServerZoneObject {
  return { ...mockServerAnomalousZone(), ...base } as unknown as ServerZoneObject;
}
