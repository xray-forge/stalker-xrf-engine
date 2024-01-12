import { level, patrol } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { getManager, registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { cutsceneConfig } from "@/engine/core/schemes/restrictor/sr_cutscene/CutsceneConfig";
import { effectorSets } from "@/engine/core/schemes/restrictor/sr_cutscene/effectors/camera_effector_sets";
import { CameraEffectorSet } from "@/engine/core/schemes/restrictor/sr_cutscene/effectors/CameraEffectorSet";
import {
  EEffectorState,
  ESceneState,
  ICameraEffectorSetDescriptorItem,
  ISchemeCutsceneState,
} from "@/engine/core/schemes/restrictor/sr_cutscene/sr_cutscene_types";
import { getExtern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { postProcessors } from "@/engine/lib/constants/animation";
import { AnyCallablesModule, GameObject, Optional, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class CutsceneManager extends AbstractSchemeManager<ISchemeCutsceneState> {
  public isUiDisabled: boolean = false;
  public isPostprocess: boolean = false;
  public motionId: TNumberId = 1;
  public motion: Optional<CameraEffectorSet> = null;
  public sceneState: ESceneState = ESceneState.NONE;

  public override activate(): void {
    logger.info("Activate scheme");

    this.sceneState = ESceneState.NONE;
    this.state.signals = new LuaTable();
    this.motion = null;

    this.onZoneEnter();
  }

  public update(): void {
    if (this.motion) {
      this.motion.update();
      if (this.state.signals!.get("cam_effector_stop") !== null) {
        this.motion.stopEffect();
        this.onCutscene();
        this.state.signals!.delete("cam_effector_stop");
      }
    }

    trySwitchToAnotherSection(this.object, this.state);
  }

  /**
   * todo: Description.
   */
  public onZoneEnter(): void {
    logger.info("Zone enter: %s", this.object.name());

    const actor: Optional<GameObject> = registry.actor;

    this.sceneState = ESceneState.RUN;

    getExtern<AnyCallablesModule>("xr_effects").teleport_actor(actor, this.object, [this.state.point, this.state.look]);

    if (this.state.ppEffector !== postProcessors.nil) {
      level.add_pp_effector(this.state.ppEffector, 234, false);
    }

    getManager(ActorInputManager).disableGameUi(false);
    this.isUiDisabled = true;

    const timeHours: number = level.get_time_hours();

    if (this.state.isOutdoor && actor !== null && (timeHours < 6 || timeHours > 21)) {
      this.isPostprocess = true;
      level.add_complex_effector("brighten", 1999);
      // --level.add_pp_effector("brighten.ppe", 1999, true)
    }

    this.motionId = 1;
    this.selectNextMotion();

    cutsceneConfig.objectCutscene = this.object;
    cutsceneConfig.cutsceneState = this.state;
  }

  /**
   * todo;
   */
  public selectNextMotion(): void {
    logger.info("Select next cutscene motion");

    const motion: TName = this.state.cameraEffector!.get(this.motionId);

    if (effectorSets[motion] === null) {
      this.motion = new CameraEffectorSet(
        {
          start: new LuaTable(),
          idle: $fromArray<ICameraEffectorSetDescriptorItem>([
            { anim: motion, looped: false, isGlobalCameraEffect: this.state.isGlobalCameraEffect },
          ]),
          finish: new LuaTable(),
          release: new LuaTable(),
        },
        this.state
      );
    } else {
      this.motion = new CameraEffectorSet(effectorSets[motion], this.state);
    }

    const effect: ICameraEffectorSetDescriptorItem = this.motion.getNextEffector()!;

    this.motion.startEffect(effect);
    this.motionId += 1;
  }

  /**
   * Handle progression of cutscene scenario.
   */
  public override onCutscene(): void {
    logger.info("Cutscene callback: %s", this.object.name());

    const actor: GameObject = registry.actor;

    if (this.motion!.state === EEffectorState.RELEASE) {
      this.motion = null;
      if (this.motionId <= this.state.cameraEffector!.length()) {
        this.selectNextMotion();
      } else {
        if (this.isPostprocess) {
          this.isPostprocess = false;
          level.remove_complex_effector(1999);
        }

        if (this.isUiDisabled) {
          if (!actor.is_talking() && this.state.shouldEnableUiOnEnd) {
            getManager(ActorInputManager).enableGameUi(false);
          } else if (this.state.shouldEnableUiOnEnd) {
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
      this.motion!.isPlaying = false;

      const effect: Optional<ICameraEffectorSetDescriptorItem> = this.motion!.getNextEffector();

      if (effect) {
        this.motion!.startEffect(effect);
      }
    }
  }
}
