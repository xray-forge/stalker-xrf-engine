import { level, patrol } from "xray16";

import { registry } from "@/engine/core/database";
import { ActorInputManager } from "@/engine/core/managers/actor";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { CamEffectorSet } from "@/engine/core/schemes/restrictor/sr_cutscene/effectors/CamEffectorSet";
import {
  effectorSets,
  ICamEffectorSetDescriptorItem,
} from "@/engine/core/schemes/restrictor/sr_cutscene/effectors/camera_effector_sets";
import {
  EEffectorState,
  ESceneState,
  ISchemeCutsceneState,
} from "@/engine/core/schemes/restrictor/sr_cutscene/ISchemeCutsceneState";
import { getExtern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { postProcessors } from "@/engine/lib/constants/animation";
import { AnyCallablesModule, ClientObject, Optional, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class CutsceneManager extends AbstractSchemeManager<ISchemeCutsceneState> {
  public static objectCutscene: Optional<ClientObject> = null;
  public static storageScene: Optional<ISchemeCutsceneState> = null;

  public isUiDisabled: boolean = false;
  public isPostprocess: boolean = false;
  public motionId: TNumberId = 1;
  public motion: Optional<CamEffectorSet> = null;
  public sceneState: ESceneState = ESceneState.NONE;

  public override activate(): void {
    logger.info("Reset scheme");

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

    if (trySwitchToAnotherSection(this.object, this.state)) {
      return;
    }
  }

  /**
   * todo: Description.
   */
  public onZoneEnter(): void {
    logger.info("Zone enter:", this.object.name());

    const actor: Optional<ClientObject> = registry.actor;

    this.sceneState = ESceneState.RUN;

    getExtern<AnyCallablesModule>("xr_effects").teleport_actor(actor, this.object, [this.state.point, this.state.look]);

    if (this.state.ppEffector !== postProcessors.nil) {
      level.add_pp_effector(this.state.ppEffector, 234, false);
    }

    ActorInputManager.getInstance().disableGameUi(false);
    this.isUiDisabled = true;

    const timeHours: number = level.get_time_hours();

    if (this.state.isOutdoor && actor !== null && (timeHours < 6 || timeHours > 21)) {
      this.isPostprocess = true;
      level.add_complex_effector("brighten", 1999);
      // --level.add_pp_effector("brighten.ppe", 1999, true)
    }

    this.motionId = 1;
    this.selectNextMotion();

    CutsceneManager.objectCutscene = this.object;
    CutsceneManager.storageScene = this.state;
  }

  public selectNextMotion(): void {
    logger.info("Select next cutscene motion");

    const motion: TName = this.state.cameraEffector!.get(this.motionId);

    if (effectorSets[motion] === null) {
      this.motion = new CamEffectorSet(
        {
          start: new LuaTable(),
          idle: [{ anim: motion, looped: false, global_cameffect: this.state.isGlobalCameraEffect }] as any,
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
      if (this.motionId <= this.state.cameraEffector!.length()) {
        this.selectNextMotion();
      } else {
        if (this.isPostprocess) {
          this.isPostprocess = false;
          level.remove_complex_effector(1999);
        }

        if (this.isUiDisabled) {
          if (!actor.is_talking() && this.state.shouldEnableUiOnEnd) {
            ActorInputManager.getInstance().enableGameUi(false);
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
      this.motion!.playing = false;

      const effect: Optional<ICamEffectorSetDescriptorItem> = this.motion!.selectEffect();

      if (effect) {
        this.motion!.startEffect(effect);
      }
    }
  }
}
