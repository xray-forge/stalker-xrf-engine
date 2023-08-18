import { jest } from "@jest/globals";

import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ServerActorObject, TNumberId } from "@/engine/lib/types";
import {
  MockAlifeDynamicObjectVisual,
  mockServerAlifeDynamicObjectVisual,
} from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";

/**
 * Class based server object mock.
 */
export class MockAlifeCreatureActor extends MockAlifeDynamicObjectVisual {
  public override id: TNumberId = 0;
  public override m_level_vertex_id: TNumberId = 255;
  public override m_game_vertex_id: TNumberId = 512;

  public community(): TCommunity {
    return communities.actor;
  }

  public asMock(): ServerActorObject {
    return this as unknown as ServerActorObject;
  }
}

/**
 * Mock generic actor object.
 */
export function mockServerAlifeCreatureActor({
  id = ACTOR_ID,
  ...base
}: Partial<ServerActorObject> = {}): ServerActorObject {
  return mockServerAlifeDynamicObjectVisual({
    ...base,
    id,
    m_level_vertex_id: base.m_level_vertex_id || 255,
    m_game_vertex_id: base.m_game_vertex_id || 512,
    force_set_goodwill: base.force_set_goodwill || jest.fn(),
    community: base.community || jest.fn(() => communities.actor),
  } as ServerActorObject) as ServerActorObject;
}
