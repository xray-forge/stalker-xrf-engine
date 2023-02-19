import { action_base, level, patrol, XR_action_base, XR_game_object, XR_sound_object, XR_vector } from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { GlobalSound } from "@/mod/scripts/core/logic/GlobalSound";
import { ISmartTerrain } from "@/mod/scripts/se/SmartTerrain";
import { set_state } from "@/mod/scripts/state_management/StateManager";
import { pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { get_gulag_by_name } from "@/mod/scripts/utils/gulag";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const state_initial = 0;
const state_animation = 1;
const state_sound = 2;
const state_finish = 3;

const logger: LuaLogger = new LuaLogger("ActionRemarkActivity");

interface IDescriptor {
  look_object: Optional<XR_game_object>;
  look_position: Optional<XR_vector>;
}

export interface IActionRemarkActivity extends XR_action_base {
  st: IStoredObject;
  state: number;

  sound_end_signalled: boolean;
  action_end_signalled: boolean;
  anim_end_signalled: boolean;
  anim_scheduled: boolean;
  snd_scheduled: boolean;
  snd_started: boolean;
  tips_sound: Optional<XR_sound_object>;

  activate_scheme(): void;
  get_target(): IDescriptor;
  time_callback(): void;
  update(): void;
}

export const ActionRemarkActivity: IActionRemarkActivity = declare_xr_class("ActionRemarkActivity", action_base, {
  __init(name: string, state: IStoredObject): void {
    action_base.__init(this, null, name);
    this.st = state;
  },
  initialize(): void {
    action_base.initialize(this);
    this.object.set_desired_position();
    this.object.set_desired_direction();
    // --    GlobalSound:set_sound(this.object, null)
  },
  activate_scheme(): void {
    this.st.signals = {};
    this.sound_end_signalled = false;
    this.action_end_signalled = false;
    this.anim_end_signalled = false;
    this.anim_scheduled = true;

    if (this.st.snd_anim_sync === false && this.st.snd !== null) {
      this.snd_scheduled = true;
    } else {
      this.snd_scheduled = false;
    }

    this.snd_started = false;

    this.state = state_initial;
    this.tips_sound = null;
  },
  get_target(): Optional<IDescriptor> {
    const look_tbl = {
      look_object: null as Optional<XR_game_object>,
      look_position: null as Optional<XR_vector>,
    };

    const [target_position, target_id, target_init] = init_target(this.object, this.st.target);

    this.st.target_position = target_position;
    this.st.target_id = target_id;
    this.st.target_init = target_init;

    if (this.st.target_init === false) {
      // --printf("target_is_ni!!!l")
      return null;
    }

    if (this.st.target_id) {
      look_tbl.look_object = level.object_by_id(this.st.target_id);
    }

    if (this.st.target_position) {
      look_tbl.look_position = this.st.target_position;
    }

    return look_tbl;
  },
  time_callback(): void {
    this.state = state_sound;
    this.update();
  },
  update(): void {
    // --' 1. �� ������ ����������� �� ������.

    if (this.state === state_initial) {
      const cb = { obj: this, func: this.time_callback };
      const target = this.get_target();

      if (target === null) {
        const anim = pickSectionFromCondList(getActor() as XR_game_object, this.object, this.st.anim)!;

        set_state(this.object, anim, cb, 0, null, null);
        this.state = state_animation;

        return;
      }

      const anim = pickSectionFromCondList(getActor() as XR_game_object, this.object, this.st.anim)!;

      set_state(this.object, anim, cb, 0, target, null);
      this.state = state_animation;

      // --' �������� ������� �� ��������������
    } else if (this.state === state_animation) {
      // --' 2. �� ������ �������� �����.
    } else if (this.state === state_sound) {
      if (this.snd_scheduled === true) {
        this.snd_started = true;
        GlobalSound.set_sound_play(this.object.id(), this.st.snd, null, null);
      }

      // --' ������ ������ ������ anim_end
      if (this.anim_end_signalled === false) {
        this.anim_end_signalled = true;
        this.st.signals["anim_end"] = true;
      }

      if (this.st.signals["sound_end"] === true || this.st.signals["theme_end"] === true) {
        // --printf("SOUND_END signalled!!!")
        if (this.sound_end_signalled === false) {
          this.sound_end_signalled = true;
        }
      }

      if (this.sound_end_signalled === true && this.anim_end_signalled === true) {
        if (this.action_end_signalled === false) {
          // --printf("ACTION_END signalled!!!")
          this.st.signals["action_end"] = true;
          this.action_end_signalled = true;
        }
      }
    }
  },
  execute(): void {
    action_base.execute(this);
    this.update();
  },
  finalize(): void {
    if (this.tips_sound !== null) {
      this.tips_sound.stop();
    }

    action_base.finalize(this);
  },
} as IActionRemarkActivity);

/**
 * todo
 */
function init_target(
  obj: XR_game_object,
  targetString: string
): LuaMultiReturn<[Optional<XR_vector>, Optional<number>, Optional<boolean>]> {
  // todo: Simplify.
  function parse_target(target_str: string): LuaMultiReturn<[Optional<string>, Optional<string>]> {
    const [pos] = string.find(target_str, ",");

    if (pos !== null) {
      return $multi(string.sub(target_str, 1, pos - 1), string.sub(target_str, pos + 1));
    } else {
      return $multi(target_str, null);
    }
  }

  // todo: Simplify.
  function parse_type(target_str: string): LuaMultiReturn<[string, string]> {
    const [pos] = string.find(target_str, "|");

    if (pos === null) {
      instruction(obj, target_str);
    }

    const target_type = string.sub(target_str, 1, pos - 1);
    const target = string.sub(target_str, pos + 1);

    if (target === null || target === "" || target_type === null || target_type === "") {
      instruction(obj, target_str);
    }

    return $multi(target_type, target);
  }

  let target_pos: Optional<XR_vector> = null;
  let target_id: Optional<number> = null;
  let target_initialized: boolean = false;

  if (targetString === "nil") {
    return $multi(target_pos, target_id, target_initialized);
  } else if (targetString === null) {
    instruction(obj, "");
  }

  const [target_type, target] = parse_type(targetString);

  if (target_type === "story") {
    const [story_id] = parse_target(target);

    target_id = getStoryObjectId(story_id!);
    target_initialized = true;
  } else if (target_type === "path") {
    const [path, point] = parse_target(target);

    const pointNumber = tonumber(point)!;

    if (point) {
      target_pos = new patrol(path!).point(pointNumber);
      target_initialized = true;
    }
  } else if (target_type === "job") {
    const [job, gulag] = parse_target(target);
    const smartTerrain: ISmartTerrain = get_gulag_by_name(gulag!)!;

    target_id = smartTerrain.idNPCOnJob(job!);
    target_initialized = target_id !== null && true;
  } else {
    instruction(obj, targetString);
  }

  return $multi(target_pos, target_id, target_initialized);
}

function instruction(obj: XR_game_object, target_str: string): never {
  abort(
    "\nWrong target field for object [%s] in section [%s]!!!\n" +
      "Field [target] supports following:\n" +
      "   target = story | actor or story_id\n" +
      "   target = path  | patrol_path, point_id\n" +
      "   target = job   | job_section, smart_name\n" +
      "Your target field:\n" +
      "   target = %s",
    obj.name(),
    storage.get(obj.id()).active_section,
    target_str
  );
}
