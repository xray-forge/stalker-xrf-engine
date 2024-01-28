import { jest } from "@jest/globals";
import { CHelicopter } from "xray16";

import { ACTOR_ID } from "@/engine/lib/constants/ids";
import {
  AnyArgs,
  AnyCallable,
  AnyContextualCallable,
  AnyObject,
  GameObject,
  IniFile,
  Optional,
  PartialRecord,
  ServerObject,
  TCallback,
  TClassId,
  TCount,
  TIndex,
  TName,
  TNumberId,
  TRate,
  TSection,
  TSightType,
  Vector,
} from "@/engine/lib/types";
import { MockLuaTable } from "@/fixtures/lua";
import {
  MockActionPlanner,
  MockAnim,
  mockDefaultActionPlanner,
  MockMove,
  MockSightParameters,
} from "@/fixtures/xray/mocks/actions";
import { mockClsid } from "@/fixtures/xray/mocks/constants/clsid.mock";
import { MockIniFile } from "@/fixtures/xray/mocks/ini";
import { mockRelationRegistryInterface } from "@/fixtures/xray/mocks/interface";
import { mockConfig } from "@/fixtures/xray/mocks/MockConfig";
import { MockCHelicopter } from "@/fixtures/xray/mocks/objects/CHelicopter.mock";
import { MockAlifeObject } from "@/fixtures/xray/mocks/objects/server/cse_alife_object.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

export interface IMockGameObjectConfig {
  alive?: boolean;
  bleeding?: TRate;
  characterRank?: TCount;
  clsid?: TNumberId;
  community?: TName;
  health?: TRate;
  id?: TNumberId;
  inRestrictions?: string;
  infoPortions?: Array<TName>;
  inventory?: Array<[TSection | TNumberId, GameObject]>;
  money?: TCount;
  name?: TName;
  position?: Vector;
  levelVertexId?: TNumberId;
  gameVertexId?: TNumberId;
  outRestrictions?: string;
  radiation?: TRate;
  rank?: TCount;
  section?: TSection;
  spawnIni?: Optional<IniFile>;
  upgrades?: Array<TSection>;
}

/**
 * Abstract game object mock.
 */
export class MockGameObject {
  public static REGISTRY: MockLuaTable<TNumberId, GameObject> = MockLuaTable.create();

  public static mock(config: IMockGameObjectConfig = {}): GameObject {
    return new MockGameObject(config).asGameObject();
  }

  public static mockInSimulator(config: IMockGameObjectConfig = {}): [GameObject, ServerObject] {
    const object: MockGameObject = new MockGameObject(config);
    const serverObject: ServerObject = MockAlifeObject.mockNew({ section: object.section(), id: object.id() });

    return [object.asGameObject(), serverObject];
  }

  public static mockHelicopter(config: IMockGameObjectConfig = {}): GameObject {
    const object: MockGameObject = new MockGameObject(config);
    const helicopter: CHelicopter = MockCHelicopter.mock();

    jest.spyOn(object, "clsid").mockImplementation(() => mockClsid.helicopter as TClassId);
    jest.spyOn(object, "get_helicopter").mockImplementation(() => helicopter);

    return object.asGameObject();
  }

  public static mockStalker(base: IMockGameObjectConfig = {}): GameObject {
    const object: MockGameObject = new MockGameObject({
      ...base,
      clsid: base.clsid ?? mockClsid.script_stalker,
      community: base.community ?? "stalker",
    });

    return object.asGameObject();
  }
  public static mockWithClassId(clsid: TNumberId): GameObject {
    return new MockGameObject({ clsid }).asGameObject();
  }

  public static mockWithSection(section: TSection): GameObject {
    return new MockGameObject({ section }).asGameObject();
  }

  public static mockActor(config: IMockGameObjectConfig = {}): GameObject {
    const object: MockGameObject = new MockGameObject({ ...config, id: ACTOR_ID });

    object.objectVisual = "some_actor_visual";

    return object.asGameObject();
  }

