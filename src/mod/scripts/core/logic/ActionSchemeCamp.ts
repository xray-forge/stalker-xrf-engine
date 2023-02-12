import {
  level,
  patrol,
  stalker_ids,
  time_global,
  vector,
  world_property,
  XR_CZoneCampfire,
  XR_game_object,
  XR_ini_file,
  XR_patrol,
  XR_vector,
} from "xray16";

import { communities } from "@/mod/globals/communities";
import { MAX_UNSIGNED_32_BIT } from "@/mod/globals/memory";
import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { TScheme, TSection } from "@/mod/lib/types/configuration";
import { action_ids } from "@/mod/scripts/core/actions_id";
import { campfire_table, IStoredObject, kamp_stalkers, kamps } from "@/mod/scripts/core/db";
import { evaluators_id } from "@/mod/scripts/core/evaluators_id";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { ActionGoPosition } from "@/mod/scripts/core/logic/actions/ActionGoPosition";
import { ActionWait, IActionWait } from "@/mod/scripts/core/logic/actions/ActionWait";
import { EvaluatorCampEnd } from "@/mod/scripts/core/logic/evaluators/EvaluatorCampEnd";
import { EvaluatorOnPosition } from "@/mod/scripts/core/logic/evaluators/EvaluatorOnPosition";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { get_sound_manager, SoundManager } from "@/mod/scripts/core/sound/SoundManager";
import { getCharacterCommunity, stopPlaySound } from "@/mod/scripts/utils/alife";
import { getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { addCommonPrecondition } from "@/mod/scripts/utils/scheme";

const logger: LuaLogger = new LuaLogger("ActionSchemeCamp");

export class ActionSchemeCamp extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "kamp";

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    const operators = {
      go_position: action_ids.stohe_kamp_base + 1,
      wait: action_ids.stohe_kamp_base + 3,
    };
    const properties = {
      kamp_end: evaluators_id.stohe_kamp_base + 1,
      on_position: evaluators_id.stohe_kamp_base + 2,
      contact: evaluators_id.stohe_meet_base + 1,
    };

    const manager = object.motivation_action_manager();

    manager.add_evaluator(
      properties.kamp_end,
      create_xr_class_instance(EvaluatorCampEnd, EvaluatorCampEnd.__name, storage, EvaluatorCampEnd.__name)
    );
    manager.add_evaluator(
      properties.on_position,
      create_xr_class_instance(EvaluatorOnPosition, EvaluatorOnPosition.__name, storage, EvaluatorOnPosition.__name)
    );

    const actionWait: IActionWait = create_xr_class_instance(ActionWait, object.name(), ActionWait.__name, storage);

    actionWait.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionWait.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionWait.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionWait.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    addCommonPrecondition(actionWait);
    actionWait.add_precondition(new world_property(properties.on_position, true));
    actionWait.add_effect(new world_property(properties.kamp_end, true));
    manager.add_action(operators.wait, actionWait);
    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(object, storage, actionWait);

    const actionGoPosition = create_xr_class_instance(
      ActionGoPosition,
      object.name(),
      ActionGoPosition.__name,
      storage
    );

    actionGoPosition.add_precondition(new world_property(stalker_ids.property_alive, true));
    actionGoPosition.add_precondition(new world_property(stalker_ids.property_danger, false));
    actionGoPosition.add_precondition(new world_property(stalker_ids.property_enemy, false));
    actionGoPosition.add_precondition(new world_property(stalker_ids.property_anomaly, false));
    addCommonPrecondition(actionGoPosition);
    actionGoPosition.add_precondition(new world_property(properties.on_position, false));
    actionGoPosition.add_effect(new world_property(properties.on_position, true));
    manager.add_action(operators.go_position, actionGoPosition);

    manager.action(action_ids.alife).add_precondition(new world_property(properties.kamp_end, true));
  }

  public static set_scheme(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: TScheme,
    section: TSection,
    gulag_name: string
  ): void {
    const st: IStoredObject = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(
      npc,
      ini,
      scheme,
      section
    );

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, npc);

    st.center_point = getConfigString(ini, section, "center_point", npc, true, gulag_name);
    st.radius = getConfigNumber(ini, section, "radius", npc, false, 2);

    if (kamps.get(st.center_point) === null) {
      kamps.set(st.center_point, new CampManager(st.center_point));
    }

    kamps.get(st.center_point).addNpc(npc);
    st.pos_vertex = null;

    st.def_state_moving = getConfigString(ini, section, "def_state_moving", npc, false, "", "walk");
  }
}

