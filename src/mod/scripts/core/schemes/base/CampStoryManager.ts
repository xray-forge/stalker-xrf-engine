import { time_global, XR_game_object, XR_ini_file, XR_vector } from "xray16";

import { EScheme, Optional } from "@/mod/lib/types";
import { CAMPS, registry } from "@/mod/scripts/core/db";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { get_sound_manager, SoundManager } from "@/mod/scripts/core/sound/SoundManager";
import { isObjectMeeting } from "@/mod/scripts/utils/checkers/checkers";
import { getConfigString, parseNames } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("CampStoryManager");
const npc_role = { noone: 0, listener: 1, director: 2 };

// todo: Implement as scheme.
// todo: Rename to camp story?
export class CampStoryManager {
  public static readonly SCHEME_SECTION: string = EScheme.CAMP;

  public static get_current_camp(position: Optional<XR_vector>): Optional<CampStoryManager> {
    if (position === null) {
      return null;
    }

    // todo: Is it too big scope to check?
    for (const [k, v] of CAMPS) {
      if (v.object!.inside(position)) {
        return v;
      }
    }

    return null;
  }

  public static start_guitar(npc: XR_game_object): void {
    const camp_id = registry.objects.get(npc.id()).registred_camp;

    if (camp_id === null) {
      return;
    }

    const camp = CAMPS.get(camp_id);

    camp.sound_manager.set_storyteller(camp.director);
    camp.sound_manager.set_story(camp.guitar_table.get(math.random(camp.guitar_table.length())));
    camp.sound_manager_started = true;
    camp.sound_manager.update();
  }

  public static start_harmonica(npc: XR_game_object): void {
    const camp_id = registry.objects.get(npc.id()).registred_camp;

    if (camp_id === null) {
      return;
    }

    const camp = CAMPS.get(camp_id);

    camp.sound_manager.set_storyteller(camp.director);
    camp.sound_manager.set_story(camp.harmonica_table.get(math.random(camp.harmonica_table.length())));
    camp.sound_manager_started = true;
    camp.sound_manager.update();
  }

  public object: XR_game_object;
  public ini: XR_ini_file;

  public story_table: LuaTable<number, string>;
  public guitar_table: LuaTable<number, string>;
  public harmonica_table: LuaTable<number, string>;

  public npc: LuaTable<number, { [index: string]: number | string; state: string }> = new LuaTable();
  public schemes: LuaTable = new LuaTable();

  public director: Optional<number> = null;
  public idle_talker: Optional<number> = null;

  public sound_manager_started: boolean = true;
  public sound_manager: SoundManager;

  public active_state: string = "idle";
  public active_state_time: number = 0;
  public timeout: number = 0;
  public states: LuaTable<
    string,
    {
      director_state: Optional<string>;
      general_state: string;
      min_time: number;
      max_time: number;
      timeout: number;
      transitions: LuaTable<string, number>;
      precondition: (this: void, camp: CampStoryManager) => boolean;
    }
  >;

  public constructor(object: XR_game_object, ini: XR_ini_file) {
    this.object = object;
    this.ini = ini;

    const stories = getConfigString(ini, CampStoryManager.SCHEME_SECTION, "stories", null, false, "", "test_story");
    const guitars = getConfigString(
      ini,
      CampStoryManager.SCHEME_SECTION,
      "guitar_themes",
      null,
      false,
      "",
      "test_guitar"
    );
    const harmonicas = getConfigString(
      ini,
      CampStoryManager.SCHEME_SECTION,
      "harmonica_themes",
      null,
      false,
      "",
      "test_harmonica"
    );

    this.story_table = parseNames(stories);
    this.guitar_table = parseNames(guitars);
    this.harmonica_table = parseNames(harmonicas);

    this.sound_manager = get_sound_manager(CampStoryManager.SCHEME_SECTION + this.object.id());

    this.states = {
      idle: {
        director_state: null,
        general_state: "idle",
        min_time: 30000,
        max_time: 40000,
        timeout: 0,
        transitions: { harmonica: 30, guitar: 30, story: 40 },
        precondition: sr_camp_idle_precondition,
      },
      harmonica: {
        director_state: "play_harmonica",
        general_state: "listen",
        min_time: 10000,
        max_time: 11000,
        timeout: 3000,
        transitions: { idle: 100, harmonica: 0, guitar: 0, story: 0 },
        precondition: sr_camp_harmonica_precondition,
      },
      guitar: {
        director_state: "play_guitar",
        general_state: "listen",
        min_time: 10000,
        max_time: 11000,
        timeout: 4500,
        transitions: { idle: 100, harmonica: 0, guitar: 0, story: 0 },
        precondition: sr_camp_guitar_precondition,
      },
      story: {
        director_state: "tell",
        general_state: "listen",
        min_time: 10000,
        max_time: 11000,
        timeout: 0,
        transitions: { idle: 100, harmonica: 0, guitar: 0, story: 0 },
        precondition: sr_camp_story_precondition,
      },
    } as any;
  }