  public static callCallback(object: GameObject, id: TCallback, ...args: AnyArgs): void {
    (object as unknown as MockGameObject).callCallback(id, ...args);
  }

  public static asMock(object: GameObject): MockGameObject {
    return object as unknown as MockGameObject;
  }

  public isInvulnerable: boolean = false;

  public bleeding: TRate;
  public callbacks: PartialRecord<TCallback, AnyCallable> = {};
  public health: TRate;
  public radiation: TRate;
  public sight: TSightType = MockSightParameters.eSightTypeDummy;

  public objectActionManager: MockActionPlanner = mockDefaultActionPlanner() as unknown as MockActionPlanner;
  public objectAlive: boolean;
  public objectCenter: Vector = MockVector.mock(0.15, 0.15, 0.15);
  public objectCharacterRank: Optional<TCount>;
  public objectClsid: TClassId;
  public objectCommunity: string;
  public objectDirection: Vector = MockVector.mock(1, 1, 1);
  public objectGameVertexId: TNumberId;
  public objectId: TNumberId;
  public objectInRestrictions: Array<string>;
  public objectInfoPortions: Array<string>;
  public objectInventory: Map<string | number, GameObject>;
  public objectLevelVertexId: TNumberId;
  public objectMoney: TCount;
  public objectName: TName;
  public objectOutRestrictions: Array<string>;
  public objectPosition: Vector;
  public objectRank: TCount;
  public objectSection: TSection;
  public objectSpawnIni: Optional<IniFile>;
  public objectUpgradesSet: Set<string>;
  public objectVisual: TSection = "object_visual_name";

  public constructor(config: IMockGameObjectConfig = {}) {
    this.objectAlive = config.alive ?? true;
    this.objectClsid = (config.clsid ?? -1) as TClassId;
    this.objectCommunity = (config.community ?? "none") as string;
    this.objectId = config.id ?? mockConfig.ID_COUNTER++;
    this.objectInRestrictions = (config.inRestrictions ?? "a,b,c").split(",");
    this.objectInfoPortions = config.infoPortions ?? [];
    this.objectInventory = new Map(config.inventory ?? []);
    this.objectMoney = config.money ?? 0;
    this.objectOutRestrictions = (config.outRestrictions ?? "d,e,f").split(",");
    this.objectCharacterRank = config.characterRank ?? null;
    this.objectPosition = config.position ?? MockVector.mock(0.25, 0.25, 0.25);
    this.objectRank = config.rank ?? 0;
    this.objectSection = config.section ?? "section";
    this.objectSpawnIni = config.spawnIni === undefined ? MockIniFile.mock("spawn.ini") : config.spawnIni;
    this.objectUpgradesSet = new Set(config.upgrades ?? []);

    this.objectName = config.name ?? `${this.objectSection}_${this.objectId}`;

    this.bleeding = config.bleeding ?? 0;
    this.radiation = config.radiation ?? 0;
    this.health = config.health ?? 1;

    this.objectLevelVertexId = config.levelVertexId ?? 255;
    this.objectGameVertexId = config.gameVertexId ?? 512;

    MockGameObject.REGISTRY.set(this.id(), this.asGameObject());
  }

  public animation_count = jest.fn(() => 0);

  public accessible = jest.fn(() => true);

  public action = jest.fn(() => null);

  public active_item = jest.fn(() => null);

  public activate_slot = jest.fn();

  public add_animation = jest.fn();

  public add_upgrade = jest.fn((it: string) => {
    this.objectUpgradesSet.add(it);
  });

  public animation_slot = jest.fn(() => 1);

  public alive = jest.fn(() => this.objectAlive);

  public accessible_nearest = jest.fn(() => 15326);

  public active_detector = jest.fn(() => null);

  public active_slot = jest.fn(() => 3);

