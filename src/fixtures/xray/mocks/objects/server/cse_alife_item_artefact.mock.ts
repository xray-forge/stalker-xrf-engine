import { cse_alife_item, cse_alife_item_artefact } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemArtefact extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemArtefact(base: Partial<cse_alife_item> = {}): cse_alife_item_artefact {
  return { ...mockServerAlifeItem(), ...base } as unknown as cse_alife_item_artefact;
}
