import { level, patrol, XR_game_object, XR_ini_file } from "xray16";

import { animations } from "@/mod/globals/animations";
import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { EEffectorState, effector_sets } from "@/mod/scripts/cutscenes/cam_effector_sets";
import { CamEffectorSet } from "@/mod/scripts/cutscenes/CamEffectorSet";
import { getConfigBoolean, getConfigNumber, getConfigString, parseNames } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionCutscene");

let object_cutscene: Optional<XR_game_object> = null;
let storage_scene: Optional<IStoredObject> = null;

export class ActionCutscene {
  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    storage: IStoredObject
  ): void {
    log.info("Add cutscene to binder:", npc.name(), scheme, section);

    const new_action = new ActionCutscene(npc, storage);

    storage.cutscene_action = new_action;
    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(npc, storage, new_action);
  }

  public static set_scheme(
    obj: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    gulag_name: string
  ): void {
    const st = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(obj, ini, scheme, section);

    st.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, obj);

    st.point = getConfigString(ini, section, "point", obj, true, "", "none");
    st.look = getConfigString(ini, section, "look", obj, true, "", "none");
    st.global_cameffect = getConfigBoolean(ini, section, "global_cameffect", obj, false, false);
    st.pp_effector = getConfigString(ini, section, "pp_effector", obj, false, "", "nil") + ".ppe";
    st.cam_effector = parseNames(getConfigString(ini, section, "cam_effector", obj, true, ""));
    st.fov = getConfigNumber(ini, section, "fov", obj, true);

    st.enable_ui_on_end = getConfigBoolean(ini, section, "enable_ui_on_end", obj, false, true);
    st.outdoor = getConfigBoolean(ini, section, "outdoor", obj, false, false);
  }

  public static onCutsceneEnd(): void {
    get_global<AnyCallablesModule>("xr_logic").issue_event(object_cutscene, storage_scene, "cutscene_callback");
  }

  public readonly object: XR_game_object;
  public readonly st: IStoredObject;
  public ui_disabled: boolean;
  public postprocess: boolean;
  public motion_id: number;
  public motion: Optional<CamEffectorSet> = null;
  public state!: string;

  public constructor(object: XR_game_object, storage: IStoredObject) {
    log.info("Init new cutscene:", object.name());

    this.object = object;
    this.st = storage;
    this.ui_disabled = false;
    this.motion_id = 1;
    this.postprocess = false;
  }

  public reset_scheme(): void {
    this.state = "";
    this.st.signals = {};
    this.motion = null;

    this.zone_enter();
  }

  public update(delta: number): void {
    const state = this.state;
    // --    if(state~="run") then
    // --        this:zone_enter()
    // --    end

    if (this.motion) {
      this.motion.update();
      if (this.st.signals["cam_effector_stop"] !== null) {
        this.motion.stop_effect();
        this.cutscene_callback();
        this.st.signals["cam_effector_stop"] = null;
      }
    }

    if (get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.st, getActor())) {
      return;
    }
  }

  public zone_enter(): void {
    log.info("Zone enter:", this.object.name());

    const actor: Optional<XR_game_object> = getActor();

    this.state = "run";

    get_global<AnyCallablesModule>("xr_effects").teleport_actor(actor, this.object, [this.st.point, this.st.look]);

    if (this.st.pp_effector !== animations.nil) {
      level.add_pp_effector(this.st.pp_effector, 234, false);
    }

    get_global<AnyCallablesModule>("xr_effects").disable_ui(actor, null);
    this.ui_disabled = true;

    const time_hours: number = level.get_time_hours();

    if (this.st.outdoor && actor !== null && (time_hours < 6 || time_hours > 21)) {
      this.postprocess = true;
      level.add_complex_effector("brighten", 1999);
      // --level.add_pp_effector("brighten.ppe", 1999, true)
    }

    this.motion_id = 1;
    this.select_next_motion();

    object_cutscene = this.object;
    storage_scene = this.st;
  }

  public select_next_motion(): void {
    const motion = this.st.cam_effector!.get(this.motion_id);

    if (effector_sets[motion] === null) {
      this.motion = new CamEffectorSet(
        {
          start: new LuaTable(),
          idle: [{ anim: motion, looped: false, global_cameffect: this.st.global_cameffect }] as any,
          finish: new LuaTable(),
          release: new LuaTable()
        },
        this.st
      );
    } else {
      this.motion = new CamEffectorSet(effector_sets[motion], this.st);
    }

    const effect = this.motion.select_effect()!;

    this.motion!.start_effect(effect);

    this.motion_id = this.motion_id + 1;
  }

  public cutscene_callback(): void {
    log.info("Cutscene callback:", this.object.name());

    const actor: XR_game_object = getActor()!;

    if (this.motion!.state == EEffectorState.RELEASE) {
      this.motion = null;
      if (this.motion_id <= this.st.cam_effector!.length()) {
        this.select_next_motion();
      } else {
        if (this.postprocess) {
          this.postprocess = false;
          level.remove_complex_effector(1999);
        }

        if (this.ui_disabled) {
          if (!actor.is_talking() && this.st.enable_ui_on_end) {
            get_global<AnyCallablesModule>("xr_effects").enable_ui(XR_game_object, null);
          } else if (this.st.enable_ui_on_end) {
            level.enable_input();
          }

          actor.set_actor_direction(-new patrol(this.st.look).point(0).sub(new patrol(this.st.point).point(0)).getH());
          this.ui_disabled = false;
          this.st.signals["cameff_end"] = true;
        }
      }
    } else {
      this.motion!.playing = false;

      const eff = this.motion!.select_effect();

      if (eff) {
        this.motion!.start_effect(eff);
      }
    }
  }
}
