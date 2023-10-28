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
import { GameObject, Optional, TIndex, TNumberId } from "@/engine/lib/types";

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

  public state: EEffectorState = EEffectorState.START;
  public currentEffect: TNumberId = 0;
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
    logger.info("Stop effect:", this.currentEffect, this.state);

    level.remove_cam_effector(CameraEffectorSet.EFFECTOR_ID);

    this.isPlaying = false;
    this.state = EEffectorState.RELEASE;
    this.currentEffect = 0;
  }

  /**
   * Handle update tick of camera effector.
   */
  public update(): void {
    if (isBlackScreen()) {
      return;
    }

    if (this.isPlaying) {
      const effect: ICameraEffectorSetDescriptorItem = this.set[this.state].get(this.currentEffect);

      if (effect && effect.looped !== false && pickSectionFromCondList(registry.actor, null, this.condlist) === FALSE) {
        this.isLooped = false;
      }
    } else {
      const effect: Optional<ICameraEffectorSetDescriptorItem> = this.selectEffect();

      if (effect) {
        this.startEffect(effect);
      }
    }
  }

  /**
   * todo: Description.
   */
  public selectEffect(): Optional<ICameraEffectorSetDescriptorItem> {
    const state: EEffectorState = this.state;
    const actor: GameObject = registry.actor;
    let currentEffect: TIndex = this.currentEffect;

    if (this.isLooped) {
      return this.set[state].get(currentEffect);
    }

    if (state === EEffectorState.START) {
      currentEffect = currentEffect + 1;
      if (this.set.start.get(currentEffect) !== null) {
        this.currentEffect = currentEffect;
        if (type(this.set.start.get(currentEffect).enabled) === "string") {
          const conditionsList: TConditionList = parseConditionsList(
            this.set.start.get(currentEffect).enabled as string
          );

          if (pickSectionFromCondList(actor, null, conditionsList) === FALSE) {
            return this.selectEffect();
          }
        }

        if (type(this.set.start.get(currentEffect).looped) === "string") {
          this.isLooped = true;
          this.condlist = parseConditionsList(this.set.start.get(currentEffect).looped as string);
        }

        return this.set.start.get(currentEffect);
      } else {
        this.state = EEffectorState.IDLE;
        this.currentEffect = 0;

        return this.selectEffect();
      }
    } else if (state === EEffectorState.IDLE) {
      currentEffect = currentEffect + 1;
      if (this.set.idle.get(currentEffect) !== null) {
        this.currentEffect = currentEffect;
        if (type(this.set.idle.get(currentEffect).enabled) === "string") {
          const conditionsList: TConditionList = parseConditionsList(
            this.set.idle.get(currentEffect).enabled as string
          );

          if (pickSectionFromCondList(actor, null, conditionsList) === FALSE) {
            return this.selectEffect();
          }
        }

        if (type(this.set.idle.get(currentEffect).looped) === "string") {
          this.isLooped = true;
          this.condlist = parseConditionsList(this.set.idle.get(currentEffect).looped as string);
        }

        return this.set.idle.get(currentEffect);
      } else {
        this.state = EEffectorState.FINISH;
        this.currentEffect = 0;

        return this.selectEffect();
      }
    } else if (state === EEffectorState.FINISH) {
      currentEffect = currentEffect + 1;
      if (this.set.finish.get(currentEffect) !== null) {
        this.currentEffect = currentEffect;

        if (type(this.set.finish.get(currentEffect).enabled) === "string") {
          const condlist: TConditionList = parseConditionsList(this.set.finish.get(currentEffect).enabled as string);

          if (pickSectionFromCondList(actor, null, condlist) === FALSE) {
            return this.selectEffect();
          }
        }

        if (type(this.set.finish.get(currentEffect).looped) === "string") {
          this.isLooped = true;
          this.condlist = parseConditionsList(this.set.finish.get(currentEffect).looped as string);
        }

        return this.set.finish.get(currentEffect);
      } else {
        this.state = EEffectorState.RELEASE;
        this.currentEffect = 0;

        emitCutsceneEndedEvent();

        return null;
      }
    }

    return null;
  }
}