interface INpcDescriptor {
  name: string;
  begin: Optional<number>;
  state_idle?: Optional<number>;
  state_selected?: Optional<string>;
  new: Optional<boolean>;
  position: Optional<number>;
  current: Optional<unknown>;
  speak: number;
  need_sound_begin?: boolean;
  states: Record<string, Optional<boolean>>;
}

export class CampManager {
  public kamp_name: string;
  public patrol: XR_patrol;
  public position: LuaTable<number, { dir: XR_vector; used: Optional<number> }>;
  public npc: LuaTable<number, INpcDescriptor> = new LuaTable(); // todo: Better naming for list.
  public avail_state: LuaTable<string, { directed: LuaTable<number, string>; undirected: LuaTable<number, string> }>;
  public avail_sound: LuaTable<string, { directed: string; undirected: string }>;
  public timeout: LuaTable<string, { min: number; soundstart: boolean }>;
  public kamp_states: LuaTable<string, boolean> = new LuaTable();
  public trans_kamp: LuaTable<string, LuaTable<string, number>> = new LuaTable();
  public population: number;
  public kamp_state: string;
  public begin: Optional<number> = null;
  public director: Optional<number> = null;
  public censor: Optional<boolean> = null;
  public sound_manager: SoundManager;

  public constructor(path: string) {
    this.kamp_name = path;
    this.patrol = new patrol(path);

    this.position = [
      { dir: new vector().set(1, 0, 0), used: null },
      { dir: new vector().set(1, 0, 1), used: null },
      { dir: new vector().set(0, 0, 1), used: null },
      { dir: new vector().set(-1, 0, 1), used: null },
      { dir: new vector().set(-1, 0, 0), used: null },
      { dir: new vector().set(-1, 0, -1), used: null },
      { dir: new vector().set(0, 0, -1), used: null },
      { dir: new vector().set(1, 0, -1), used: null },
    ] as any;

    this.population = 0;
    this.kamp_state = "idle";

    // -- 0 ������� - ����� ������.
    // -- 1 ���� - ������ �����, � ������ ����� ������.
    // -- 2 ���� - ������ �����, � ������ ������ ������.
    /* --[[
        for k = 1, this.patrol:count() - 1 do
        // -- ���� ���� 1 ��� 2 ������ - �������� ������ ��� �������
        if this.patrol:flag(k,1) or
      this.patrol:flag(k,2)
      {
      // -- �������� ������ ��� �������
          for key,value in pairs(this.position) do
            dir = vector():sub(level.vertex_position(this.patrol:level_vertex_id(k)),
            level.vertex_position(this.center))
      if value.dir {
      yaw = yaw_degree(dir, value.dir)
      if yaw <=23 {
      // --'printf("KAMP node[%s], sector[%s,] yaw[%s]", k, key, yaw_degree(dir, value.dir))
      value.used = -1
      break
      }
      }
      }

      }

      // -- ���� ���� 1 ������ - ������� ����� ��� ������� � ����� ����
        if this.patrol:flag(k,1) {
      // -- ������� ����� ��� �������
          table.insert(this.position, {vertex = this.patrol:level_vertex_id(k)})
      }
      }
    ]]*/

    this.avail_state = {
      idle: {
        directed: [
          "wait",
          "sit",
          "sit_ass",
          "sit_knee",
          "eat_kolbasa",
          "eat_vodka",
          "eat_energy",
          "eat_bread",
          "trans",
        ],
      },
      pre_harmonica: {
        directed: ["wait_harmonica"],
        undirected: [
          "wait",
          "sit",
          "sit_ass",
          "sit_knee",
          "eat_kolbasa",
          "eat_vodka",
          "eat_energy",
          "eat_bread",
          "trans",
        ],
      },
      harmonica: {
        directed: ["play_harmonica"],
        undirected: [
          "wait",
          "sit",
          "sit_ass",
          "sit_knee",
          "eat_kolbasa",
          "eat_vodka",
          "eat_energy",
          "eat_bread",
          "trans",
        ],
      },
      post_harmonica: {
        directed: ["wait_harmonica"],
        undirected: [
          "wait",
          "sit",
          "sit_ass",
          "sit_knee",
          "eat_kolbasa",
          "eat_vodka",
          "eat_energy",
          "eat_bread",
          "trans",
        ],
      },
      pre_guitar: {
        directed: ["wait_guitar"],
        undirected: [
          "wait",
          "sit",
          "sit_ass",
          "sit_knee",
          "eat_kolbasa",
          "eat_vodka",
          "eat_energy",
          "eat_bread",
          "trans",
        ],
      },
      guitar: {
        directed: ["play_guitar"],
        undirected: [
          "wait",
          "sit",
          "sit_ass",
          "sit_knee",
          "eat_kolbasa",
          "eat_vodka",
          "eat_energy",
          "eat_bread",
          "trans",
        ],
      },
      post_guitar: {
        directed: ["wait_guitar"],
        undirected: [
          "wait",
          "sit",
          "sit_ass",
          "sit_knee",
          "eat_kolbasa",
          "eat_vodka",
          "eat_energy",
          "eat_bread",
          "trans",
        ],
      },
      story: {
        directed: ["declarate"],
        undirected: [
          "wait",
          "sit",
          "sit_ass",
          "sit_knee",
          "eat_kolbasa",
          "eat_vodka",
          "eat_energy",
          "eat_bread",
          "trans",
        ],
      },
    } as any;

    this.avail_sound = {
      idle: { directed: "idle" },
      pre_harmonica: { directed: "pre_harmonica", undirected: "" },
      harmonica: { directed: "", undirected: "" },
      post_harmonica: { directed: "", undirected: "reac_harmonica" },
      pre_guitar: { directed: "pre_guitar", undirected: "" },
      guitar: { directed: "", undirected: "" },
      post_guitar: { directed: "", undirected: "reac_guitar" },
      story: { directed: "", undirected: "" },
    } as any;

    this.timeout = {
      idle: { min: 30000 },
      pre_harmonica: { min: 3000 },
      harmonica: { min: 5000, soundstart: true },
      post_harmonica: { min: 3000 },
      pre_guitar: { min: 3000 },
      guitar: { min: 5000, soundstart: true },
      post_guitar: { min: 3000 },
      story: { min: 1000, soundstart: true },
    } as any;

    this.kamp_states = {
      idle: true,
      pre_harmonica: false,
      harmonica: false,
      post_harmonica: false,
      pre_guitar: false,
      guitar: false,
      post_guitar: false,
      story: true,
    } as any;

    this.trans_kamp = {
      idle: { idle: 0, pre_harmonica: 0, pre_guitar: 50, story: 50 },
      pre_harmonica: { harmonica: 100 },
      harmonica: { post_harmonica: 100 },
      post_harmonica: { idle: 70, harmonica: 30 },
      pre_guitar: { guitar: 100 },
      guitar: { post_guitar: 100 },
      post_guitar: { idle: 70, guitar: 30 },
      story: { idle: 100 },
    } as any;

    this.director = null;
    this.sound_manager = get_sound_manager("kamp_" + path);
  }

