import { jest } from "@jest/globals";
import { TXR_callback, TXR_class_id, XR_action_planner, XR_CGameTask, XR_game_object } from "xray16";

import { AnyCallable, AnyContextualCallable, AnyObject, PartialRecord } from "@/engine/lib/types";
import { MockMove } from "@/fixtures/xray";
import { MockActionPlanner, mockDefaultActionPlanner } from "@/fixtures/xray/mocks/actions/action_planner.mock";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

let ID_COUNTER: number = 1000;

/**
 * todo;
 */
export function mockClientGameObject({
  active_item = jest.fn(() => null),
  animation_count = jest.fn(() => 0),
  character_icon = jest.fn(() => "test_character_icon") as <T>() => T,
  clsid = jest.fn(() => -1 as TXR_class_id),
  disable_info_portion,
  game_vertex_id = jest.fn(() => 512),
  give_game_news = jest.fn(() => {}),
  give_info_portion,
  give_money,
  give_talk_message2 = jest.fn(),
  give_task = jest.fn((task: XR_CGameTask, time: number, shouldCheck: boolean, duration: number) => {}),
  has_info,
  id,
  idOverride = ID_COUNTER++,
  infoPortions = [],
  inventory = [],
  is_talking = jest.fn(() => false),
  level_vertex_id = jest.fn(() => 255),
  money,
  motivation_action_manager,
  name,
  object,
  position = jest.fn(() => MockVector.mock(0.25, 0.25, 0.25)),
  section,
  sectionOverride = "section",
  spawn_ini = jest.fn(() => mockIniFile("spawn.ini")),
  special_danger_move = jest.fn(() => true),
  transfer_item,
  transfer_money = jest.fn(),
  weapon_unstrapped = jest.fn(() => false),
  ...rest
}: Partial<
  XR_game_object & {
    idOverride?: number;
    sectionOverride?: string;
    infoPortions?: Array<string>;
    inventory: Array<[string | number, XR_game_object]>;
  }
> = {}): XR_game_object {
  const internalInfos: Array<string> = [...infoPortions];
  const inventoryMap: Map<string | number, XR_game_object> = new Map(inventory);
  let objectMoney: number = 0;

  const actionManager: XR_action_planner = mockDefaultActionPlanner();
  const callbacks: PartialRecord<TXR_callback, AnyCallable> = {};

  return {
    ...rest,
    active_item,
    animation_count,
    active_slot: rest.active_slot || jest.fn(() => 3),
    character_icon,
    clsid,
    clear_animations: rest.clear_animations || jest.fn(),
    disable_info_portion:
      disable_info_portion ||
      jest.fn((it: string) => {
        const index = internalInfos.indexOf(it);

        if (index >= 0) {
          internalInfos.splice(index, 1);

          return true;
        } else {
          return false;
        }
      }),
    game_vertex_id,
    give_game_news,
    give_info_portion:
      give_info_portion ||
      jest.fn((it: string) => {
        internalInfos.push(it);

        return false;
      }),
    give_money: give_money || jest.fn((value: number) => (objectMoney += value)),
    give_talk_message2,
    give_task,
    has_info: has_info || jest.fn((it: string) => internalInfos.includes(it)),
    id: id || jest.fn(() => idOverride),
    infoPortions,
    inventory: inventoryMap,
    is_talking,
    level_vertex_id,
    money: money || jest.fn(() => objectMoney),
    motivation_action_manager:
      motivation_action_manager ||
      jest.fn(function (this: XR_game_object) {
        (actionManager as unknown as MockActionPlanner).object = this;

        return actionManager;
      }),
    name: name || jest.fn(() => `${sectionOverride}_${idOverride}`),
    object:
      object ||
      jest.fn((key: string | number) => {
        if (typeof key === "string") {
          return (
            [...inventoryMap.entries()].find(([, it]) => {
              return it.section() === key;
            }) || null
          );
        }

        return inventoryMap.get(key) || null;
      }),
    iterate_inventory: jest.fn((cb: (owner: XR_game_object, item: XR_game_object) => void, owner: XR_game_object) => {
      for (const [, item] of inventoryMap) {
        cb(owner, item);
      }
    }),
    position,
    section: section || jest.fn(() => sectionOverride),
    set_body_state: rest.set_body_state || jest.fn(),
    set_callback:
      rest.set_callback ||
      jest.fn(
        (id: TXR_callback, callback: AnyContextualCallable, context: AnyObject) =>
          (callbacks[id] = callback.bind(context))
      ),
    set_mental_state: rest.set_mental_state || jest.fn(),
    set_sight: rest.set_sight || jest.fn(),
    spawn_ini,
    special_danger_move,
    target_body_state:
      rest.target_body_state ||
      jest.fn(() => {
        return MockMove.standing;
      }),
    transfer_money,
    transfer_item:
      transfer_item ||
      jest.fn((item: XR_game_object, to: XR_game_object) => {
        for (const [key, it] of inventoryMap) {
          if (it === item) {
            inventoryMap.delete(key);
          }
        }
      }),
    weapon_unstrapped,
  } as unknown as XR_game_object;
}
