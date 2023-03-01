import { action_base, level, patrol, XR_game_object, XR_vector } from "xray16";

import { Optional, StringOptional } from "@/mod/lib/types";
import { registered_smartcovers } from "@/mod/scripts/core/alife/SmartCover";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { GlobalSound } from "@/mod/scripts/core/GlobalSound";
import { ActionSleeperActivity } from "@/mod/scripts/core/schemes/sleeper/actions";
import { set_state } from "@/mod/scripts/core/state_management/StateManager";
import { getStoryObject } from "@/mod/scripts/utils/alife";
import { getParamString, parseCondList, pickSectionFromCondList } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

enum ECoverState {
  FIRE_TARGET = "fire_target",
  FIRE_NO_LOOKOUT_TARGET = "fire_no_lookout_target",
  IDLE_TARGET = "idle_target",
  LOOKOUT_TARGET = "lookout_target",
}

const cover_substate_table: Record<ECoverState, string> = {
  [ECoverState.FIRE_TARGET]: "fire",
  [ECoverState.FIRE_NO_LOOKOUT_TARGET]: "fire",
  [ECoverState.IDLE_TARGET]: "idle",
  [ECoverState.LOOKOUT_TARGET]: "idle",
};

const logger: LuaLogger = new LuaLogger("ActionSmartCoverActivity");

/**
 * todo;
 */
@LuabindClass()
export class ActionSmartCoverActivity extends action_base {
  public readonly st: IStoredObject;
  public initialized: boolean = false;

  public cover_condlist: any;
  public target_path_condlist: any;

  public target_enemy_id: Optional<number> = null;

  public cover_state!: StringOptional<ECoverState>;
  public cover_name!: string;
  public fire_pos!: XR_vector;
  public target_path!: string;

  public constructor(state: IStoredObject) {
    super(null, ActionSleeperActivity.__name);
    this.st = state;
  }

  public override initialize(): void {
    super.initialize();

    this.initialized = true;

    this.activate_scheme();
  }

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

  public activate_scheme(): void {
    this.st.signals = {};

    if (!this.initialized) {
      return;
    }

    const object = this.object;

    object.set_smart_cover_target();

    // --object.set_smart_cover_target_selector()
    this.target_enemy_id = null;

    const [cover_name, used] = getParamString(this.st.cover_name, object);

    this.cover_name = cover_name;

    if (this.cover_name !== this.st.cover_name || used === false) {
      if (registered_smartcovers.get(this.cover_name) === null) {
        abort("There is no smart_cover with name [%s]", this.cover_name);
      }

      // -- ���� � ���������� ����� ����� �������� (�������� ��� �����������, �������)
      set_state(this.object, "smartcover", null, null, null, null);

      this.target_path_condlist = parseCondList(object, this.st.active_section!, "target_path", this.st.target_path);
      this.check_target();

      // --' ���������� �������� ������� ������ ��������� ������ � �����������.
      this.cover_condlist = parseCondList(object, this.st.active_section!, "cover_state", this.st.cover_state);
      this.cover_state = pickSectionFromCondList(registry.actor, object, this.cover_condlist) as ECoverState;
      this.target_selector(this.object);
      this.check_target_selector();

      // -- �������� ����������� � ������������ �������� ������� ������� � ����� � ������������.
      object.idle_min_time(this.st.idle_min_time);
      object.idle_max_time(this.st.idle_max_time);
      object.lookout_min_time(this.st.lookout_min_time);
      object.lookout_max_time(this.st.lookout_max_time);
    }
  }

  public check_target_selector(): void {
    /**
     *   --if object.in_smart_cover() == false {
     *   --    printf("DEFAULT_BEHAVIOUR")
     *   --    return
     *   --}
     */

    if (this.cover_state === "nil") {
      this.object.set_smart_cover_target_selector();
    } else {
      this.object.set_smart_cover_target_selector((object) => this.target_selector(object), this);
    }
  }

  public check_target(): boolean {
    const object = this.object;

    const target_path_section = pickSectionFromCondList(registry.actor, this.object, this.target_path_condlist);

    if (target_path_section !== "nil" && target_path_section !== null) {
      const [target_path, used] = getParamString(target_path_section, object);

      this.target_path = target_path;

      if (this.target_path !== "nil") {
        if (level.patrol_path_exists(this.target_path)) {
          // --printf("target_selector:using fire_point[%s] for npc[%s]!!!", this.target_path, this.object.name())
          object.set_smart_cover_target(new patrol(this.target_path).point(0));
          this.fire_pos = new patrol(this.target_path).point(0);

          return true;
        } else {
          abort("There is no patrol path [%s] for npc [%s]", this.target_path, object.name());
        }
      }
    } else if (this.st.target_enemy !== null) {
      // --printf("setting target_enemy [actor] for npc[%s]", object.name())
      const storyObject = getStoryObject(this.st.target_enemy);

      this.target_enemy_id = storyObject && storyObject.id();

      if (this.target_enemy_id !== null && level.object_by_id(this.target_enemy_id)!.alive()) {
        object.set_smart_cover_target(level.object_by_id(this.target_enemy_id)!);
        this.fire_pos = level.object_by_id(this.target_enemy_id)!.position();

        return true;
      }
    } else if (this.st.target_position !== null) {
      object.set_smart_cover_target(this.st.target_position);
      this.fire_pos = this.st.target_position;

      return true;
    }

    return false;
  }

  public override execute(): void {
    super.execute();

    const need_cover_state = pickSectionFromCondList(registry.actor, this.object, this.cover_condlist) as ECoverState;

    if (
      need_cover_state === ("default_behaviour" as any) ||
      cover_substate_table[this.cover_state as ECoverState] !== cover_substate_table[need_cover_state]
    ) {
      this.cover_state = need_cover_state;
    }

    this.check_target_selector();

    if (this.target_enemy_id !== null && this.object.in_smart_cover()) {
      if (
        level.object_by_id(this.target_enemy_id) &&
        this.object.in_current_loophole_fov(level.object_by_id(this.target_enemy_id)!.position()) === true
      ) {
        this.st.signals["enemy_in_fov"] = true;
        this.st.signals["enemy_not_in_fov"] = null;
      } else {
        this.st.signals["enemy_in_fov"] = null;
        this.st.signals["enemy_not_in_fov"] = true;
      }
    }

    if (this.st.sound_idle !== null) {
      GlobalSound.set_sound_play(this.object.id(), this.st.sound_idle, null, null);
    }
  }

  public override finalize(): void {
    this.initialized = false;
    super.finalize();
  }

  public position_riched(): boolean {
    return this.object.in_smart_cover();
  }

  public deactivate(): void {
    this.st.cover_name = null;
    this.st.loophole_name = null;
  }
}
