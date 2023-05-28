import { ServerItemHelmetObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemHelmet extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemHelmet(base: Partial<ServerItemHelmetObject> = {}): ServerItemHelmetObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemHelmetObject;
}
