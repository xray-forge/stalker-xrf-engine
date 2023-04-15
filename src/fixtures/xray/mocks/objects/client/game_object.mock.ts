import { jest } from "@jest/globals";
import { TXR_class_id, XR_CGameTask, XR_game_object } from "xray16";

import { mockIniFile } from "@/fixtures/xray/mocks/ini";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

let ID_COUNTER: number = 1000;

/**
 * todo;
 */
export function mockClientGameObject({
  character_icon = jest.fn(() => "test_character_icon") as <T>() => T,
  clsid = jest.fn(() => -1 as TXR_class_id),
  disable_info_portion = jest.fn(() => false),
  give_game_news = jest.fn(() => {}),
  give_info_portion = jest.fn(() => false),
  give_talk_message2 = jest.fn(),
  give_task = jest.fn((task: XR_CGameTask, time: number, shouldCheck: boolean, duration: number) => {}),
  has_info = jest.fn(() => false),
  id,
  idOverride = ID_COUNTER++,
  is_talking = jest.fn(() => false),
  name,
  position = jest.fn(() => MockVector.mock(0.25, 0.25, 0.25)),
  section,
  sectionOverride = "section",
  spawn_ini = jest.fn(() => mockIniFile("spawn.ini")),
}: Partial<XR_game_object & { idOverride?: number; sectionOverride?: string }> = {}): XR_game_object {
  return {
    character_icon,
    clsid,
    disable_info_portion,
    give_game_news,
    give_info_portion,
    give_talk_message2,
    give_task,
    has_info,
    id: id || jest.fn(() => idOverride),
    is_talking,
    name: name || jest.fn(() => `${sectionOverride}_${idOverride}`),
    position,
    section: section || jest.fn(() => sectionOverride),
    spawn_ini,
  } as unknown as XR_game_object;
}
