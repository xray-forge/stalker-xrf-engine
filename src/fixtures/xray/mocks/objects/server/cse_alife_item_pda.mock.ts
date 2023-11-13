import { ServerItemPdaObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * Mock server PDA item.
 */
export class MockAlifeItemPda extends MockAlifeItem {}

/**
 * Mock data based server PDA item.
 */
export function mockServerAlifeItemPda(base: Partial<ServerItemPdaObject> = {}): ServerItemPdaObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemPdaObject;
}
