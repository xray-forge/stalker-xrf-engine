import { ServerItemArtefactObject } from "@/engine/lib/types";
import { MockAlifeItem, mockServerAlifeItem } from "@/fixtures/xray/mocks/objects/server/cse_alife_item.mock";

/**
 * Mock alife artefact item server object.
 */
export class MockAlifeItemArtefact extends MockAlifeItem {}

/**
 * Mock data based alife artefact item server object.
 */
export function mockServerAlifeItemArtefact(base: Partial<ServerItemArtefactObject> = {}): ServerItemArtefactObject {
  return { ...mockServerAlifeItem(), ...base } as unknown as ServerItemArtefactObject;
}
