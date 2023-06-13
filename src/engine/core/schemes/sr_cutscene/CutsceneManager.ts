import { level, patrol } from "xray16";

import { registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/interface";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/base/utils/trySwitchToAnotherSection";
import {
  EEffectorState,
  effectorSets,
  ICamEffectorSetDescriptorItem,
} from "@/engine/core/schemes/sr_cutscene/cam_effector_sets";
import { CamEffectorSet } from "@/engine/core/schemes/sr_cutscene/CamEffectorSet";
import { ISchemeCutsceneState } from "@/engine/core/schemes/sr_cutscene/ISchemeCutsceneState";
import { getExtern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { postProcessors } from "@/engine/lib/constants/animation/post_processors";
import { AnyCallablesModule, ClientObject, Optional, TName } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class CutsceneManager extends AbstractSchemeManager<ISchemeCutsceneState> {
  public static objectCutscene: Optional<ClientObject> = null;
  public static storageScene: Optional<ISchemeCutsceneState> = null;

  public isUiDisabled: boolean = false;
  public postprocess: boolean = false;
  public motionId: number = 1;
  public motion: Optional<CamEffectorSet> = null;
  public sceneState!: string;

  public constructor(object: ClientObject, state: ISchemeCutsceneState) {
    super(object, state);

    logger.info("Init new cutscene:", object.name());
  }

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    this.sceneState = "";
    this.state.signals = new LuaTable();
    this.motion = null;

    this.zone_enter();
  }

  /**
   * todo: Description.
   */
  public override update(delta: number): void {
    if (this.motion) {
      this.motion.update();
      if (this.state.signals!.get("cam_effector_stop") !== null) {
        this.motion.stopEffect();
        this.onCutscene();
        this.state.signals!.delete("cam_effector_stop");
      }
    }

    if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
      return;
    }
  }

  /**
   * todo: Description.
   */
  public zone_enter(): void {
    logger.info("Zone enter:", this.object.name());

    const actor: Optional<ClientObject> = registry.actor;

    this.sceneState = "run";

    getExtern<AnyCallablesModule>("xr_effects").teleport_actor(actor, this.object, [this.state.point, this.state.look]);

    if (this.state.pp_effector !== postProcessors.nil) {
      level.add_pp_effector(this.state.pp_effector, 234, false);
    }

    ActorInputManager.getInstance().disableGameUi(actor, false);
    this.isUiDisabled = true;

    const timeHours: number = level.get_time_hours();

    if (this.state.outdoor && actor !== null && (timeHours < 6 || timeHours > 21)) {
      this.postprocess = true;
      level.add_complex_effector("brighten", 1999);
      // --level.add_pp_effector("brighten.ppe", 1999, true)
    }

    this.motionId = 1;
    this.selectNextMotion();

    CutsceneManager.objectCutscene = this.object;
    CutsceneManager.storageScene = this.state;
  }

  public selectNextMotion(): void {
    const motion: TName = this.state.cam_effector!.get(this.motionId);

    if (effectorSets[motion] === null) {
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
      this.motion = new CamEffectorSet(effectorSets[motion], this.state);
    }

    const effect: ICamEffectorSetDescriptorItem = this.motion.selectEffect()!;

    this.motion!.startEffect(effect);

    this.motionId = this.motionId + 1;
  }

  public override onCutscene(): void {
    logger.info("Cutscene callback:", this.object.name());

    const actor: ClientObject = registry.actor;

    if (this.motion!.state === EEffectorState.RELEASE) {
      this.motion = null;
      if (this.motionId <= this.state.cam_effector!.length()) {
        this.selectNextMotion();
      } else {
        if (this.postprocess) {
          this.postprocess = false;
          level.remove_complex_effector(1999);
        }

        if (this.isUiDisabled) {
          if (!actor.is_talking() && this.state.enable_ui_on_end) {
            ActorInputManager.getInstance().enableGameUi(false);
          } else if (this.state.enable_ui_on_end) {
            level.enable_input();
          }

          actor.set_actor_direction(
            -new patrol(this.state.look).point(0).sub(new patrol(this.state.point).point(0)).getH()
          );
          this.isUiDisabled = false;
          this.state.signals!.set("cameff_end", true);
        }
      }
    } else {
      this.motion!.playing = false;

      const effect: Optional<ICamEffectorSetDescriptorItem> = this.motion!.selectEffect();

      if (effect) {
        this.motion!.startEffect(effect);
      }
    }
  }
}
