import { jest } from "@jest/globals";

import { ACTOR_ID } from "@/engine/lib/constants/ids";
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
  TName,
  TNumberId,
  TSection,
  TSightType,
  Vector,
} from "@/engine/lib/types";
import {
  MockActionPlanner,
  mockDefaultActionPlanner,
  MockMove,
  MockSightParameters,
} from "@/fixtures/xray/mocks/actions";
import { mockIniFile } from "@/fixtures/xray/mocks/ini";
import { CLIENT_SIDE_REGISTRY, mockRelationRegistryInterface } from "@/fixtures/xray/mocks/interface";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

let ID_COUNTER: TNumberId = 1000;

/**
 * Mock client game object.
 * It is defined as script_object in c++ and wraps all script objects currently online.
 */
export function mockClientGameObject({
  animation_count = jest.fn(() => 0),
  bleeding = 0,
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
  health = 1,
  id,
  idOverride = ID_COUNTER++,
  infoPortions = [],
  inventory = [],
  is_talking = jest.fn(() => false),
  money,
  motivation_action_manager,
  name,
  object,
  radiation = 0,
  section,
  sectionOverride = "section",
  special_danger_move = jest.fn(() => true),
  transfer_item,
  weapon_unstrapped = jest.fn(() => false),
  ...rest
}: Partial<
  ClientObject & {
    idOverride?: TNumberId;
    sectionOverride?: TSection;
    infoPortions?: Array<TName>;
    inventory: Array<[TSection | TNumberId, ClientObject]>;
  }
> = {}): ClientObject {
  const internalInfos: Array<string> = [...infoPortions];
  const inventoryMap: Map<string | number, ClientObject> = new Map(inventory);

  let isInvulnerable: boolean = false;
  let objectPosition: Vector = MockVector.mock(0.25, 0.25, 0.25);
  const objectCenter: Vector = MockVector.mock(0.15, 0.15, 0.15);
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
    accessible: rest.accessible ?? jest.fn(() => true),
    active_item: rest.active_item ?? jest.fn(() => null),
    activate_slot: rest.activate_slot ?? jest.fn(),
    add_animation: rest.add_animation ?? jest.fn(),
    animation_count,
    animation_slot: rest.animation_slot ?? jest.fn(() => 1),
    alive: rest.alive ?? jest.fn(() => true),
    accessible_nearest: rest.accessible_nearest ?? jest.fn(() => 15326),
    active_slot: rest.active_slot ?? jest.fn(() => 3),
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
    best_danger: rest.best_danger ?? jest.fn(() => null),
    bind_object: rest.bind_object ?? jest.fn(),
    bleeding,
    buy_condition: rest.buy_condition ?? jest.fn(),
    buy_supplies: rest.buy_supplies ?? jest.fn(),
    buy_item_condition_factor: rest.buy_item_condition_factor ?? jest.fn(),
    can_select_weapon: rest.can_select_weapon ?? jest.fn(),
    center: rest.center ?? jest.fn(() => objectCenter),
    change_team: rest.change_team ?? jest.fn(),
    character_community: rest.character_community ?? jest.fn(() => "stalker"),
    character_icon,
    clsid,
    clear_animations: rest.clear_animations ?? jest.fn(),
    command: rest.command ?? jest.fn(),
    critically_wounded: rest.critically_wounded ?? jest.fn(() => false),
    debug_planner: rest.debug_planner ?? jest.fn(),
    direction: rest.direction ?? jest.fn(() => objectDirection),
    disable_hit_marks: rest.disable_hit_marks ?? jest.fn(),
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
    disable_talk: rest.disable_talk ?? jest.fn(),
    disable_trade: rest.disable_trade ?? jest.fn(),
    drop_item:
      rest.drop_item ||
      jest.fn((it: ClientObject) => {
        if (inventoryMap.get(it.section())) {
          inventoryMap.delete(it.section());
        }
      }),
    enable_night_vision: rest.enable_night_vision ?? jest.fn(),
    enable_trade: rest.enable_trade ?? jest.fn(),
    force_set_goodwill: rest.force_set_goodwill ?? jest.fn(),
    game_vertex_id,
    general_goodwill:
      rest.general_goodwill ||
      jest.fn((to: ClientObject) => {
        return mockRelationRegistryInterface.get_general_goodwill_between(id ? id() : idOverride, to.id());
      }),
    get_visual_name: rest.get_visual_name ?? jest.fn(() => "some_stalker_visual"),
    get_campfire: rest.get_campfire ?? jest.fn(() => null),
    get_current_point_index: rest.get_current_point_index ?? jest.fn(() => null),
    get_enemy: rest.get_enemy ?? jest.fn(() => null),
    get_script: rest.get_script ?? jest.fn(() => false),
    get_script_name: rest.get_script_name ?? jest.fn(() => null),
    give_game_news,
    give_info_portion:
      give_info_portion ||
      jest.fn((it: string) => {
        internalInfos.push(it);

        return false;
      }),
    give_money: give_money ?? jest.fn((value: number) => (objectMoney += value)),
    give_talk_message2,
    give_task,
    group: rest.group ?? jest.fn(),
    has_info: has_info ?? jest.fn((it: string) => internalInfos.includes(it)),
    health,
    hit: rest.hit ?? jest.fn(),
    id: id ?? jest.fn(() => idOverride),
    ignore_monster_threshold: rest.ignore_monster_threshold ?? jest.fn(),
    infoPortions,
    inside: rest.inside ?? jest.fn(() => false),
    inventory: inventoryMap,
    in_smart_cover: rest.in_smart_cover ?? jest.fn(() => false),
    is_talking,
    is_there_items_to_pickup: rest.is_there_items_to_pickup ?? jest.fn(() => false),
    level_vertex_id: rest.level_vertex_id ?? jest.fn(() => 255),
    max_ignore_monster_distance: rest.max_ignore_monster_distance ?? jest.fn(),
    money: money ?? jest.fn(() => objectMoney),
    motivation_action_manager:
      motivation_action_manager ||
      jest.fn(function (this: ClientObject) {
        (actionManager as unknown as MockActionPlanner).object = this;

        return actionManager;
      }),
    movement_enabled: rest.movement_enabled ?? jest.fn(),
    name: name ?? jest.fn(() => `${sectionOverride}_${idOverride}`),
    night_vision_enabled: rest.night_vision_enabled ?? jest.fn(),
    object:
      object ||
      jest.fn((key: string | number) => {
        if (typeof key === "string") {
          return (
            [...inventoryMap.values()].find((it) => {
              return it.section() === key;
            }) ?? null
          );
        }

        return inventoryMap.get(key) ?? null;
      }),
    out_restrictions: rest.out_restrictions ?? jest.fn(() => outRestrictions.join(",")),
    in_restrictions: rest.in_restrictions ?? jest.fn(() => inRestrictions.join(",")),
    invulnerable:
      rest.invulnerable ||
      jest.fn((nextInvulnerable?: boolean) => {
        if (typeof nextInvulnerable === "boolean") {
          isInvulnerable = nextInvulnerable;
        } else {
          return isInvulnerable;
        }
      }),
    iterate_inventory: jest.fn(
      (cb: (owner: ClientObject, item: ClientObject) => void | boolean, owner: ClientObject) => {
        for (const [, item] of inventoryMap) {
          if (cb(owner, item)) {
            break;
          }
        }
      }
    ),
    parent: rest.parent ?? jest.fn(() => null),
    position: rest.position ?? jest.fn(() => objectPosition),
    radiation,
    relation:
      rest.relation ||
      jest.fn(() => {
        return 0;
      }),
    remove_home: rest.remove_home ?? jest.fn(),
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
    restore_ignore_monster_threshold: rest.restore_max_ignore_monster_distance ?? jest.fn(),
    restore_max_ignore_monster_distance: rest.restore_max_ignore_monster_distance ?? jest.fn(),
    set_desired_direction: rest.set_desired_direction ?? jest.fn(),
    set_desired_position: rest.set_desired_position ?? jest.fn(),
    set_start_dialog: rest.set_start_dialog ?? jest.fn(),
    set_tip_text: rest.set_tip_text ?? jest.fn(),
    sell_condition: rest.sell_condition ?? jest.fn(),
    script: rest.script ?? jest.fn(),
    section: section ?? jest.fn(() => sectionOverride),
    see: rest.see ?? jest.fn(() => false),
    set_body_state: rest.set_body_state ?? jest.fn(),
    set_callback:
      rest.set_callback ||
      jest.fn((id: TCallback, callback: AnyContextualCallable, context: AnyObject) => {
        if (callback) {
          callbacks[id] = callback.bind(context);
        } else {
          delete callbacks[id];
        }
      }),
    set_condition: rest.set_condition ?? jest.fn(),
    set_manual_invisibility: rest.set_manual_invisibility ?? jest.fn(),
    set_mental_state: rest.set_mental_state ?? jest.fn(),
    set_movement_type: rest.set_movement_type ?? jest.fn(),
    set_nonscript_usable: rest.set_nonscript_usable ?? jest.fn(),
    set_home: rest.set_home ?? jest.fn(),
    set_invisible: rest.set_invisible ?? jest.fn(),
    set_path_type: rest.set_path_type ?? jest.fn(),
    set_relation: rest.set_relation ?? jest.fn(),
    set_sound_mask: rest.set_sound_mask ?? jest.fn(),
    set_sympathy: rest.set_sympathy ?? jest.fn(),
    set_visual_name: rest.set_visual_name ?? jest.fn(),
    sight_params:
      rest.sight_params ||
      jest.fn(() => {
        const params: MockSightParameters = new MockSightParameters();

        params.m_object = gameObject as ClientObject;
        params.m_sight_type = sight;
        params.m_vector = gameObject.direction();

        return params;
      }),
    set_dest_level_vertex_id: rest.set_dest_level_vertex_id ?? jest.fn(),
    set_sight: rest.set_sight ?? jest.fn((nextSight: TSightType) => (sight = nextSight)),
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
    set_community_goodwill: rest.set_community_goodwill ?? jest.fn(),
    spawn_ini: rest.spawn_ini ?? jest.fn(() => spawnIni),
    stop_talk: rest.stop_talk ?? jest.fn(),
    squad: rest.squad ?? jest.fn(() => 150),
    special_danger_move,
    take_items_enabled: rest.take_items_enabled ?? jest.fn(),
    target_body_state:
      rest.target_body_state ||
      jest.fn(() => {
        return MockMove.standing;
      }),
    target_movement_type:
      rest.target_movement_type ||
      jest.fn(() => {
        return MockMove.standing;
      }),
    team: rest.team ?? jest.fn(() => 140),
    transfer_money: rest.transfer_money ?? jest.fn(),
    transfer_item:
      transfer_item ||
      jest.fn((item: ClientObject, to: ClientObject) => {
        const targetInventory: Map<string | number, ClientObject> = (to as AnyObject).inventory;

        for (const [key, it] of inventoryMap) {
          if (it === item) {
            inventoryMap.delete(key);
            targetInventory.set(it.section(), it);
            break;
          }
        }
      }),
    weapon_unstrapped,
    weapon_strapped: rest.weapon_strapped ?? jest.fn(() => true),
    wounded: rest.wounded ?? jest.fn(),
  };

  CLIENT_SIDE_REGISTRY.set(gameObject.id(), gameObject as ClientObject);

  return gameObject as ClientObject;
}

/**
 * Mock client game object.
 */
export function mockActorClientGameObject(
  base: Partial<
    ClientObject & {
      idOverride?: TNumberId;
      sectionOverride?: TSection;
      infoPortions?: Array<TName>;
      inventory: Array<[TSection | TNumberId, ClientObject]>;
    }
  > = {}
): ClientObject {
  return mockClientGameObject({
    ...base,
    idOverride: ACTOR_ID,
    get_visual_name: base.get_visual_name ?? jest.fn(() => "some_actor_visual" as any),
  });
}
