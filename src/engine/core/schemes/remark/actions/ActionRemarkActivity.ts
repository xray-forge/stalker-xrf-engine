import { action_base, level, LuabindClass, patrol } from "xray16";

import { getObjectIdByStoryId, registry, setStalkerState } from "@/engine/core/database";
import { SimulationBoardManager } from "@/engine/core/managers/interaction/SimulationBoardManager";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState, ILookTargetDescriptor, IStateManagerCallbackDescriptor } from "@/engine/core/objects/animation";
import { SmartTerrain } from "@/engine/core/objects/server/smart_terrain/SmartTerrain";
import { ISchemeRemarkState } from "@/engine/core/schemes/remark";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, Optional, SoundObject, TNumberId, Vector } from "@/engine/lib/types";

const stateInitial = 0;
const stateAnimation = 1;
const stateSound = 2;
const stateFinish = 3;

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionRemarkActivity extends action_base {
  public st: ISchemeRemarkState;
  public state: number = stateInitial;

  public soundEndSignalled: boolean = false;
  public actionEndSignalled: boolean = false;
  public animEndSignalled: boolean = false;
  public animScheduled: boolean = false;
  public sndScheduled: boolean = false;
  public sndStarted: boolean = false;
  public tipsSound: Optional<SoundObject> = null;

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
  public override execute(): void {
    super.execute();
    this.update();
  }

  /**
   * todo
   */
  public override finalize(): void {
    if (this.tipsSound !== null) {
      this.tipsSound.stop();
    }

    super.finalize();
  }

  /**
   * todo
   */
  public activateScheme(): void {
    this.st.signals = new LuaTable();
    this.soundEndSignalled = false;
    this.actionEndSignalled = false;
    this.animEndSignalled = false;
    this.animScheduled = true;

    if (this.st.snd_anim_sync === false && this.st.snd !== null) {
      this.sndScheduled = true;
    } else {
      this.sndScheduled = false;
    }

    this.sndStarted = false;

    this.state = stateInitial;
    this.tipsSound = null;
  }

  /**
   * todo
   */
  public getTarget(): Optional<ILookTargetDescriptor> {
    const lookTargetDescriptor: ILookTargetDescriptor = {
      lookObject: null as Optional<ClientObject>,
      lookPosition: null as Optional<Vector>,
    };

    const [targetPosition, targetId, targetInit] = initTarget(this.object, this.st.target);

    this.st.target_position = targetPosition;
    this.st.target_id = targetId;
    this.st.target_init = targetInit;

    if (this.st.target_init === false) {
      // --printf("target_is_ni!!!l")
      return null;
    }

    if (this.st.target_id) {
      lookTargetDescriptor.lookObject = level.object_by_id(this.st.target_id);
    }

    if (this.st.target_position) {
      lookTargetDescriptor.lookPosition = this.st.target_position;
    }

    return lookTargetDescriptor;
  }

  /**
   * todo
   */
  public onAnimationUpdate(): void {
    this.state = stateSound;
    this.update();
  }

  /**
   * todo
   */
  public update(): void {
    if (this.state === stateInitial) {
      const cb: IStateManagerCallbackDescriptor = { context: this, callback: this.onAnimationUpdate };
      const target = this.getTarget();

      if (target === null) {
        const anim: EStalkerState = pickSectionFromCondList(registry.actor, this.object, this.st.anim)!;

        setStalkerState(this.object, anim, cb, 0, null, null);
        this.state = stateAnimation;

        return;
      }

      const anim: EStalkerState = pickSectionFromCondList(registry.actor, this.object, this.st.anim)!;

      setStalkerState(this.object, anim, cb, 0, target, null);
      this.state = stateAnimation;
    } else if (this.state === stateAnimation) {
      // Empty.
    } else if (this.state === stateSound) {
      if (this.sndScheduled === true) {
        this.sndStarted = true;
        GlobalSoundManager.getInstance().playSound(this.object.id(), this.st.snd, null, null);
      }

      if (this.animEndSignalled === false) {
        this.animEndSignalled = true;
        this.st.signals!.set("anim_end", true);
      }

      if (this.st.signals!.get("sound_end") || this.st.signals!.get("theme_end")) {
        if (this.soundEndSignalled === false) {
          this.soundEndSignalled = true;
        }
      }

      if (this.soundEndSignalled && this.animEndSignalled) {
        if (this.actionEndSignalled === false) {
          this.st.signals!.set("action_end", true);
          this.actionEndSignalled = true;
        }
      }
    }
  }
}

/**
 * todo
 */
export function initTarget(
  obj: ClientObject,
  targetString: string
): LuaMultiReturn<[Optional<Vector>, Optional<number>, Optional<boolean>]> {
  // todo: Simplify.

  /**
   * todo;
   */
  function parseTarget(targetStr: string): LuaMultiReturn<[Optional<string>, Optional<string>]> {
    const [pos] = string.find(targetStr, ",");

    if (pos !== null) {
      return $multi(string.sub(targetStr, 1, pos - 1), string.sub(targetStr, pos + 1));
    } else {
      return $multi(targetStr, null);
    }
  }

  // todo: Simplify.

  /**
   * todo;
   */
  function parseType(targetStr: string): LuaMultiReturn<[string, string]> {
    const [pos] = string.find(targetStr, "|");

    if (pos === null) {
      instruction(obj, targetStr);
    }

    const targetType = string.sub(targetStr, 1, pos - 1);
    const target = string.sub(targetStr, pos + 1);

    if (target === null || target === "" || targetType === null || targetType === "") {
      instruction(obj, targetStr);
    }

    return $multi(targetType, target);
  }

  let targetPosition: Optional<Vector> = null;
  let targetId: Optional<TNumberId> = null;
  let isTargetInitialized: boolean = false;

  if (targetString === NIL) {
    return $multi(targetPosition, targetId, isTargetInitialized);
  } else if (targetString === null) {
    instruction(obj, "");
  }

  const [targetType, target] = parseType(targetString);

  if (targetType === "story") {
    const [storyId] = parseTarget(target);

    targetId = getObjectIdByStoryId(storyId!);
    isTargetInitialized = true;
  } else if (targetType === "path") {
    const [path, point] = parseTarget(target);

    const pointNumber = tonumber(point)!;

    if (point) {
      targetPosition = new patrol(path!).point(pointNumber);
      isTargetInitialized = true;
    }
  } else if (targetType === "job") {
    const [job, gulag] = parseTarget(target);
    const smartTerrain: SmartTerrain = SimulationBoardManager.getInstance().getSmartTerrainByName(gulag!)!;

    targetId = smartTerrain.getObjectIdByJobId(job!);
    isTargetInitialized = targetId !== null && true;
  } else {
    instruction(obj, targetString);
  }

  return $multi(targetPosition, targetId, isTargetInitialized);
}

/**
 * todo
 */
function instruction(object: ClientObject, data: string): never {
  abort(
    "\nWrong target field for object [%s] in section [%s]!!!\n" +
      "Field [target] supports following:\n" +
      "   target = story | actor or story_id\n" +
      "   target = path  | patrol_path, point_id\n" +
      "   target = job   | job_section, smart_name\n" +
      "Your target field:\n" +
      "   target = %s",
    object.name(),
    registry.objects.get(object.id()).activeSection,
    data
  );
}