  public add_restrictions = jest.fn((outAdd: string, inAdd: string) => {
    outAdd
      .split(",")
      .map((it) => it.trim())
      .filter(Boolean)
      .forEach((it) => this.objectOutRestrictions.push(it));
    inAdd
      .split(",")
      .map((it) => it.trim())
      .filter(Boolean)
      .forEach((it) => this.objectInRestrictions.push(it));
  });

  public apply_loophole_direction_distance = jest.fn();

  public best_enemy = jest.fn(() => null);

  public best_danger = jest.fn(() => null);

  public best_item = jest.fn(() => null);

  public best_weapon = jest.fn(() => null);

  public bind_object = jest.fn();

  public buy_condition = jest.fn();

  public buy_supplies = jest.fn();

  public buy_item_condition_factor = jest.fn();

  public callCallback = jest.fn((id: TCallback, ...args: AnyArgs) => this.callbacks[id]!(...args));

  public can_select_weapon = jest.fn();

  public center = jest.fn(() => this.objectCenter);

  public change_team = jest.fn();

  public change_character_reputation = jest.fn();

  public character_community = jest.fn(() => this.objectCommunity);

  public character_icon = jest.fn(() => "test_character_icon") as <T>() => T;

  public character_rank = jest.fn(() => this.objectCharacterRank);

  public clear_animations = jest.fn();

  public clear_callbacks = jest.fn(() => {
    Object.keys(this.callbacks).forEach((it) => delete this.callbacks[it as unknown as TCallback]);
  });

  public clsid = jest.fn(() => this.objectClsid);

  public command = jest.fn();

  public community = jest.fn(() => this.objectCommunity);

  public critically_wounded = jest.fn(() => false);

  public debug_planner = jest.fn();

  public direction = jest.fn(() => this.objectDirection);

  public disable_anomaly = jest.fn();

  public disable_hit_marks = jest.fn();

  public disable_info_portion = jest.fn((it: string) => {
    const index: TIndex = this.objectInfoPortions.indexOf(it);

    if (index >= 0) {
      this.objectInfoPortions.splice(index, 1);

      return true;
    } else {
      return false;
    }
  });

  public disable_talk = jest.fn();

  public disable_trade = jest.fn();

  public drop_item = jest.fn((it: GameObject) => {
    if (this.objectInventory.get(it.section())) {
      this.objectInventory.delete(it.section());
    }
  });

  public drop_item_and_teleport = jest.fn();

  public enable_anomaly = jest.fn();

  public enable_attachable_item = jest.fn();

  public enable_level_changer = jest.fn();

  public enable_night_vision = jest.fn();

  public enable_talk = jest.fn();

  public enable_trade = jest.fn();

  public explode = jest.fn();

  public force_set_goodwill = jest.fn();

  public fov = jest.fn(() => 75);

  public game_vertex_id = jest.fn(() => this.objectGameVertexId);

  public general_goodwill = jest.fn((to: GameObject) => {
    return mockRelationRegistryInterface.get_general_goodwill_between(this.id(), to.id());
  });

  public get_artefact = jest.fn(() => null);

  public get_car = jest.fn(() => null);

  public get_hanging_lamp = jest.fn(() => null);

  public get_visual_name = jest.fn(() => this.objectVisual);

  public get_campfire = jest.fn(() => null);

  public get_current_point_index = jest.fn(() => null);

  public get_enemy = jest.fn(() => null);

  public get_monster_hit_info = jest.fn(() => null);

  public get_movement_speed = jest.fn(() => MockVector.mock(0, 0, 0));

  public get_helicopter = jest.fn(() => null as Optional<CHelicopter>);

  public get_physics_object = jest.fn(() => null);

  public get_physics_shell = jest.fn(() => null);

  public get_script = jest.fn(() => false);

  public get_script_name = jest.fn(() => null);

  public get_task = jest.fn(() => null);

  public give_info_portion = jest.fn((it: string) => {
    this.objectInfoPortions.push(it);

    return false;
  });

  public give_game_news = jest.fn();

  public give_money = jest.fn((value: number) => (this.objectMoney += value));

  public give_talk_message2 = jest.fn();