  public selectPosition(npc_id: number): void {
    const free = new LuaTable();

    for (const [k, v] of this.position) {
      if (v.used === null) {
        table.insert(free, k);
      }
    }

    if (free.length() > 0) {
      const rr = math.random(free.length());

      this.position.get(free.get(rr)).used = npc_id;
      this.npc.get(npc_id).position = free.get(rr);
    }
  }

  public getDestVertex(npc: XR_game_object, radius: number): LuaMultiReturn<[number, number]> {
    const npc_id = npc.id();

    if (this.npc.get(npc_id).position === null) {
      abort("get dest Vertex: null [%s]", npc_id);
    }

    const pp = this.patrol.point(0);
    const dir = this.position.get(this.npc.get(npc_id).position!).dir;

    dir.x = dir.x + math.random(-1, 1) / 5;
    dir.z = dir.z + math.random(-1, 1) / 5;
    dir.normalize();

    radius = radius + math.random(-0.3, 0.3);

    let dest_vertex = MAX_UNSIGNED_32_BIT;

    while (dest_vertex === MAX_UNSIGNED_32_BIT) {
      const tmp_pos = new vector().set(0, 0, 0);

      tmp_pos.x = pp.x + dir.x * radius;
      tmp_pos.z = pp.z + dir.z * radius;
      tmp_pos.y = pp.y;

      dest_vertex = level.vertex_id(tmp_pos);

      if (dest_vertex === MAX_UNSIGNED_32_BIT) {
        if (radius < 1) {
          abort("Invalid AI map at kamp point [%s]", this.kamp_name);
        } else {
          radius = radius - 0.5;
        }
      }
    }

    if (!npc.accessible(dest_vertex)) {
      const vp = level.vertex_position(dest_vertex);
      const nearest_vertex = npc.accessible_nearest(vp, new vector().set(0, 0, 0));

      return $multi(nearest_vertex, this.npc.get(npc_id).position!);
    }

    return $multi(dest_vertex, this.npc.get(npc_id).position!);
  }