  public update(): void {
    if (!this.sound_manager.is_finished()) {
      this.sound_manager.update();

      return;
    }

    if (!this.sound_manager_started) {
      return;
    }

    if (this.idle_talker !== null) {
      if (GlobalSound.sound_table.get(this.idle_talker) !== null) {
        return;
      } else {
        this.idle_talker = null;
      }
    }

    if (this.active_state_time < time_global()) {
      this.set_next_state();
      if (this.get_director() === false) {
        this.active_state = "idle";
        for (const [k, v] of this.npc) {
          v.state = this.active_state;
        }
      }

      this.sound_manager_started = false;
      for (const [k, v] of this.npc) {
        if (registry.objects.get(k) !== null) {
          // todo: Optimize call.
          issueEvent(
            registry.objects.get(k).object!,
            registry.objects.get(k)[registry.objects.get(k).active_scheme!],
            "update"
          );
        }

        // todo: Optimize call.
        const meet =
          registry.objects.get(k) && registry.objects.get(k).meet && registry.objects.get(k).meet.meet_manager;

        if (meet) {
          meet.npc_is_camp_director = this.director === k;
        }
      }
    }

    if (this.timeout !== 0 && this.timeout <= time_global()) {
      this.set_story();
      this.timeout = 0;
    }

    if (this.active_state === "idle") {
      let npc_count: number = 0;
      const talkers: LuaTable<number, number> = new LuaTable();

      for (const [k, v] of this.npc) {
        npc_count = npc_count + 1;
        table.insert(talkers, k);
      }

      if (npc_count !== 0) {
        this.idle_talker = talkers.get(math.random(talkers.length()));
        GlobalSound.set_sound_play(this.idle_talker, "state", null, null);
      }
    }
  }

  public set_next_state(): void {
    const transitions = this.states.get(this.active_state).transitions;
    let rnd: number = math.random(100);

    for (const [k, v] of transitions) {
      if (rnd < v) {
        if (this.states.get(k).precondition(this)) {
          this.active_state = k;
          break;
        }
      } else {
        rnd = rnd - v;
      }
    }

    for (const [k, v] of this.npc) {
      v.state = this.active_state;
    }

    this.active_state_time =
      time_global() +
      math.random(this.states.get(this.active_state).min_time, this.states.get(this.active_state).max_time);
    this.timeout = time_global() + this.states.get(this.active_state).timeout;
  }

  // todo: Is it getter?
  public get_director(): Optional<boolean> {
    if (this.active_state === "idle") {
      this.director = null;

      return null;
    }

    const directors = new LuaTable();
    let npc_count = 0;

    for (const [k, v] of this.npc) {
      npc_count = npc_count + 1;

      const st = registry.objects.get(k);

      if (st !== null) {
        const scheme = st.active_scheme && st[st.active_scheme];
        const npc: Optional<XR_game_object> = st.object!;

        if (
          v[this.active_state] === npc_role.director &&
          scheme !== null &&
          scheme.base_action === scheme.description &&
          !isObjectMeeting(npc)
        ) {
          table.insert(directors, k);
        }
      }
    }

    if (npc_count === 0) {
      this.director = null;
    } else if (directors.length() < 1) {
      return false;
    } else if (directors.length() === 1) {
      this.director = directors.get(1);
    } else {
      this.director = directors.get(math.random(directors.length()));
    }

    return null;
  }

  public set_story(): void {
    if (this.active_state === "story") {
      this.sound_manager.set_storyteller(this.director);
      this.sound_manager.set_story(this.story_table.get(math.random(this.story_table.length())));
      this.sound_manager_started = true;
    } else if (this.active_state === "idle") {
      this.sound_manager_started = true;
    }
  }

  public get_camp_action(npc_id: number): LuaMultiReturn<[Optional<string>, Optional<boolean>]> {
    if (npc_id === null) {
      abort("Trying to use destroyed object!");
    }

    if (this.npc.get(npc_id) === null) {
      return $multi(null, null);
    }

    return $multi(this.npc.get(npc_id)!.state, this.director === npc_id);
  }