  public give_task = jest.fn();

  public group = jest.fn();

  public group_throw_time_interval = jest.fn();

  public has_info = jest.fn((it: string) => this.objectInfoPortions.includes(it));

  public hit = jest.fn();

  public id = jest.fn(() => this.objectId);

  public idle_max_time = jest.fn();

  public idle_min_time = jest.fn();

  public ignore_monster_threshold = jest.fn();

  public inside = jest.fn(() => false);

  public in_smart_cover = jest.fn(() => false);

  public is_talking = jest.fn(() => false);

  public is_talk_enabled = jest.fn(() => false);

  public is_there_items_to_pickup = jest.fn(() => false);

  public jump = jest.fn();

  public kill = jest.fn();

  public level_vertex_id = jest.fn(() => this.objectLevelVertexId);

  public location_on_path = jest.fn(() => null);

  public lookout_max_time = jest.fn();

  public lookout_min_time = jest.fn();

  public make_item_active = jest.fn();

  public make_object_visible_somewhen = jest.fn();

  public max_ignore_monster_distance = jest.fn();

  public money = jest.fn(() => this.objectMoney);

  public motivation_action_manager = jest.fn(() => {
    this.objectActionManager.object = this.asGameObject();

    return this.objectActionManager;
  });

  public movement_enabled = jest.fn();

  public name = jest.fn(() => this.objectName);

  public night_vision_enabled = jest.fn();

  public object = jest.fn((key: string | number) => {
    if (typeof key === "string") {
      return (
        [...this.objectInventory.values()].find((it) => {
          return it.section() === key;
        }) ?? null
      );
    }

    return this.objectInventory.get(key) ?? null;
  });

  public out_restrictions = jest.fn(() => this.objectOutRestrictions.join(","));

  public in_current_loophole_fov = jest.fn(() => false);

  public in_restrictions = jest.fn(() => this.objectInRestrictions.join(","));

  public inactualize_patrol_path = jest.fn();

  public invulnerable = jest.fn((nextInvulnerable?: boolean) => {
    if (typeof nextInvulnerable === "boolean") {
      this.isInvulnerable = nextInvulnerable;
    } else {
      return this.isInvulnerable;
    }
  });

  public item_in_slot = jest.fn(() => null);

  public iterate_inventory = jest.fn(
    (cb: (owner: GameObject, item: GameObject) => void | boolean, owner: GameObject) => {
      for (const [, item] of this.objectInventory) {
        if (cb(owner, item)) {
          break;
        }
      }
    }
  );

  public iterate_installed_upgrades = jest.fn((cb: (upgrade: TSection, item: GameObject) => void | boolean) => {
    for (const upgrade of this.objectUpgradesSet) {
      cb(upgrade, this.asGameObject());
    }
  });

  public patrol_path_make_inactual = jest.fn(() => null);

  public parent = jest.fn(() => null);

  public poltergeist_set_actor_ignore = jest.fn();

  public position = jest.fn(() => this.objectPosition);

  public play_cycle = jest.fn();

  public rank = jest.fn(() => this.objectRank);

  public relation = jest.fn(() => {
    return 0;
  });

  public remove_home = jest.fn();

  public remove_restrictions = jest.fn((outRemove: string, inRemove: string) => {
    outRemove
      .split(",")
      .map((it) => it.trim())
      .forEach((it) => {
        const index: number = this.objectOutRestrictions.indexOf(it);

        if (index !== -1) {
          this.objectOutRestrictions.splice(index, 1);
        }
      });
    inRemove
      .split(",")
      .map((it) => it.trim())
      .forEach((it) => {
        const index: number = this.objectInRestrictions.indexOf(it);

        if (index !== -1) {
          this.objectInRestrictions.splice(index, 1);
        }
      });
  });

  public restore_max_ignore_monster_distance = jest.fn();

  public restore_ignore_monster_threshold = jest.fn();

  public script = jest.fn();

  public section = jest.fn(() => this.objectSection);

