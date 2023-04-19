import { action_base, level, LuabindClass, patrol, XR_game_object, XR_sound_object, XR_vector } from "xray16";

import { getObjectIdByStoryId, registry, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { SmartTerrain } from "@/engine/core/objects/server/smart/SmartTerrain";
import { EStalkerState } from "@/engine/core/objects/state";
import { IStateManagerCallbackDescriptor } from "@/engine/core/objects/state/StalkerStateManager";
import { ISchemeRemarkState } from "@/engine/core/schemes/remark";
import { abort } from "@/engine/core/utils/assertion";
import { getSmartTerrainByName } from "@/engine/core/utils/gulag";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, TNumberId } from "@/engine/lib/types";

const state_initial = 0;
const state_animation = 1;
const state_sound = 2;
const state_finish = 3;

const logger: LuaLogger = new LuaLogger($filename);

interface IDescriptor {
  look_object: Optional<XR_game_object>;
  look_position: Optional<XR_vector>;
}

/**
 * todo;
 */
@LuabindClass()
export class ActionRemarkActivity extends action_base {
  public st: ISchemeRemarkState;
  public state: number = state_initial;

  public sound_end_signalled: boolean = false;
  public action_end_signalled: boolean = false;
  public anim_end_signalled: boolean = false;
  public anim_scheduled: boolean = false;
  public snd_scheduled: boolean = false;
  public snd_started: boolean = false;
  public tips_sound: Optional<XR_sound_object> = null;

  /**
   * todo
   */
  public constructor(state: ISchemeRemarkState) {
    super(null, ActionRemarkActivity.__name);
    this.st = state;
  }

  /**
   * todo
   */
  public override initialize(): void {
    super.initialize();
    this.object.set_desired_position();
    this.object.set_desired_direction();
    // --    GlobalSound:set_sound(this.object, null)
  }

  /**
   * todo
   */
  public activateScheme(): void {
    this.st.signals = new LuaTable();
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
  }

  /**
   * todo
   */
  public get_target(): Optional<IDescriptor> {
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
  }

  /**
   * todo
   */
  public time_callback(): void {
    this.state = state_sound;
    this.update();
  }

  /**
   * todo
   */
  public update(): void {
    if (this.state === state_initial) {
      const cb: IStateManagerCallbackDescriptor = { obj: this, func: this.time_callback };
      const target = this.get_target();

      if (target === null) {
        const anim: EStalkerState = pickSectionFromCondList(registry.actor, this.object, this.st.anim)!;

        setStalkerState(this.object, anim, cb, 0, null, null);
        this.state = state_animation;

        return;
      }

      const anim: EStalkerState = pickSectionFromCondList(registry.actor, this.object, this.st.anim)!;

      setStalkerState(this.object, anim, cb, 0, target, null);
      this.state = state_animation;
    } else if (this.state === state_animation) {
      // Empty.
    } else if (this.state === state_sound) {
      if (this.snd_scheduled === true) {
        this.snd_started = true;
        GlobalSoundManager.getInstance().playSound(this.object.id(), this.st.snd, null, null);
      }

      if (this.anim_end_signalled === false) {
        this.anim_end_signalled = true;
        this.st.signals!.set("anim_end", true);
      }

      if (this.st.signals!.get("sound_end") || this.st.signals!.get("theme_end")) {
        if (this.sound_end_signalled === false) {
          this.sound_end_signalled = true;
        }
      }

      if (this.sound_end_signalled && this.anim_end_signalled) {
        if (this.action_end_signalled === false) {
          this.st.signals!.set("action_end", true);
          this.action_end_signalled = true;
        }
      }
    }
  }

  /**
   * todo
   */
  public override execute(): void {
    super.execute();
    this.update();
  }

  /**
   * todo
   */
  public override finalize(): void {
    if (this.tips_sound !== null) {
      this.tips_sound.stop();
    }

    super.finalize();
  }
}

/**
 * todo
 */
export function init_target(
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

  let targetPosition: Optional<XR_vector> = null;
  let targetId: Optional<TNumberId> = null;
  let isTargetInitialized: boolean = false;

  if (targetString === NIL) {
    return $multi(targetPosition, targetId, isTargetInitialized);
  } else if (targetString === null) {
    instruction(obj, "");
  }

  const [target_type, target] = parse_type(targetString);

  if (target_type === "story") {
    const [story_id] = parse_target(target);

    targetId = getObjectIdByStoryId(story_id!);
    isTargetInitialized = true;
  } else if (target_type === "path") {
    const [path, point] = parse_target(target);

    const pointNumber = tonumber(point)!;

    if (point) {
      targetPosition = new patrol(path!).point(pointNumber);
      isTargetInitialized = true;
    }
  } else if (target_type === "job") {
    const [job, gulag] = parse_target(target);
    const smartTerrain: SmartTerrain = getSmartTerrainByName(gulag!)!;

    targetId = smartTerrain.idNPCOnJob(job!);
    isTargetInitialized = targetId !== null && true;
  } else {
    instruction(obj, targetString);
  }

  return $multi(targetPosition, targetId, isTargetInitialized);
}

/**
 * todo
 */
function instruction(object: XR_game_object, data: string): never {
  abort(
    "\nWrong target field for object [%s] in section [%s]!!!\n" +
      "Field [target] supports following:\n" +
      "   target = story | actor or story_id\n" +
      "   target = path  | patrol_path, point_id\n" +
      "   target = job   | job_section, smart_name\n" +
      "Your target field:\n" +
      "   target = %s",
    object.name(),
    registry.objects.get(object.id()).active_section,
    data
  );
}
