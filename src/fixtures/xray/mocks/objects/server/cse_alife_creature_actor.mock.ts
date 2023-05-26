import { cse_alife_creature_actor } from "xray16";

import { TNumberId } from "@/engine/lib/types";
import {
  MockAlifeDynamicObjectVisual,
  mockServerAlifeDynamicObjectVisual,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * todo;
 */
export class MockAlifeCreatureActor extends MockAlifeDynamicObjectVisual {
  public override id: TNumberId = 0;

  public asMock(): cse_alife_creature_actor {
    return this as unknown as cse_alife_creature_actor;
  }
}

/**
 * todo;
 */
export function mockServerAlifeCreatureActor({
  id = 0,
  ...base
}: Partial<cse_alife_creature_actor> = {}): cse_alife_creature_actor {
  return mockServerAlifeDynamicObjectVisual({ id, ...base }) as cse_alife_creature_actor;
}
