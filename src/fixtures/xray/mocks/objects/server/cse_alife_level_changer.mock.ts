import { ServerLevelChangerObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockSpaceRestrictor } from "@/fixtures/xray/mocks/objects/server/cse_alife_space_restrictor.mock";

/**
 * Mock alife level changer server object.
 */
export class MockAlifeLevelChanger extends MockSpaceRestrictor {}

/**
 * Mock data based alife level changer server object.
 */
export function mockServerAlifeLevelChanger(base: Partial<ServerLevelChangerObject> = {}): ServerLevelChangerObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerLevelChangerObject;
}
