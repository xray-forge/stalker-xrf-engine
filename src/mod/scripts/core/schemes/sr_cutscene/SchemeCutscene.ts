import { level, patrol, XR_game_object, XR_ini_file } from "xray16";

import { post_processors } from "@/mod/globals/animation/post_processors";
import { AnyCallablesModule, EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { issueEvent } from "@/mod/scripts/core/schemes/issueEvent";
import { EEffectorState, effector_sets } from "@/mod/scripts/core/schemes/sr_cutscene/cam_effector_sets";
import { CamEffectorSet } from "@/mod/scripts/core/schemes/sr_cutscene/CamEffectorSet";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import {
  cfg_get_switch_conditions,
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  parseNames,
} from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionCutscene");

let object_cutscene: Optional<XR_game_object> = null;
let storage_scene: Optional<IStoredObject> = null;

/**
 * todo;
 */
export class SchemeCutscene extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_CUTSCENE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name(), scheme, section);

    const new_action: SchemeCutscene = new SchemeCutscene(object, storage);

    storage.cutscene_action = new_action;
    subscribeActionForEvents(object, storage, new_action);
  }

  public static override setScheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, object);
    st.point = getConfigString(ini, section, "point", object, true, "", "none");
    st.look = getConfigString(ini, section, "look", object, true, "", "none");
    st.global_cameffect = getConfigBoolean(ini, section, "global_cameffect", object, false, false);
    st.pp_effector = getConfigString(ini, section, "pp_effector", object, false, "", "nil") + ".ppe";
    st.cam_effector = parseNames(getConfigString(ini, section, "cam_effector", object, true, ""));
    st.fov = getConfigNumber(ini, section, "fov", object, true);
    st.enable_ui_on_end = getConfigBoolean(ini, section, "enable_ui_on_end", object, false, true);
    st.outdoor = getConfigBoolean(ini, section, "outdoor", object, false, false);
  }

  public static onCutsceneEnd(): void {
    issueEvent(object_cutscene!, storage_scene!, "cutscene_callback");
  }

  public ui_disabled: boolean;
  public postprocess: boolean;
  public motion_id: number;
  public motion: Optional<CamEffectorSet> = null;
  public sceneState!: string;

  public constructor(object: XR_game_object, storage: IStoredObject) {
    super(object, storage);

    logger.info("Init new cutscene:", object.name());

    this.ui_disabled = false;
    this.motion_id = 1;
    this.postprocess = false;
  }

  public override resetScheme(): void {
    this.sceneState = "";
    this.state.signals = {};
    this.motion = null;

    this.zone_enter();
  }

  public override update(delta: number): void {
    const sceneState = this.sceneState;
    // --    if(state~="run") then
    // --        this:zone_enter()
    // --    end

    if (this.motion) {
      this.motion.update();
      if (this.state.signals["cam_effector_stop"] !== null) {
        this.motion.stop_effect();
        this.cutscene_callback();
        this.state.signals["cam_effector_stop"] = null;
      }
    }

    if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
      return;
    }
  }

  public zone_enter(): void {
    logger.info("Zone enter:", this.object.name());

    const actor: Optional<XR_game_object> = registry.actor;

    this.sceneState = "run";

    get_global<AnyCallablesModule>("xr_effects").teleport_actor(actor, this.object, [
      this.state.point,
      this.state.look,
    ]);

    if (this.state.pp_effector !== post_processors.nil) {
      level.add_pp_effector(this.state.pp_effector, 234, false);
    }

    get_global<AnyCallablesModule>("xr_effects").disable_ui(actor, null);
    this.ui_disabled = true;

    const time_hours: number = level.get_time_hours();

    if (this.state.outdoor && actor !== null && (time_hours < 6 || time_hours > 21)) {
      this.postprocess = true;
      level.add_complex_effector("brighten", 1999);
      // --level.add_pp_effector("brighten.ppe", 1999, true)
    }

    this.motion_id = 1;
    this.select_next_motion();

    object_cutscene = this.object;
    storage_scene = this.state;
  }

  public select_next_motion(): void {
    const motion = this.state.cam_effector!.get(this.motion_id);

    if (effector_sets[motion] === null) {
      this.motion = new CamEffectorSet(
        {
          start: new LuaTable(),
          idle: [{ anim: motion, looped: false, global_cameffect: this.state.global_cameffect }] as any,
          finish: new LuaTable(),
          release: new LuaTable(),
        },
        this.state
      );
    } else {
      this.motion = new CamEffectorSet(effector_sets[motion], this.state);
    }

    const effect = this.motion.select_effect()!;

    this.motion!.start_effect(effect);

    this.motion_id = this.motion_id + 1;
  }

  public cutscene_callback(): void {
    logger.info("Cutscene callback:", this.object.name());

    const actor: XR_game_object = registry.actor;

    if (this.motion!.state === EEffectorState.RELEASE) {
      this.motion = null;
      if (this.motion_id <= this.state.cam_effector!.length()) {
        this.select_next_motion();
      } else {
        if (this.postprocess) {
          this.postprocess = false;
          level.remove_complex_effector(1999);
        }

        if (this.ui_disabled) {
          if (!actor.is_talking() && this.state.enable_ui_on_end) {
            get_global<AnyCallablesModule>("xr_effects").enable_ui(XR_game_object, null);
          } else if (this.state.enable_ui_on_end) {
            level.enable_input();
          }

          actor.set_actor_direction(
            -new patrol(this.state.look).point(0).sub(new patrol(this.state.point).point(0)).getH()
          );
          this.ui_disabled = false;
          this.state.signals["cameff_end"] = true;
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
