import { jest } from "@jest/globals";

import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { AlifeSimulator, Optional, ServerObject, TClassId, TNumberId, Vector } from "@/engine/lib/types";
import {
  mockClsid,
  mockServerAlifeHumanStalker,
  mockServerAlifeObject,
  mockServerAlifeOnlineOfflineGroup,
} from "@/fixtures/xray";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * Mock alife simulator registry containing data with server objects.
 */
export class MockAlifeSimulator {
  public static simulator: Optional<MockAlifeSimulator> = null;
  public static registry: Record<number, ServerObject> = {};

  public static getInstance(): MockAlifeSimulator {
    if (!MockAlifeSimulator.simulator) {
      MockAlifeSimulator.simulator = new MockAlifeSimulator();
    }

    return MockAlifeSimulator.simulator;
  }

  public static mock(): AlifeSimulator {
    return MockAlifeSimulator.getInstance() as unknown as AlifeSimulator;
  }

  public static reset(): void {
    MockAlifeSimulator.simulator = new MockAlifeSimulator();
    MockAlifeSimulator.registry = {};
  }

  public static addToRegistry(object: ServerObject): void {
    MockAlifeSimulator.registry[object.id] = object;
  }

  public static removeFromRegistry(id: number): void {
    delete MockAlifeSimulator.registry[id];
  }

  public static getFromRegistry<T extends ServerObject = ServerObject>(id: number): Optional<T> {
    return (MockAlifeSimulator.registry[id] as T) || null;
  }

  public actor = jest.fn(() => MockAlifeSimulator.registry[0] || null);

  public object = jest.fn((id: number) => MockAlifeSimulator.registry[id] || null);

  public create = jest.fn((section: string, position: MockVector, lvid: TNumberId, fvid: TNumberId) => {
    if (section === "stalker") {
      return mockServerAlifeHumanStalker({
        clsid: jest.fn(() => mockClsid.script_stalker as TClassId),
        position: position as unknown as Vector,
        m_level_vertex_id: lvid,
        m_game_vertex_id: fvid,
      });
    } else if (section === "squad") {
      return mockServerAlifeOnlineOfflineGroup();
    }

    return mockServerAlifeObject({
      sectionOverride: section,
      position: position as unknown as Vector,
      m_level_vertex_id: lvid,
      m_game_vertex_id: fvid,
    });
  });

  public create_ammo = jest.fn(() => {});

  public level_name = jest.fn(() => "pripyat");

  public level_id = jest.fn(() => 3);

  public set_objects_per_update = jest.fn(() => {});

  public switch_distance = jest.fn(() => 150);

  public iterate_objects = jest.fn((cb: (object: ServerObject) => void) => {
    return Object.values(MockAlifeSimulator.registry).forEach((v) => {
      if (v.id !== ACTOR_ID) {
        cb(v);
      }
    });
  });

  public release = jest.fn((object: ServerObject) => {
    MockAlifeSimulator.removeFromRegistry(object.id);
  });
}
