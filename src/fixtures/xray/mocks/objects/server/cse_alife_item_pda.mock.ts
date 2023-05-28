import { ServerItemPdaObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemPda extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemPda(base: Partial<ServerItemPdaObject> = {}): ServerItemPdaObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemPdaObject;
}
