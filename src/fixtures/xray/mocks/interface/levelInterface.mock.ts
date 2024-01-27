import { jest } from "@jest/globals";

import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { GameObject, TName, TNumberId } from "@/engine/lib/types";
import { MockFbox } from "@/fixtures/xray/mocks/FBox.mock";
import { MockGameObject } from "@/fixtures/xray/mocks/objects/game/game_object.mock";
import { patrols } from "@/fixtures/xray/mocks/objects/path";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * Mock game `level` interface.
 */
export const mockLevelInterface = {
  add_cam_effector2: jest.fn(),
  add_cam_effector: jest.fn(),
  add_complex_effector: jest.fn(),
  add_pp_effector: jest.fn(),
  change_game_time: jest.fn(),
  disable_input: jest.fn(),
  get_game_difficulty: jest.fn(() => 3),
  get_bounding_volume: jest.fn(() => MockFbox.mock()),
  get_snd_volume: jest.fn(() => 1),
  get_time_hours: jest.fn(() => 12),
  get_time_minutes: jest.fn(() => 30),
  hide_indicators_safe: jest.fn(),
  iterate_online_objects: jest.fn((cb: (object: GameObject) => void) => {
    return [...MockGameObject.REGISTRY.entries()].forEach(([k, v]) => {
      if (v.id() !== ACTOR_ID) {
        cb(v);
      }
    });
  }),
  map_add_object_spot: jest.fn(),
  map_has_object_spot: jest.fn(() => 0),
  name: jest.fn(() => "zaton"),
  object_by_id: jest.fn((id: TNumberId) => {
    const verifiedId: TNumberId = Number.parseInt(String(id));

    if (Number.isNaN(verifiedId)) {
      throw new Error("Received NaN for object_by_id getter.");
    }

    return MockGameObject.REGISTRY.get(verifiedId);
  }),
  enable_input: jest.fn(),
  map_add_object_spot_ser: jest.fn(),
  map_remove_object_spot: jest.fn(),
  patrol_path_exists: jest.fn((name: TName) => name in patrols),
  present: jest.fn(() => true),
  rain_factor: jest.fn(() => 0),
  remove_cam_effector: jest.fn(),
  remove_complex_effector: jest.fn(),
  remove_pp_effector: jest.fn(),
  set_snd_volume: jest.fn((volume: number) => {}),
  set_weather: jest.fn(),
  show_indicators: jest.fn(),
  show_weapon: jest.fn(),
  stop_weather_fx: jest.fn(),
  vertex_id: jest.fn(() => -1),
  vertex_in_direction: jest.fn(() => -1),
  vertex_position: jest.fn(() => MockVector.create(15, 14, 16)),
};
