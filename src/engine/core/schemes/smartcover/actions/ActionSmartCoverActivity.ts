import { action_base, level, LuabindClass, patrol } from "xray16";

import { getObjectByStoryId, registry, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/state";
import { ActionSleeperActivity } from "@/engine/core/schemes/sleeper/actions";
import {
  COVER_SUBSTATE_TABLE,
  ECoverState,
  ISchemeSmartCoverState,
} from "@/engine/core/schemes/smartcover/ISchemeSmartCoverState";
import { abort } from "@/engine/core/utils/assertion";
import { getParamString, pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList, TConditionList } from "@/engine/core/utils/parse";
import { NIL } from "@/engine/lib/constants/words";
import { ClientObject, Optional, StringOptional, TName, TNumberId, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionSmartCoverActivity extends action_base {
  public readonly state: ISchemeSmartCoverState;
  public initialized: boolean = false;

  public coverСondlist!: TConditionList;
  public targetPathCondlist!: TConditionList;

  public targetEnemyId: Optional<TNumberId> = null;

  public coverState!: StringOptional<ECoverState>;
  public coverName!: string;
  public firePosition!: Vector;
  public targetPath!: string;

  public constructor(state: ISchemeSmartCoverState) {
    super(null, ActionSleeperActivity.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.initialized = true;

    this.activateScheme();
  }

  /**
   * todo: Description.
   */
  public targetSelector(object: ClientObject): void {
    if (!object.alive()) {
      return;
    }

    if (this.coverState === ECoverState.IDLE_TARGET) {
      object.set_smart_cover_target_idle();
    } else if (this.coverState === ECoverState.LOOKOUT_TARGET) {
      this.checkTarget();
      object.set_smart_cover_target_lookout();
    } else if (this.coverState === ECoverState.FIRE_TARGET) {
      object.set_smart_cover_target_fire();
    } else if (this.coverState === ECoverState.FIRE_NO_LOOKOUT_TARGET) {
      this.checkTarget();
      object.set_smart_cover_target_fire_no_lookout();
    } else {
      this.checkTarget();
      object.set_smart_cover_target_default(true);
    }
  }

  /**
   * todo: Description.
   */
  public activateScheme(): void {
    this.state.signals = new LuaTable();

    if (!this.initialized) {
      return;
    }

    this.object.set_smart_cover_target();

    // --object.set_smart_cover_target_selector()
    this.targetEnemyId = null;

    const [coverName, used] = getParamString(this.state.cover_name as string);

    this.coverName = coverName;

    if (this.coverName !== this.state.cover_name || used === false) {
      if (registry.smartCovers.get(this.coverName) === null) {
        abort("There is no smart_cover with name [%s]", this.coverName);
      }

      setStalkerState(this.object, EStalkerState.SMART_COVER, null, null, null, null);

      this.targetPathCondlist = parseConditionsList(this.state.target_path);
      this.checkTarget();

      this.coverСondlist = parseConditionsList(this.state.cover_state);
      this.coverState = pickSectionFromCondList(registry.actor, this.object, this.coverСondlist) as ECoverState;
      this.targetSelector(this.object);
      this.checkTargetSelector();

      this.object.idle_min_time(this.state.idle_min_time);
      this.object.idle_max_time(this.state.idle_max_time);
      this.object.lookout_min_time(this.state.lookout_min_time);
      this.object.lookout_max_time(this.state.lookout_max_time);
    }
  }

  /**
   * todo: Description.
   */
  public checkTargetSelector(): void {
    /**
     *   --if object.in_smart_cover() == false {
     *   --    printf("DEFAULT_BEHAVIOUR")
     *   --    return
     *   --}
     */

    if (this.coverState === NIL) {
      this.object.set_smart_cover_target_selector();
    } else {
      this.object.set_smart_cover_target_selector((object) => this.targetSelector(object), this);
    }
  }

  /**
   * todo: Description.
   */
  public checkTarget(): boolean {
    const object: ClientObject = this.object;

    const targetPathSection: Optional<TName> = pickSectionFromCondList(
      registry.actor,
      this.object,
      this.targetPathCondlist
    );

    if (targetPathSection !== NIL && targetPathSection !== null) {
      const [targetPath, used] = getParamString(targetPathSection);

      this.targetPath = targetPath;

      if (this.targetPath !== NIL) {
        if (level.patrol_path_exists(this.targetPath)) {
          // --printf("target_selector:using fire_point[%s] for npc[%s]!!!", this.target_path, this.object.name())
          object.set_smart_cover_target(new patrol(this.targetPath).point(0));
          this.firePosition = new patrol(this.targetPath).point(0);

          return true;
        } else {
          abort("There is no patrol path [%s] for npc [%s]", this.targetPath, object.name());
        }
      }
    } else if (this.state.target_enemy !== null) {
      const storyObject: Optional<ClientObject> = getObjectByStoryId(this.state.target_enemy);

      this.targetEnemyId = storyObject?.id() as Optional<TNumberId>;

      if (this.targetEnemyId !== null && level.object_by_id(this.targetEnemyId)!.alive()) {
        object.set_smart_cover_target(level.object_by_id(this.targetEnemyId)!);
        this.firePosition = level.object_by_id(this.targetEnemyId)!.position();

        return true;
      }
    } else if (this.state.target_position !== null) {
      object.set_smart_cover_target(this.state.target_position);
      this.firePosition = this.state.target_position;

      return true;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    const needCoverState: ECoverState = pickSectionFromCondList(
      registry.actor,
      this.object,
      this.coverСondlist
    ) as ECoverState;

    if (
      needCoverState === ("default_behaviour" as any) ||
      COVER_SUBSTATE_TABLE[this.coverState as ECoverState] !== COVER_SUBSTATE_TABLE[needCoverState]
    ) {
      this.coverState = needCoverState;
    }

    this.checkTargetSelector();

    if (this.targetEnemyId !== null && this.object.in_smart_cover()) {
      if (
        level.object_by_id(this.targetEnemyId) &&
        this.object.in_current_loophole_fov(level.object_by_id(this.targetEnemyId)!.position()) === true
      ) {
        this.state.signals!.set("enemy_in_fov", true);
        this.state.signals!.delete("enemy_not_in_fov");
      } else {
        this.state.signals!.delete("enemy_in_fov");
        this.state.signals!.set("enemy_not_in_fov", true);
      }
    }

    if (this.state.sound_idle !== null) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), this.state.sound_idle, null, null);
    }
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    this.initialized = false;
    super.finalize();
  }

  /**
   * todo: Description.
   */
  public isPositionReached(): boolean {
    return this.object.in_smart_cover();
  }

  /**
   * todo: Description.
   */
  public deactivate(): void {
    this.state.cover_name = null;
    this.state.loophole_name = null;
  }
}
