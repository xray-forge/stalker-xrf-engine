import { ServerLevelChangerObject } from "@/engine/lib/types";
import { mockServerAlifeObject } from "@/fixtures/xray";
import { MockSpaceRestrictor } from "@/fixtures/xray/mocks/objects/server/cse_alife_space_restrictor.mock";

/**
 * todo;
 */
export class MockAlifeLevelChanger extends MockSpaceRestrictor {}

/**
 * todo;
 */
export function mockServerAlifeLevelChanger(base: Partial<ServerLevelChangerObject> = {}): ServerLevelChangerObject {
  return { ...mockServerAlifeObject(), ...base } as unknown as ServerLevelChangerObject;
}