  public register_npc(npc_id: number): void {
    this.npc.set(npc_id, { state: this.active_state });
    registry.objects.get(npc_id).registred_camp = this.object.id();

    for (const [k, v] of this.states) {
      const role = this.get_npc_role(npc_id, k);

      if (role === npc_role.noone) {
        abort("Wrong role for npc[%s] with id[%d] in camp [%s]!!!", "", npc_id, this.object.name());
      }

      this.npc.get(npc_id)[k] = role;
    }

    this.sound_manager.register_npc(npc_id);

    // todo: Optimize.
    issueEvent(
      registry.objects.get(npc_id).object!,
      registry.objects.get(npc_id)[registry.objects.get(npc_id).active_scheme!],
      "update"
    );
  }

  public unregister_npc(npc_id: number): void {
    if (this.director === npc_id) {
      this.sound_manager_started = false;
      this.active_state_time = 0;
      this.director = null;

      this.active_state = "idle";
      for (const [k, v] of this.npc) {
        v.state = this.active_state;
      }
    }

    registry.objects.get(npc_id).registred_camp = null;
    this.npc.delete(npc_id);
    this.sound_manager.unregister_npc(npc_id);
  }

  public get_npc_role(npc_id: number, state: string): number {
    const scheme = registry.objects.get(npc_id)[registry.objects.get(npc_id).active_scheme!];

    if (scheme === null) {
      return npc_role.noone;
    }

    const npc_actions: LuaTable = scheme.approved_actions;
    let descr = scheme.description;

    if (state === "harmonica" || state === "guitar") {
      descr = descr + "_" + state;

      for (const i of $range(1, npc_actions.length())) {
        if (npc_actions.get(i).name === descr) {
          return npc_role.director;
        }
      }

      return npc_role.listener;
    } else if (state === "story") {
      for (const i of $range(1, npc_actions.length())) {
        if (npc_actions.get(i).name === descr || npc_actions.get(i).name === descr + "_weapon") {
          return npc_role.director;
        }
      }

      return npc_role.listener;
    } else if (state === "idle") {
      return npc_role.listener;
    }

    return npc_role.noone;
  }
}

/**
 * todo;
 */
function sr_camp_idle_precondition(camp: CampStoryManager): boolean {
  return true;
}

/**
 * todo;
 */
function sr_camp_guitar_precondition(camp: CampStoryManager): boolean {
  if (camp.guitar_table.length() > 0) {
    let n = 0;

    for (const [k, v] of camp.npc) {
      n = n + 1;
    }

    if (n > 1) {
      for (const [k, v] of camp.npc) {
        // todo: Optimize checkers with constant GET.
        const scheme =
          registry.objects.get(k) &&
          registry.objects.get(k).active_scheme &&
          registry.objects.get(k)[registry.objects.get(k).active_scheme!];
        const npc: Optional<XR_game_object> = registry.objects.get(k) && registry.objects.get(k).object!;

        if (
          v.guitar === npc_role.director &&
          scheme !== null &&
          scheme.base_action === scheme.description &&
          npc !== null &&
          !isObjectMeeting(npc)
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

function sr_camp_story_precondition(camp: CampStoryManager): boolean {
  if (camp.story_table.length() > 0) {
    let n = 0;

    for (const [k, v] of camp.npc) {
      // todo: Optimize checkers with constant GET.
      const npc: Optional<XR_game_object> = registry.objects.get(k) && registry.objects.get(k).object!;

      if (npc !== null && !isObjectMeeting(npc)) {
        n = n + 1;
      }
    }

    // todo: Probably just return instead of full FOR?
    if (n > 1) {
      return true;
    }
  }

  return false;
}

function sr_camp_harmonica_precondition(camp: CampStoryManager): boolean {
  if (camp.harmonica_table.length() > 0) {
    let n: number = 0;

    // todo: Len util.
    for (const [k, v] of camp.npc) {
      n = n + 1;
    }

    if (n > 1) {
      for (const [k, v] of camp.npc) {
        // todo: Simplify.
        const scheme =
          registry.objects.get(k) &&
          registry.objects.get(k).active_scheme &&
          registry.objects.get(k)[registry.objects.get(k).active_scheme!];
        const npc: Optional<XR_game_object> = registry.objects.get(k) && registry.objects.get(k).object!;

        if (
          v.harmonica === npc_role.director &&
          scheme !== null &&
          scheme.base_action === scheme.description &&
          npc !== null &&
          !isObjectMeeting(npc)
        ) {
          return true;
        }
      }
    }
  }

  return false;
}
