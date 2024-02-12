import { action_base, level, LuabindClass, patrol } from "xray16";

import { EStalkerState, ILookTargetDescriptor, IStateManagerCallbackDescriptor } from "@/engine/core/animation/types";
import { getManager, getObjectIdByStoryId, registry, setStalkerState } from "@/engine/core/database";
import { SimulationManager } from "@/engine/core/managers/simulation/SimulationManager";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { getSmartTerrainObjectIdByJobSection } from "@/engine/core/objects/smart_terrain/job";
import { SmartTerrain } from "@/engine/core/objects/smart_terrain/SmartTerrain";
import { ISchemeRemarkState } from "@/engine/core/schemes/stalker/remark";
import { abort } from "@/engine/core/utils/assertion";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { NIL } from "@/engine/lib/constants/words";
import {
  GameObject,
  ISchemeEventHandler,
  Optional,
  SoundObject,
  TNumberId,
  TStringId,
  Vector,
} from "@/engine/lib/types";

const stateInitial = 0;
const stateAnimation = 1;
const stateSound = 2;
const stateFinish = 3;

/**
 * todo;
 */
@LuabindClass()
export class ActionRemarkActivity extends action_base implements ISchemeEventHandler {
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
  public activate(): void {
    this.st.signals = new LuaTable();
    this.soundEndSignalled = false;
    this.actionEndSignalled = false;
    this.animEndSignalled = false;
    this.animScheduled = true;

    this.sndScheduled = !this.st.sndAnimSync && this.st.snd !== null;
    this.sndStarted = false;

    this.state = stateInitial;
    this.tipsSound = null;
  }

  /**
   * todo
   */
  public getTarget(): Optional<ILookTargetDescriptor> {
    const lookTargetDescriptor: ILookTargetDescriptor = {
      lookObjectId: null,
      lookPosition: null,
    };

    const [targetPosition, targetId, targetInit] = initTarget(this.object, this.st.target);

    this.st.targetPosition = targetPosition;
    this.st.targetId = targetId;
    this.st.targetInit = targetInit;

    if (this.st.targetInit === false) {
      // --printf("target_is_ni!!!l")
      return null;
    }

    if (this.st.targetId) {
      lookTargetDescriptor.lookObjectId = level.object_by_id(this.st.targetId)?.id() as Optional<TNumberId>;
    }

    if (this.st.targetPosition) {
      lookTargetDescriptor.lookPosition = this.st.targetPosition;
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
      const callbackDescriptor: IStateManagerCallbackDescriptor = { context: this, callback: this.onAnimationUpdate };
      const target = this.getTarget();

      if (target === null) {
        const anim: EStalkerState = pickSectionFromCondList(registry.actor, this.object, this.st.anim)!;

        setStalkerState(this.object, anim, callbackDescriptor, 0);
        this.state = stateAnimation;

        return;
      }

      const anim: EStalkerState = pickSectionFromCondList(registry.actor, this.object, this.st.anim)!;

      setStalkerState(this.object, anim, callbackDescriptor, 0, target);
      this.state = stateAnimation;
    } else if (this.state === stateAnimation) {
      // Empty.
    } else if (this.state === stateSound) {
      if (this.sndScheduled === true) {
        this.sndStarted = true;
        getManager(SoundManager).play(this.object.id(), this.st.snd);
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
  object: GameObject,
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
      instruction(object, targetStr);
    }

    const targetType = string.sub(targetStr, 1, pos - 1);
    const target = string.sub(targetStr, pos + 1);

    if (target === null || target === "" || targetType === null || targetType === "") {
      instruction(object, targetStr);
    }

    return $multi(targetType, target);
  }

  let targetPosition: Optional<Vector> = null;
  let targetId: Optional<TNumberId> = null;
  let isTargetInitialized: boolean = false;

  if (targetString === NIL) {
    return $multi(targetPosition, targetId, isTargetInitialized);
  } else if (targetString === null) {
    instruction(object, "");
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
    const [job, smartTerrainName] = parseTarget(target);
    const smartTerrain: SmartTerrain = getManager(SimulationManager).getSmartTerrainByName(smartTerrainName!)!;

    targetId = getSmartTerrainObjectIdByJobSection(smartTerrain, job as TStringId);
    isTargetInitialized = targetId !== null;
  } else {
    instruction(object, targetString);
  }

  return $multi(targetPosition, targetId, isTargetInitialized);
}

/**
 * todo
 */
function instruction(object: GameObject, data: string): never {
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
