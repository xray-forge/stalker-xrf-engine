import { action_base, level, LuabindClass, patrol } from "xray16";

import { ESmartCoverState, EStalkerState } from "@/engine/core/animation/types/state_types";
import { getManager, getObjectByStoryId, registry, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import {
  COVER_SUBSTATE_TABLE,
  ISchemeSmartCoverState,
} from "@/engine/core/schemes/stalker/smartcover/smartcover_types";
import { abort } from "@/engine/core/utils/assertion";
import { parseConditionsList, pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { NIL } from "@/engine/lib/constants/words";
import {
  GameObject,
  ISchemeEventHandler,
  Optional,
  StringOptional,
  TName,
  TNumberId,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action to handle hiding in smart covers.
 */
@LuabindClass()
export class ActionSmartCoverActivity extends action_base implements ISchemeEventHandler {
  public readonly state: ISchemeSmartCoverState;
  public initialized: boolean = false;

  public coverСondlist!: TConditionList;
  public targetPathCondlist!: TConditionList;

  public targetEnemyId: Optional<TNumberId> = null;

  public coverState!: StringOptional<ESmartCoverState>;
  public coverName!: string;
  public firePosition!: Vector;
  public targetPath!: string;

  public constructor(state: ISchemeSmartCoverState) {
    super(null, ActionSmartCoverActivity.__name);
    this.state = state;
  }

  public override initialize(): void {
    super.initialize();

    this.initialized = true;

    this.activate();
  }

  /**
   * todo: Description.
   */
  public targetSelector(object: GameObject): void {
    if (!object.alive()) {
      return;
    }

    if (this.coverState === ESmartCoverState.IDLE_TARGET) {
      object.set_smart_cover_target_idle();
    } else if (this.coverState === ESmartCoverState.LOOKOUT_TARGET) {
      this.checkTarget();
      object.set_smart_cover_target_lookout();
    } else if (this.coverState === ESmartCoverState.FIRE_TARGET) {
      object.set_smart_cover_target_fire();
    } else if (this.coverState === ESmartCoverState.FIRE_NO_LOOKOUT_TARGET) {
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
  public activate(): void {
    this.state.signals = new LuaTable();

    if (!this.initialized) {
      return;
    }

    this.object.set_smart_cover_target();

    // --object.set_smart_cover_target_selector()
    this.targetEnemyId = null;

    this.coverName = this.state.coverName as string;

    if (registry.smartCovers.get(this.coverName) === null) {
      abort("There is no smart_cover with name [%s]", this.coverName);
    }

    setStalkerState(this.object, EStalkerState.SMART_COVER, null, null, null, null);

    this.targetPathCondlist = parseConditionsList(this.state.targetPath);
    this.checkTarget();

    this.coverСondlist = parseConditionsList(this.state.coverState);
    this.coverState = pickSectionFromCondList(registry.actor, this.object, this.coverСondlist) as ESmartCoverState;
    this.targetSelector(this.object);
    this.checkTargetSelector();

    this.object.idle_min_time(this.state.idleMinTime);
    this.object.idle_max_time(this.state.idleMaxTime);
    this.object.lookout_min_time(this.state.lookoutMinTime);
    this.object.lookout_max_time(this.state.lookoutMaxTime);
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
    const object: GameObject = this.object;

    const targetPathSection: Optional<TName> = pickSectionFromCondList(
      registry.actor,
      this.object,
      this.targetPathCondlist
    );

    if (targetPathSection !== NIL && targetPathSection !== null) {
      this.targetPath = targetPathSection;

      if (this.targetPath !== NIL) {
        if (level.patrol_path_exists(this.targetPath)) {
          object.set_smart_cover_target(new patrol(this.targetPath).point(0));
          this.firePosition = new patrol(this.targetPath).point(0);

          return true;
        } else {
          abort("There is no patrol path [%s] for object [%s].", this.targetPath, object.name());
        }
      }
    } else if (this.state.targetEnemy !== null) {
      const storyObject: Optional<GameObject> = getObjectByStoryId(this.state.targetEnemy);

      this.targetEnemyId = storyObject?.id() as Optional<TNumberId>;

      if (this.targetEnemyId !== null && level.object_by_id(this.targetEnemyId)!.alive()) {
        object.set_smart_cover_target(level.object_by_id(this.targetEnemyId)!);
        this.firePosition = level.object_by_id(this.targetEnemyId)!.position();

        return true;
      }
    } else if (this.state.targetPosition !== null) {
      object.set_smart_cover_target(this.state.targetPosition);
      this.firePosition = this.state.targetPosition;

      return true;
    }

    return false;
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    const needCoverState: ESmartCoverState = pickSectionFromCondList(
      registry.actor,
      this.object,
      this.coverСondlist
    ) as ESmartCoverState;

    if (
      needCoverState === ("default_behaviour" as ESmartCoverState) ||
      COVER_SUBSTATE_TABLE[this.coverState as ESmartCoverState] !== COVER_SUBSTATE_TABLE[needCoverState]
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

    if (this.state.soundIdle !== null) {
      getManager(GlobalSoundManager).playSound(this.object.id(), this.state.soundIdle, null, null);
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
    this.state.coverName = null;
    this.state.loopholeName = null;
  }
}
