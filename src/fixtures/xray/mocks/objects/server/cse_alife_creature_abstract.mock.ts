import { jest } from "@jest/globals";

import { MAX_ALIFE_ID } from "@/engine/lib/constants/memory";
import { AnyObject, ServerCreatureObject, TNumberId } from "@/engine/lib/types";
import { MockAlifeDynamicObjectVisual } from "@/fixtures/xray/mocks/objects/server/cse_alife_dynamic_object_visual.mock";
import { IMockAlifeObjectConfig } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";

/**
 * Mock server creature object.
 */
export class MockServerAlifeCreatureAbstract extends MockAlifeDynamicObjectVisual {
  public static override mock(config: IMockAlifeObjectConfig = {}): ServerCreatureObject {
    return new this(config) as unknown as ServerCreatureObject;
  }

  public m_smart_terrain_id: TNumberId;
  public group_id: TNumberId;
  public torso: AnyObject = {};

  public constructor(config: IMockAlifeObjectConfig) {
    super(config);

    this.group_id = config.groupId ?? MAX_ALIFE_ID;
    this.m_smart_terrain_id = config.smartTerrainId ?? MAX_ALIFE_ID;
  }

  public o_torso = jest.fn(() => this.torso);

  public force_set_goodwill = jest.fn();

  public smart_terrain_task_activate = jest.fn();

  public smart_terrain_id = jest.fn(() => this.m_smart_terrain_id);

  public on_death(): void {}
}
