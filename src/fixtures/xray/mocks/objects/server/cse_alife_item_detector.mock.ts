import { ServerItemDetectorObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemDetector extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemDetector(base: Partial<ServerItemDetectorObject> = {}): ServerItemDetectorObject {
  return { ...mockServerAlifeObject(base) } as unknown as ServerItemDetectorObject;
}