  public proceedState(npc: XR_game_object): void {
    const npc_id = npc.id();
    const active_sound_count = npc.active_sound_count();

    if (this.npc.get(npc_id).need_sound_begin === true) {
      if (active_sound_count === 0) {
        return;
      } else {
        this.npc.get(npc_id).need_sound_begin = false;
      }
    }

    if (this.begin !== null && time_global() - this.begin < this.timeout.get(this.kamp_state).min) {
      return;
    }

    if (active_sound_count > 0) {
      return;
    }

    if (!this.sound_manager.is_finished()) {
      this.sound_manager.update();

      return;
    }

    const temp: LuaTable<string, number> = new LuaTable();
    let max_rnd = 0;

    for (const [k, v] of this.trans_kamp.get(this.kamp_state)) {
      if (this.kamp_states.get(k)) {
        temp.set(k, v);
        max_rnd = max_rnd + v;
      }
    }

    if (max_rnd === 0) {
      temp.set("idle", 100);
      max_rnd = 100;
    }

    let p: number = math.random(0, max_rnd);

    for (const [k, v] of temp) {
      p = p - v;

      if (p <= 0) {
        // --printf("Selected [%s]", k)
        if (k === "idle") {
          this.director = null;
          if (this.kamp_state !== "idle") {
            this.npc.get(npc_id).begin = null;
          }
        } else if (k === "story") {
          this.sound_manager.set_story("test_story");
          this.director = npc_id;
          this.censor = null;
        } else {
          this.npc.get(npc_id).begin = null;

          if (this.timeout.get(k).soundstart) {
            this.npc.get(npc_id).need_sound_begin = true;
          }

          this.director = npc_id;
          this.censor = null;
        }

        this.kamp_state = k;
        this.begin = time_global();

        for (const [kk, vv] of this.npc) {
          vv.new = true;
        }

        return;
      }
    }
  }