  public see = jest.fn(() => false);

  public sell_condition = jest.fn();

  public set_active_task = jest.fn();

  public set_actor_position = jest.fn((it: Vector) => {
    this.objectPosition = it;
  });

  public set_actor_direction = jest.fn((it: number) => {
    this.objectDirection = this.objectDirection.set(it, this.objectDirection.y, this.objectDirection.z);
  });

  public set_body_state = jest.fn();

  public set_callback = jest.fn((id: TCallback, callback: AnyContextualCallable, context: AnyObject) => {
    if (callback) {
      this.callbacks[id] = callback.bind(context);
    } else {
      delete this.callbacks[id];
    }
  });

  public set_community_goodwill = jest.fn();

  public set_condition = jest.fn();

  public set_const_force = jest.fn();

  public set_desired_direction = jest.fn();

  public set_desired_position = jest.fn();

  public set_dest_game_vertex_id = jest.fn();

  public set_dest_level_vertex_id = jest.fn();

  public set_dest_loophole = jest.fn();

  public set_dest_smart_cover = jest.fn();

  public set_detail_path_type = jest.fn();

  public set_fastcall = jest.fn();

  public set_home = jest.fn();

  public set_invisible = jest.fn();

  public set_item = jest.fn();

  public set_level_changer_invitation = jest.fn();

  public set_manual_invisibility = jest.fn();

  public set_mental_state = jest.fn();

  public set_movement_selection_type = jest.fn();

  public set_movement_type = jest.fn();

  public set_nonscript_usable = jest.fn();

  public set_npc_position = jest.fn();

  public set_path_type = jest.fn();

  public set_patrol_extrapolate_callback = jest.fn();

  public set_patrol_path = jest.fn();

  public set_relation = jest.fn();

  public set_sight = jest.fn((nextSight: TSightType) => (this.sight = nextSight));

  public set_smart_cover_target = jest.fn();

  public set_smart_cover_target_default = jest.fn();

  public set_smart_cover_target_fire = jest.fn();

  public set_smart_cover_target_fire_no_lookout = jest.fn();

  public set_smart_cover_target_idle = jest.fn();

  public set_smart_cover_target_lookout = jest.fn();

  public set_smart_cover_target_selector = jest.fn();

  public set_sound_mask = jest.fn();

  public set_start_dialog = jest.fn();

  public set_sympathy = jest.fn();

  public set_tip_text = jest.fn();

  public set_visual_name = jest.fn();

  public sight_params = jest.fn(() => {
    const params: MockSightParameters = new MockSightParameters();

    params.m_object = this as unknown as GameObject;
    params.m_sight_type = this.sight;
    params.m_vector = this.direction();

    return params;
  });

  public spawn_ini = jest.fn(() => this.objectSpawnIni);

  public special_danger_move = jest.fn(() => true);

  public squad = jest.fn(() => 150);

  public start_particles = jest.fn();

  public stop_particles = jest.fn();

  public stop_talk = jest.fn();

  public take_items_enabled = jest.fn();

  public target_body_state = jest.fn(() => {
    return MockMove.standing;
  });

  public target_mental_state = jest.fn(() => {
    return MockAnim.free;
  });

  public target_movement_type = jest.fn(() => MockMove.standing);

  public team = jest.fn(() => 140);

  public transfer_money = jest.fn();

  public transfer_item = jest.fn((item: MockGameObject, to: MockGameObject) => {
    const targetInventory: Map<string | number, GameObject> = to.objectInventory;

    for (const [key, it] of this.objectInventory) {
      if (it === item.asGameObject()) {
        this.objectInventory.delete(key);
        targetInventory.set(it.section(), it);
        break;
      }
    }
  });

  public use_smart_covers_only = jest.fn();

  public weapon_strapped = jest.fn(() => true);

  public weapon_unstrapped = jest.fn(() => false);

  public wounded = jest.fn();

  public asGameObject(): GameObject {
    return this as unknown as GameObject;
  }
}
