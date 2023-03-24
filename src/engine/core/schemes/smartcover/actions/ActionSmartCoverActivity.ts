import { action_base, level, LuabindClass, patrol, XR_game_object, XR_vector } from "xray16";

import { getObjectByStoryId, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/state";
import { setStalkerState } from "@/engine/core/objects/state/StalkerStateManager";
import { ActionSleeperActivity } from "@/engine/core/schemes/sleeper/actions";
import {
  cover_substate_table,
  ECoverState,
  ISchemeSmartCoverState,
} from "@/engine/core/schemes/smartcover/ISchemeSmartCoverState";
import { abort } from "@/engine/core/utils/assertion";
import { getParamString, pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { parseConditionsList } from "@/engine/core/utils/parse";
import { NIL } from "@/engine/lib/constants/words";
import { Optional, StringOptional, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionSmartCoverActivity extends action_base {
  public readonly state: ISchemeSmartCoverState;
  public initialized: boolean = false;

  public cover_condlist: any;
  public target_path_condlist: any;

  public target_enemy_id: Optional<number> = null;

  public cover_state!: StringOptional<ECoverState>;
  public cover_name!: string;
  public fire_pos!: XR_vector;
  public target_path!: string;

  /**
   * todo: Description.
   */
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
  public target_selector(obj: XR_game_object): void {
    if (!obj.alive()) {
      return;
    }

    if (this.cover_state === ECoverState.IDLE_TARGET) {
      obj.set_smart_cover_target_idle();
    } else if (this.cover_state === ECoverState.LOOKOUT_TARGET) {
      this.check_target();
      obj.set_smart_cover_target_lookout();
    } else if (this.cover_state === ECoverState.FIRE_TARGET) {
      obj.set_smart_cover_target_fire();
    } else if (this.cover_state === ECoverState.FIRE_NO_LOOKOUT_TARGET) {
      this.check_target();
      obj.set_smart_cover_target_fire_no_lookout();
    } else {
      this.check_target();
      obj.set_smart_cover_target_default(true);
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

    const object = this.object;

    object.set_smart_cover_target();

    // --object.set_smart_cover_target_selector()
    this.target_enemy_id = null;

    const [cover_name, used] = getParamString(this.state.cover_name as string, object);

    this.cover_name = cover_name;

    if (this.cover_name !== this.state.cover_name || used === false) {
      if (registry.smartCovers.get(this.cover_name) === null) {
        abort("There is no smart_cover with name [%s]", this.cover_name);
      }

      // -- ���� � ���������� ����� ����� �������� (�������� ��� �����������, �������)
      setStalkerState(this.object, EStalkerState.SMART_COVER, null, null, null, null);

      this.target_path_condlist = parseConditionsList(this.state.target_path);
      this.check_target();

      this.cover_condlist = parseConditionsList(this.state.cover_state);
      this.cover_state = pickSectionFromCondList(registry.actor, object, this.cover_condlist) as ECoverState;
      this.target_selector(this.object);
      this.check_target_selector();

      object.idle_min_time(this.state.idle_min_time);
      object.idle_max_time(this.state.idle_max_time);
      object.lookout_min_time(this.state.lookout_min_time);
      object.lookout_max_time(this.state.lookout_max_time);
    }
  }

  /**
   * todo: Description.
   */
  public check_target_selector(): void {
    /**
     *   --if object.in_smart_cover() == false {
     *   --    printf("DEFAULT_BEHAVIOUR")
     *   --    return
     *   --}
     */

    if (this.cover_state === NIL) {
      this.object.set_smart_cover_target_selector();
    } else {
      this.object.set_smart_cover_target_selector((object) => this.target_selector(object), this);
    }
  }

  /**
   * todo: Description.
   */
  public check_target(): boolean {
    const object = this.object;

    const target_path_section = pickSectionFromCondList(registry.actor, this.object, this.target_path_condlist);

    if (target_path_section !== NIL && target_path_section !== null) {
      const [target_path, used] = getParamString(target_path_section, object);

      this.target_path = target_path;

      if (this.target_path !== NIL) {
        if (level.patrol_path_exists(this.target_path)) {
          // --printf("target_selector:using fire_point[%s] for npc[%s]!!!", this.target_path, this.object.name())
          object.set_smart_cover_target(new patrol(this.target_path).point(0));
          this.fire_pos = new patrol(this.target_path).point(0);

          return true;
        } else {
          abort("There is no patrol path [%s] for npc [%s]", this.target_path, object.name());
        }
      }
    } else if (this.state.target_enemy !== null) {
      const storyObject: Optional<XR_game_object> = getObjectByStoryId(this.state.target_enemy);

      this.target_enemy_id = storyObject?.id() as Optional<TNumberId>;

      if (this.target_enemy_id !== null && level.object_by_id(this.target_enemy_id)!.alive()) {
        object.set_smart_cover_target(level.object_by_id(this.target_enemy_id)!);
        this.fire_pos = level.object_by_id(this.target_enemy_id)!.position();

        return true;
      }
    } else if (this.state.target_position !== null) {
      object.set_smart_cover_target(this.state.target_position);
      this.fire_pos = this.state.target_position;

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
      this.cover_condlist
    ) as ECoverState;

    if (
      needCoverState === ("default_behaviour" as any) ||
      cover_substate_table[this.cover_state as ECoverState] !== cover_substate_table[needCoverState]
    ) {
      this.cover_state = needCoverState;
    }

    this.check_target_selector();

    if (this.target_enemy_id !== null && this.object.in_smart_cover()) {
      if (
        level.object_by_id(this.target_enemy_id) &&
        this.object.in_current_loophole_fov(level.object_by_id(this.target_enemy_id)!.position()) === true
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
  public position_riched(): boolean {
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
