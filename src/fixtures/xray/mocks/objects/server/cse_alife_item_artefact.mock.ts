import { ServerItemArtefactObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * todo;
 */
export class MockAlifeItemArtefact extends MockAlifeItem {}

/**
 * todo;
 */
export function mockServerAlifeItemArtefact(base: Partial<ServerItemArtefactObject> = {}): ServerItemArtefactObject {
  return { ...mockServerAlifeItem(), ...base } as unknown as ServerItemArtefactObject;
}
