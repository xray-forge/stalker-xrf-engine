import { level } from "xray16";

import { registry } from "@/engine/core/database";
import {
  EEffectorState,
  ICameraEffectorSetDescriptorItem,
  ISchemeCutsceneState,
  TCamEffectorSetDescriptor,
} from "@/engine/core/schemes/restrictor/sr_cutscene/sr_cutscene_types";
import { emitCutsceneEndedEvent } from "@/engine/core/schemes/restrictor/sr_cutscene/utils/cutscene_utils";
import { isBlackScreen } from "@/engine/core/utils/game";
import { parseConditionsList, pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { FALSE } from "@/engine/lib/constants/words";
import { Optional, TIndex, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Wrapper around camera effector descriptors to play/stop them with defined logics/scenario.
 */
export class CameraEffectorSet {
  public static EFFECTOR_ID: TNumberId = 210_408;

  public cutsceneState: ISchemeCutsceneState;
  public set: TCamEffectorSetDescriptor;

  public isEnabled: boolean = true;
  public isPlaying: boolean = false;
  public isLooped: boolean = false;

  // Effect lifecycle state.
  public state: EEffectorState = EEffectorState.START;
  // Effect index in current lifecycle state.
  public currentEffectIndex: TIndex = 0;

  public condlist!: TConditionList;

  public constructor(set: TCamEffectorSetDescriptor, state: ISchemeCutsceneState) {
    this.set = set;
    this.cutsceneState = state;
  }

  /**
   * Handle starting of camera effector.
   *
   * @param effect - descriptor item of effect to run
   */
  public startEffect(effect: ICameraEffectorSetDescriptorItem): void {
    logger.info("Start effect:", effect.anim);

    if (effect.isGlobalCameraEffect) {
      level.add_cam_effector2(
        `camera_effects\\${effect.anim}.anm`,
        CameraEffectorSet.EFFECTOR_ID,
        false,
        "engine.effector_callback",
        this.cutsceneState.fov || registry.actor.fov() * 0.75
      );
    } else {
      level.add_cam_effector(
        `camera_effects\\${effect.anim}.anm`,
        CameraEffectorSet.EFFECTOR_ID,
        false,
        "engine.effector_callback"
      );
    }

    this.isPlaying = true;
  }

  /**
   * Handle stop of camera effector.
   */
  public stopEffect(): void {
    logger.info("Stop effect:", this.currentEffectIndex, this.state);

    level.remove_cam_effector(CameraEffectorSet.EFFECTOR_ID);

    this.isPlaying = false;
    this.state = EEffectorState.RELEASE;
    this.currentEffectIndex = 0;
  }

  /**
   * Handle update tick of camera effector.
   */
  public update(): void {
    if (isBlackScreen()) {
      return;
    }

    // When playing and effect is looped, verify that condition to continue playing is still up-to-date.
    if (this.isPlaying) {
      const effect: ICameraEffectorSetDescriptorItem = this.set[this.state].get(this.currentEffectIndex);

      if (effect && effect.looped !== false && pickSectionFromCondList(registry.actor, null, this.condlist) === FALSE) {
        this.isLooped = false;
      }
    } else {
      // Check effect to play and start it if not playing anything.
      const effect: Optional<ICameraEffectorSetDescriptorItem> = this.getNextEffector();

      if (effect) {
        this.startEffect(effect);
      }
    }
  }

  /**
   * @returns optional effector descriptor based on current state / effect index for further execution
   */
  public getNextEffector(): Optional<ICameraEffectorSetDescriptorItem> {
    if (this.isLooped) {
      return this.set[this.state].get(this.currentEffectIndex);
    }

    const nextEffectIndex: TIndex = this.currentEffectIndex + 1;

    switch (this.state) {
      // Starting effectors scenario and progress over list of descriptors or switch to idle state.
      case EEffectorState.START:
        if (this.set.start.get(nextEffectIndex) as Optional<ICameraEffectorSetDescriptorItem>) {
          this.currentEffectIndex = nextEffectIndex;

          if (type(this.set.start.get(nextEffectIndex).enabled) === "string") {
            const conditionsList: TConditionList = parseConditionsList(
              this.set.start.get(nextEffectIndex).enabled as string
            );

            if (pickSectionFromCondList(registry.actor, null, conditionsList) === FALSE) {
              return this.getNextEffector();
            }
          }

          if (type(this.set.start.get(nextEffectIndex).looped) === "string") {
            this.isLooped = true;
            this.condlist = parseConditionsList(this.set.start.get(nextEffectIndex).looped as string);
          }

          return this.set.start.get(nextEffectIndex);
        } else {
          this.state = EEffectorState.IDLE;
          this.currentEffectIndex = 0;

          return this.getNextEffector();
        }

      // Handling idle state and progressing to finish animation.
      case EEffectorState.IDLE:
        if (this.set.idle.get(nextEffectIndex) as Optional<ICameraEffectorSetDescriptorItem>) {
          this.currentEffectIndex = nextEffectIndex;

          if (type(this.set.idle.get(nextEffectIndex).enabled) === "string") {
            const conditionsList: TConditionList = parseConditionsList(
              this.set.idle.get(nextEffectIndex).enabled as string
            );

            if (pickSectionFromCondList(registry.actor, null, conditionsList) === FALSE) {
              return this.getNextEffector();
            }
          }

          if (type(this.set.idle.get(nextEffectIndex).looped) === "string") {
            this.isLooped = true;
            this.condlist = parseConditionsList(this.set.idle.get(nextEffectIndex).looped as string);
          }

          return this.set.idle.get(nextEffectIndex);
        } else {
          this.state = EEffectorState.FINISH;
          this.currentEffectIndex = 0;

          return this.getNextEffector();
        }

      // Handling finish state and progressing to release state and callback emit.
      case EEffectorState.FINISH:
        if (this.set.finish.get(nextEffectIndex) as Optional<ICameraEffectorSetDescriptorItem>) {
          this.currentEffectIndex = nextEffectIndex;

          if (type(this.set.finish.get(nextEffectIndex).enabled) === "string") {
            const condlist: TConditionList = parseConditionsList(
              this.set.finish.get(nextEffectIndex).enabled as string
            );

            if (pickSectionFromCondList(registry.actor, null, condlist) === FALSE) {
              return this.getNextEffector();
            }
          }

          if (type(this.set.finish.get(nextEffectIndex).looped) === "string") {
            this.isLooped = true;
            this.condlist = parseConditionsList(this.set.finish.get(nextEffectIndex).looped as string);
          }

          return this.set.finish.get(nextEffectIndex);
        } else {
          this.state = EEffectorState.RELEASE;
          this.currentEffectIndex = 0;

          emitCutsceneEndedEvent();

          return null;
        }

      default:
        return null;
    }
  }
}
