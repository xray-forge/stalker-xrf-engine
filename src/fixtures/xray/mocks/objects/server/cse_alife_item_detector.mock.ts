import { ServerItemDetectorObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * Mock alife detector server object.
 */
export class MockAlifeItemDetector extends MockAlifeItem {}

/**
 * Mock data based alife detector server object.
 */
export function mockServerAlifeItemDetector(base: Partial<ServerItemDetectorObject> = {}): ServerItemDetectorObject {
  return { ...mockServerAlifeObject(base) } as unknown as ServerItemDetectorObject;
}
