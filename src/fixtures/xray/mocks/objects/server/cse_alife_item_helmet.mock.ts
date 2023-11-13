import { ServerItemHelmetObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * Mock alife helmet server object.
 */
export class MockAlifeItemHelmet extends MockAlifeItem {}

/**
 * Mock data based alife helmet server object.
 */
export function mockServerAlifeItemHelmet(base: Partial<ServerItemHelmetObject> = {}): ServerItemHelmetObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemHelmetObject;
}
