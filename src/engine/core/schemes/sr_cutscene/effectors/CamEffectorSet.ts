import { device, level } from "xray16";

import { registry } from "@/engine/core/database";
import {
  ICamEffectorSetDescriptorItem,
  TCamEffectorSetDescriptor,
} from "@/engine/core/schemes/sr_cutscene/effectors/camera_effector_sets";
import { EEffectorState, ISchemeCutsceneState } from "@/engine/core/schemes/sr_cutscene/ISchemeCutsceneState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { parseConditionsList } from "@/engine/core/utils/ini/parse";
import { TConditionList } from "@/engine/core/utils/ini/types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { toJSON } from "@/engine/core/utils/transform/json";
import { FALSE } from "@/engine/lib/constants/words";
import { ClientObject, Optional, TIndex, TSection } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class CamEffectorSet {
  public set: TCamEffectorSetDescriptor;
  public st: ISchemeCutsceneState;
  public state: EEffectorState;

  public currentEffect: number;
  public enabled: boolean;
  public playing: boolean;
  public looped: boolean;
  public condlist!: TConditionList;

  public constructor(set: TCamEffectorSetDescriptor, storage: ISchemeCutsceneState) {
    logger.info("Init new set:", toJSON(set));

    this.set = set;
    this.state = EEffectorState.START;
    this.currentEffect = 0;
    this.playing = false;
    this.looped = false;
    this.enabled = true;
    this.st = storage;
  }

  public startEffect(effect: ICamEffectorSetDescriptorItem): void {
    logger.info("Start effect:", effect.anim);
    // --printf("playing effect [camera_effects\\"..eff.anim..".anm], time [%s]", device():time_global())
    // --callstack()

    if (!effect.global_cameffect) {
      level.add_cam_effector("camera_effects\\" + effect.anim + ".anm", 210408, false, "engine.effector_callback");
    } else {
      level.add_cam_effector2(
        "camera_effects\\" + effect.anim + ".anm",
        210408,
        false,
        "engine.effector_callback",
        this.st.fov || registry.actor.fov() * 0.75
      );
    }

    this.playing = true;
  }

  public stopEffect(): void {
    logger.info("Stop effect:", this.currentEffect, this.state);
    level.remove_cam_effector(210408);
    this.playing = false;
    this.state = EEffectorState.RELEASE;
    this.currentEffect = 0;
  }

  public update(): void {
    if (device().precache_frame > 0) {
      return;
    }

    if (this.playing) {
      const effect: ICamEffectorSetDescriptorItem = this.set[this.state].get(this.currentEffect);

      if (effect && effect.looped !== false) {
        const condition: Optional<TSection> = pickSectionFromCondList(registry.actor, null, this.condlist);

        if (condition === FALSE) {
          this.looped = false;
          // --                this.stop_effect()
        }
      }
    } else {
      const effect: Optional<ICamEffectorSetDescriptorItem> = this.selectEffect();

      if (effect) {
        this.startEffect(effect);
      }
    }
  }

  /**
   * todo: Description.
   */
  public selectEffect(): Optional<ICamEffectorSetDescriptorItem> {
    const state: EEffectorState = this.state;
    const actor: ClientObject = registry.actor;
    let currentEffect: TIndex = this.currentEffect;

    if (this.looped) {
      return this.set[state].get(currentEffect);
    }

    if (state === EEffectorState.START) {
      currentEffect = currentEffect + 1;
      if (this.set.start.get(currentEffect) !== null) {
        this.currentEffect = currentEffect;
        if (type(this.set.start.get(currentEffect).enabled) === "string") {
          const conditionsList: TConditionList = parseConditionsList(this.set.start.get(currentEffect).enabled!);

          if (pickSectionFromCondList(actor, null, conditionsList) === FALSE) {
            return this.selectEffect();
          }
        }

        if (type(this.set.start.get(currentEffect).looped) === "string") {
          this.looped = true;
          this.condlist = parseConditionsList(this.set.start.get(currentEffect).looped as any);
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
          const conditionsList: TConditionList = parseConditionsList(this.set.idle.get(currentEffect).enabled as any);

          if (pickSectionFromCondList(actor, null, conditionsList) === FALSE) {
            return this.selectEffect();
          }
        }

        if (type(this.set.idle.get(currentEffect).looped) === "string") {
          this.looped = true;
          this.condlist = parseConditionsList(this.set.idle.get(currentEffect).looped as any);
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
          const condlist: TConditionList = parseConditionsList(this.set.finish.get(currentEffect).enabled as any);

          if (pickSectionFromCondList(actor, null, condlist) === FALSE) {
            return this.selectEffect();
          }
        }

        if (type(this.set.finish.get(currentEffect).looped) === "string") {
          this.looped = true;
          this.condlist = parseConditionsList(this.set.finish.get(currentEffect).looped as any);
        }

        return this.set.finish.get(currentEffect);
      } else {
        this.state = EEffectorState.RELEASE;
        this.currentEffect = 0;

        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { SchemeCutscene } = require("@/engine/core/schemes/sr_cutscene/SchemeCutscene");

        SchemeCutscene.onCutsceneEnd();

        return null;
      }
    }

    return null;
  }
}
