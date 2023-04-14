import { jest } from "@jest/globals";
import { TXR_class_id, XR_CGameTask, XR_game_object } from "xray16";

import { mockIniFile } from "@/fixtures/xray/mocks/ini";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

let ID_COUNTER: number = 1000;

/**
 * todo;
 */
export function mockClientGameObject({
  idOverride = ID_COUNTER++,
  sectionOverride = "section",
  id,
  name,
  section,
  spawn_ini = jest.fn(() => mockIniFile("spawn.ini")),
  clsid = jest.fn(() => -1 as TXR_class_id),
  give_info_portion = jest.fn(() => false),
  disable_info_portion = jest.fn(() => false),
  position = jest.fn(() => MockVector.mock(0.25, 0.25, 0.25)),
  give_task = jest.fn((task: XR_CGameTask, time: number, shouldCheck: boolean, duration: number) => {}),
  has_info = jest.fn(() => false),
}: Partial<XR_game_object & { idOverride?: number; sectionOverride?: string }> = {}): XR_game_object {
  return {
    id: id || jest.fn(() => idOverride),
    name: name || jest.fn(() => `${sectionOverride}_${idOverride}`),
    section: section || jest.fn(() => sectionOverride),
    clsid,
    give_info_portion,
    disable_info_portion,
    position,
    give_task,
    spawn_ini,
    has_info,
  } as unknown as XR_game_object;
}
