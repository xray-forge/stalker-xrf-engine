import { jest } from "@jest/globals";

import { communities, TCommunity } from "@/engine/lib/constants/communities";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ServerActorObject, TClassId, TNumberId } from "@/engine/lib/types";
import { mockClsid } from "@/fixtures/xray";
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

  public clsid(): TClassId {
    return mockClsid.actor as TClassId;
  }

  public community(): TCommunity {
    return communities.actor;
  }

  public on_death(): void {}

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
    clsid: () => mockClsid.actor,
    m_level_vertex_id: base.m_level_vertex_id || 255,
    m_game_vertex_id: base.m_game_vertex_id || 512,
    force_set_goodwill: base.force_set_goodwill || jest.fn(),
    community: base.community || jest.fn(() => communities.actor),
  } as ServerActorObject) as ServerActorObject;
}
