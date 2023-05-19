import { XR_cse_alife_item, XR_cse_alife_item_artefact } from "xray16";

import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemArtefact extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemArtefact(base: Partial<XR_cse_alife_item> = {}): XR_cse_alife_item_artefact {
  return { ...mockServerAlifeItem(), ...base } as unknown as XR_cse_alife_item_artefact;
}