  public proceedRole(npc: XR_game_object, director: boolean): LuaMultiReturn<[string, string]> {
    let sound: string = "";
    let state: string = "";
    const npc_id = npc.id();

    if (
      this.npc.get(npc_id).begin === null ||
      time_global() - this.npc.get(npc_id).begin! >= this.npc.get(npc_id).state_idle!
    ) {
      const states = director
        ? this.avail_state.get(this.kamp_state).directed
        : this.avail_state.get(this.kamp_state).undirected;

      const temp: LuaTable<number, string> = new LuaTable();

      for (const [k, v] of states) {
        if (this.npc.get(npc_id).states[v] === true) {
          table.insert(temp, v);
        }
      }

      this.npc.get(npc_id).begin = time_global();
      state = temp.get(math.random(temp.length()));
      this.npc.get(npc_id).state_selected = state;
      this.npc.get(npc_id).state_idle = math.random(15000, 20000);
    } else {
      state = this.npc.get(npc_id).state_selected!;
    }

    if (this.kamp_state === "story") {
      sound = "";
    } else {
      if (director) {
        sound = this.avail_sound.get(this.kamp_state).directed;
      } else {
        sound = this.avail_sound.get(this.kamp_state).undirected;
      }
    }

    return $multi(state, sound);
  }

  public updateNpc(npc: XR_game_object): LuaMultiReturn<[string, Optional<string>, Optional<number>]> {
    this.checkNpcAbility(npc);

    const npc_id = npc.id();
    const director = this.director === null || this.director === npc_id;

    if (director) {
      this.proceedState(npc);
    }

    let [state, sound] = this.proceedRole(npc, director);
    let substate = null;

    if (state === "wait_harmonica") {
      if (sound === "pre_harmonica" && this.npc.get(npc_id).new === true) {
        GlobalSound.set_sound_play(npc.id(), "intro_music", null, null);
        this.npc.get(npc_id).new = false;
      }

      state = "harmonica";
      kamp_stalkers.set(npc_id, false);
    } else if (state === "play_harmonica") {
      state = "harmonica";
      substate = 1;
      kamp_stalkers.set(npc_id, false);
    } else if (state === "wait_guitar") {
      if (sound === "pre_guitar" && this.npc.get(npc_id).new === true) {
        GlobalSound.set_sound_play(npc.id(), "intro_music", null, null);
        this.npc.get(npc_id).new = false;
      }

      state = "guitar";
      kamp_stalkers.set(npc_id, false);
    } else if (state === "play_guitar") {
      state = "guitar";
      substate = 1;
      kamp_stalkers.set(npc_id, false);
    } else if (state === "declarate") {
      if (this.npc.get(npc_id).new === true) {
        this.npc.get(npc_id).new = false;
      }

      if (getCharacterCommunity(npc) === communities.monolith) {
        const t = math.mod(npc_id, 2);

        if (t === 0) {
          state = "trans_0";
        } else {
          state = "trans_1";
        }
      } else if (getCharacterCommunity(npc) === communities.zombied) {
        state = "trans_zombied";
      } else {
        const t = math.mod(npc_id, 3);

        if (t === 0) {
          state = "sit";
        } else if (t === 1) {
          state = "sit_ass";
        } else {
          state = "sit_knee";
        }
      }

      kamp_stalkers.set(npc_id, false);
    } else if (state === "trans") {
      if (getCharacterCommunity(npc) === communities.monolith) {
        const t = math.mod(npc_id, 2);

        if (t === 0) {
          state = "trans_0";
        } else {
          state = "trans_1";
        }
      } else if (getCharacterCommunity(npc) === communities.zombied) {
        state = "trans_zombied";
      }

      kamp_stalkers.set(npc_id, false);
    } else {
      kamp_stalkers.set(npc_id, true);
    }

    if (sound === "idle") {
      sound = "state";
    } else if (sound === "reac_guitar") {
      sound = "reac_music";
    } else if (sound === "reac_harmonica") {
      sound = "reac_music";
    } else {
      sound = "";
    }

    return $multi(state, sound, substate);
  }

