import { jest } from "@jest/globals";

import {
  ActionPlanner,
  AnyCallable,
  AnyContextualCallable,
  AnyObject,
  ClientObject,
  GameTask,
  IniFile,
  PartialRecord,
  TCallback,
  TClassId,
  TIndex,
  TSightType,
  Vector,
} from "@/engine/lib/types";
import { MockMove, MockSightParameters } from "@/fixtures/xray";
import { MockActionPlanner, mockDefaultActionPlanner } from "@/fixtures/xray/mocks/actions/action_planner.mock";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";
import { CLIENT_SIDE_REGISTRY } from "@/fixtures/xray/mocks/interface/levelInterface.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

let ID_COUNTER: number = 1000;

/**
 * todo;
 */
export function mockClientGameObject({
  active_item = jest.fn(() => null),
  animation_count = jest.fn(() => 0),
  character_icon = jest.fn(() => "test_character_icon") as <T>() => T,
  clsid = jest.fn(() => -1 as TClassId),
  disable_info_portion,
  game_vertex_id = jest.fn(() => 512),
  give_game_news = jest.fn(() => {}),
  give_info_portion,
  give_money,
  give_talk_message2 = jest.fn(),
  give_task = jest.fn((task: GameTask, time: number, shouldCheck: boolean, duration: number) => {}),
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
  section,
  sectionOverride = "section",
  special_danger_move = jest.fn(() => true),
  transfer_item,
  weapon_unstrapped = jest.fn(() => false),
  ...rest
}: Partial<
  ClientObject & {
    idOverride?: number;
    sectionOverride?: string;
    infoPortions?: Array<string>;
    inventory: Array<[string | number, ClientObject]>;
  }
> = {}): ClientObject {
  const internalInfos: Array<string> = [...infoPortions];
  const inventoryMap: Map<string | number, ClientObject> = new Map(inventory);

  let objectPosition: Vector = MockVector.mock(0.25, 0.25, 0.25);
  let objectDirection: Vector = MockVector.mock(1, 1, 1);
  let objectMoney: number = 0;

  let sight: TSightType = MockSightParameters.eSightTypeDummy;

  const actionManager: ActionPlanner = mockDefaultActionPlanner();
  const callbacks: PartialRecord<TCallback, AnyCallable> = {};
  const spawnIni: IniFile = mockIniFile("spawn.ini");

  const inRestrictions: Array<string> = ["a", "b", "c"];
  const outRestrictions: Array<string> = ["d", "e", "f"];

  const gameObject = {
    ...rest,
    active_item,
    animation_count,
    active_slot: rest.active_slot || jest.fn(() => 3),
    add_restrictions:
      rest.add_restrictions ||
      jest.fn((outAdd: string, inAdd: string) => {
        outAdd
          .split(",")
          .map((it) => it.trim())
          .filter(Boolean)
          .forEach((it) => outRestrictions.push(it));
        inAdd
          .split(",")
          .map((it) => it.trim())
          .filter(Boolean)
          .forEach((it) => inRestrictions.push(it));
      }),
    character_icon,
    clsid,
    clear_animations: rest.clear_animations || jest.fn(),
    direction: rest.direction || jest.fn(() => objectDirection),
    disable_info_portion:
      disable_info_portion ||
      jest.fn((it: string) => {
        const index: TIndex = internalInfos.indexOf(it);

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
    inside: rest.inside || jest.fn(() => false),
    inventory: inventoryMap,
    is_talking,
    level_vertex_id,
    money: money || jest.fn(() => objectMoney),
    motivation_action_manager:
      motivation_action_manager ||
      jest.fn(function (this: ClientObject) {
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
    out_restrictions: rest.out_restrictions || jest.fn(() => outRestrictions.join(",")),
    in_restrictions: rest.in_restrictions || jest.fn(() => inRestrictions.join(",")),
    iterate_inventory: jest.fn((cb: (owner: ClientObject, item: ClientObject) => void, owner: ClientObject) => {
      for (const [, item] of inventoryMap) {
        cb(owner, item);
      }
    }),
    position: rest.position || jest.fn(() => objectPosition),
    remove_home: rest.remove_home || jest.fn(),
    remove_restrictions:
      rest.add_restrictions ||
      jest.fn((outRemove: string, inRemove: string) => {
        outRemove
          .split(",")
          .map((it) => it.trim())
          .forEach((it) => {
            const index: number = outRestrictions.indexOf(it);

            if (index !== -1) {
              outRestrictions.splice(index, 1);
            }
          });
        inRemove
          .split(",")
          .map((it) => it.trim())
          .forEach((it) => {
            const index: number = inRestrictions.indexOf(it);

            if (index !== -1) {
              inRestrictions.splice(index, 1);
            }
          });
      }),
    section: section || jest.fn(() => sectionOverride),
    set_body_state: rest.set_body_state || jest.fn(),
    set_callback:
      rest.set_callback ||
      jest.fn(
        (id: TCallback, callback: AnyContextualCallable, context: AnyObject) => (callbacks[id] = callback.bind(context))
      ),
    set_mental_state: rest.set_mental_state || jest.fn(),
    set_home: rest.set_home || jest.fn(),
    set_invisible: rest.set_invisible || jest.fn(),
    sight_params:
      rest.sight_params ||
      jest.fn(() => {
        const params: MockSightParameters = new MockSightParameters();

        params.m_object = gameObject as ClientObject;
        params.m_sight_type = sight;
        params.m_vector = gameObject.direction();

        return params;
      }),
    set_sight: rest.set_sight || jest.fn((nextSight: TSightType) => (sight = nextSight)),
    set_actor_position:
      rest.set_actor_position ||
      jest.fn((it: Vector) => {
        objectPosition = it;
      }),
    set_actor_direction:
      rest.set_actor_direction ||
      jest.fn((it: number) => {
        objectDirection = objectDirection.set(it, objectDirection.y, objectDirection.z);
      }),
    spawn_ini: rest.spawn_ini || jest.fn(() => spawnIni),
    special_danger_move,
    target_body_state:
      rest.target_body_state ||
      jest.fn(() => {
        return MockMove.standing;
      }),
    transfer_money: rest.transfer_money || jest.fn(),
    transfer_item:
      transfer_item ||
      jest.fn((item: ClientObject, to: ClientObject) => {
        for (const [key, it] of inventoryMap) {
          if (it === item) {
            inventoryMap.delete(key);
          }
        }
      }),
    weapon_unstrapped,
  };

  CLIENT_SIDE_REGISTRY[gameObject.id()] = gameObject as ClientObject;

  return gameObject as ClientObject;
}
