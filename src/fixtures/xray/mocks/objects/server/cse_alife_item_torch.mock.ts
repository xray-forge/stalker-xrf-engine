import { ServerItemTorchObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemTorch extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemTorch(base: Partial<ServerItemTorchObject> = {}): ServerItemTorchObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemTorchObject;
}
