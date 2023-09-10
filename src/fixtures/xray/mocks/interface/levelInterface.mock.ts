import { jest } from "@jest/globals";

import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { ClientObject, TName, TNumberId } from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua/mocks/LuaTable.mock";
import { patrols } from "@/fixtures/xray/mocks/objects/path";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

export const CLIENT_SIDE_REGISTRY: MockLuaTable<TNumberId, ClientObject> = MockLuaTable.create();

/**
 * Mock game `level` interface.
 */
export const mockLevelInterface = {
  add_cam_effector: jest.fn(),
  add_pp_effector: jest.fn(),
  disable_input: jest.fn(),
  get_game_difficulty: jest.fn(() => 3),
  get_snd_volume: jest.fn(() => 1),
  get_time_hours: jest.fn(() => 12),
  hide_indicators_safe: jest.fn(),
  iterate_online_objects: jest.fn((cb: (object: ClientObject) => void) => {
    return [...CLIENT_SIDE_REGISTRY.entries()].forEach(([k, v]) => {
      if (v.id() !== ACTOR_ID) {
        cb(v);
      }
    });
  }),
  map_add_object_spot: jest.fn(),
  name: jest.fn(() => "zaton"),
  object_by_id: jest.fn((id: TNumberId) => CLIENT_SIDE_REGISTRY.get(id)),
  patrol_path_exists: jest.fn((name: TName) => name in patrols),
  set_snd_volume: jest.fn((volume: number) => {}),
  show_indicators: jest.fn(),
  vertex_position: jest.fn(() => MockVector.create(15, 14, 16)),
  set_weather: jest.fn(),
  map_remove_object_spot: jest.fn(),
};
