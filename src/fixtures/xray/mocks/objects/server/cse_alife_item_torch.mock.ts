import { ServerItemTorchObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * Mock torch item server object.
 */
export class MockAlifeItemTorch extends MockAlifeItem {}

/**
 * Mock data based torch item server object.
 */
export function mockServerAlifeItemTorch(base: Partial<ServerItemTorchObject> = {}): ServerItemTorchObject {
  return { ...mockServerAlifeItem(base) } as unknown as ServerItemTorchObject;
}
