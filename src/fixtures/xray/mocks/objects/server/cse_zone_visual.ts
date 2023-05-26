import { cse_zone_visual } from "xray16";

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
export function mockServerVisual(base: Partial<cse_zone_visual> = {}): cse_zone_visual {
  return { ...mockServerAnomalousZone(), ...base } as unknown as cse_zone_visual;
}