  public checkNpcAbility(npc: XR_game_object): void {
    const npc_id = npc.id();

    if (getCharacterCommunity(npc) !== communities.monolith && getCharacterCommunity(npc) !== communities.zombied) {
      if (npc.object("kolbasa")) {
        this.npc.get(npc_id).states["eat_kolbasa"] = true;
      } else {
        this.npc.get(npc_id).states["eat_kolbasa"] = false;
      }

      if (npc.object("vodka")) {
        this.npc.get(npc_id).states["eat_vodka"] = true;
      } else {
        this.npc.get(npc_id).states["eat_vodka"] = false;
      }

      if (npc.object("energy_drink")) {
        this.npc.get(npc_id).states["eat_energy"] = true;
      } else {
        this.npc.get(npc_id).states["eat_energy"] = false;
      }
    }

    if (npc.object("bread")) {
      this.npc.get(npc_id).states["eat_bread"] = true;
    } else {
      this.npc.get(npc_id).states["eat_bread"] = false;
    }

    this.npc.get(npc_id).states["play_harmonica"] = false;
    this.npc.get(npc_id).states["wait_harmonica"] = false;
    this.kamp_states.set("pre_harmonica", false);
    this.kamp_states.set("harmonica", false);
    this.kamp_states.set("post_harmonica", false);

    this.npc.get(npc_id).states["play_guitar"] = false;
    this.npc.get(npc_id).states.wait_guitar = false;
    this.kamp_states.set("pre_guitar", false);
    this.kamp_states.set("guitar", false);
    this.kamp_states.set("post_guitar", false);
  }

  public addNpc(npc: XR_game_object): void {
    if (this.npc.get(npc.id()) !== null) {
      return;
    }

    if (getCharacterCommunity(npc) === communities.monolith || getCharacterCommunity(npc) === communities.zombied) {
      this.npc.set(npc.id(), {
        name: npc.name(),
        position: null,
        new: null,
        current: null,
        begin: null,
        speak: 0,
        states: {
          stand_wait: false,
          sit: false,
          sit_ass: false,
          sit_knee: false,
          declarate: true,
          eat_kolbasa: false,
          eat_vodka: false,
          eat_energy: false,
          eat_bread: false,
          trans: true,
          play_harmonica: false,
          play_guitar: false,
        },
      });
    } else {
      this.npc.set(npc.id(), {
        name: npc.name(),
        position: null,
        new: null,
        current: null,
        begin: null,
        speak: 0,
        states: {
          stand_wait: true,
          sit: true,
          sit_ass: true,
          sit_knee: true,
          declarate: true,
          eat_kolbasa: false,
          eat_vodka: false,
          eat_energy: false,
          eat_bread: false,
          trans: false,
          play_harmonica: false,
          play_guitar: false,
        },
      });
    }

    this.selectPosition(npc.id());
    this.sound_manager.register_npc(npc.id());
  }

  public removeNpc(npc: XR_game_object): void {
    this.sound_manager.unregister_npc(npc.id());

    const npc_id = npc.id();

    if (this.npc.get(npc_id) !== null) {
      if (this.director === npc_id) {
        this.director = null;
        this.npc.get(npc_id).begin = null;
        this.censor = null;
        this.kamp_state = "idle";
        this.begin = time_global();
        for (const [kk, vv] of this.npc) {
          vv.new = true;
        }

        stopPlaySound(npc);
      }

      this.position.get(this.npc.get(npc_id).position!).used = null;
      this.npc.delete(npc_id);
    }
  }

  public increasePops(npc: XR_game_object): void {
    this.population = this.population + 1;

    const campfire: Optional<XR_CZoneCampfire> = campfire_table.get(this.kamp_name + "_campfire");

    if (this.population > 0 && campfire !== null && !campfire.is_on()) {
      campfire.turn_on();
    }
  }

  public decreasePops(npc: XR_game_object): void {
    this.population = this.population - 1;
    // -- Probably undefined reference

    const campfire: Optional<XR_CZoneCampfire> = campfire_table.get(this.kamp_name + "_campfire");

    if (this.population < 1 && campfire !== null && campfire.is_on()) {
      campfire.turn_off();
    }
  }
}
