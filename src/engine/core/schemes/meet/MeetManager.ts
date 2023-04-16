import { alife, XR_game_object } from "xray16";

import { getObjectByStoryId, registry, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState } from "@/engine/core/objects/state";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { SchemeAbuse } from "@/engine/core/schemes/abuse";
import { ISchemeMeetState } from "@/engine/core/schemes/meet/ISchemeMeetState";
import { isBlackScreen, isObjectWounded } from "@/engine/core/utils/check/check";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectInCombat } from "@/engine/core/utils/object";
import { captions } from "@/engine/lib/constants/captions";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import { Optional, StringOptional, TDistance, TName, TSection, TStringId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Approximate meet distance to simplify logical checks.
 */
enum EMeetDistance {
  CLOSE = 1,
  FAR = 2,
}

/**
 * Handle meeting interaction between object and actor.
 * - dialogs
 * - trading
 * - stop and wait actor interaction
 * - hello / goodbye when moving around
 */
export class MeetManager extends AbstractSchemeManager<ISchemeMeetState> {
  public startDialog: Optional<TName> = null;
  public abuseMode: Optional<TName> = null;
  public currentDistanceToSpeaker: Optional<EMeetDistance> = null;
  public use: Optional<TSection> = null;

  public isTradingEnabled: Optional<boolean> = null;
  public isCampStoryDirector: boolean = false;
  public isDialogBreakEnabled: Optional<boolean> = null;
  public isHelloPassed: boolean = false;
  public isByePassed: boolean = false;

  /**
   * todo: Description.
   */
  public initialize(): void {
    const actor: Optional<XR_game_object> = registry.actor;

    if (actor === null) {
      this.isHelloPassed = false;
      this.isByePassed = false;
      this.currentDistanceToSpeaker = null;

      return;
    }

    if (!this.object.alive()) {
      this.isHelloPassed = false;
      this.isByePassed = false;
      this.currentDistanceToSpeaker = null;

      return;
    }

    const distance: TDistance = this.object.position().distance_to(actor.position());
    const isActorVisible: boolean = this.object.see(actor);
    const isObjectFar: boolean =
      isActorVisible && distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.far_distance))!;
    const isObjectClose: boolean =
      this.object.is_talking() ||
      (isActorVisible && distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.close_distance))!);

    if (isObjectClose) {
      this.isHelloPassed = true;
      this.currentDistanceToSpeaker = EMeetDistance.CLOSE;
    } else if (isObjectFar) {
      this.isByePassed = true;
      this.currentDistanceToSpeaker = EMeetDistance.FAR;
    } else if (distance >= this.state.reset_distance) {
      this.isHelloPassed = false;
      this.isByePassed = false;
      this.currentDistanceToSpeaker = null;
    } else {
      this.currentDistanceToSpeaker = null;
    }
  }

  /**
   * todo: Description.
   */
  public activateMeetState(): void {
    const actor: XR_game_object = registry.actor;
    let state: Optional<EStalkerState> = null;
    let victim: Optional<XR_game_object> = null;
    let victimStoryId: Optional<TStringId> = null;

    if (this.currentDistanceToSpeaker === EMeetDistance.CLOSE) {
      state = pickSectionFromCondList(actor, this.object, this.state.close_anim);
      victimStoryId = pickSectionFromCondList(actor, this.object, this.state.close_victim);
    } else if (this.currentDistanceToSpeaker === EMeetDistance.FAR) {
      state = pickSectionFromCondList(actor, this.object, this.state.far_anim);
      victimStoryId = pickSectionFromCondList(actor, this.object, this.state.far_victim);
    }

    if (tostring(victimStoryId) === NIL) {
      victimStoryId = null;
    } else {
      if (alife() !== null) {
        victim = getObjectByStoryId(victimStoryId as TStringId);
      }
    }

    // Look at speaker.
    if (tostring(state) !== NIL) {
      setStalkerState(this.object, state as EStalkerState, null, null, { look_object: victim, look_position: null });
    }

    // Say hello.
    const optionalSound: Optional<TSection> = pickSectionFromCondList(actor, this.object, this.state.far_snd);

    if (tostring(optionalSound) !== NIL) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), optionalSound, null, null);
    }
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    const actor: XR_game_object = registry.actor;
    const distance: TDistance = this.object.position().distance_to(actor.position());
    const isActorVisible: boolean = this.object.see(actor);

    if (isActorVisible) {
      if (distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.close_snd_distance))!) {
        if (!this.isHelloPassed) {
          const snd = pickSectionFromCondList(actor, this.object, this.state.close_snd_hello);

          if (tostring(snd) !== NIL && !isObjectInCombat(this.object)) {
            GlobalSoundManager.getInstance().playSound(this.object.id(), snd, null, null);
          }

          this.isHelloPassed = true;
        }
      } else if (distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.far_snd_distance))!) {
        if (this.isHelloPassed) {
          if (!this.isByePassed) {
            const sound: Optional<TSection> = pickSectionFromCondList(actor, this.object, this.state.close_snd_bye);

            if (tostring(sound) !== NIL && !isObjectInCombat(this.object)) {
              GlobalSoundManager.getInstance().playSound(this.object.id(), sound, null, null);
            }

            this.isByePassed = true;
          }
        }
      }
    }

    const isObjectFar: boolean =
      isActorVisible && distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.far_distance))!;
    const isObjectClose: boolean =
      (isActorVisible &&
        distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.close_distance))!) ||
      (this.object.is_talking() && this.state.meet_on_talking !== null);

    if (isObjectClose) {
      this.currentDistanceToSpeaker = EMeetDistance.CLOSE;
    } else if (isObjectFar) {
      this.currentDistanceToSpeaker = EMeetDistance.FAR;
    } else if (distance > this.state.reset_distance) {
      this.isHelloPassed = false;
      this.isByePassed = false;
      this.currentDistanceToSpeaker = null;
    } else {
      this.currentDistanceToSpeaker = null;
    }

    this.isDialogBreakEnabled = pickSectionFromCondList(actor, this.object, this.state.allow_break) === TRUE;

    if (this.state.meet_dialog !== null) {
      const startingDialog: Optional<TName> = pickSectionFromCondList(actor, this.object, this.state.meet_dialog);

      if (this.startDialog !== startingDialog) {
        this.startDialog = startingDialog;

        if (startingDialog === null || startingDialog === NIL) {
          this.object.restore_default_start_dialog();
        } else {
          this.object.set_start_dialog(startingDialog);

          if (this.object.is_talking()) {
            actor.run_talk_dialog(this.object, !this.isDialogBreakEnabled);
          }
        }
      }
    }

    // Handle use condlist.
    const isObjectTalking: boolean = this.object.is_talking();
    const use: Optional<TSection> = this.isCampStoryDirector
      ? FALSE
      : pickSectionFromCondList(actor, this.object, this.state.use);

    if (this.use !== use) {
      if (use === "self") {
        if (!isObjectTalking && !isBlackScreen()) {
          this.object.enable_talk();
          this.object.allow_break_talk_dialog(this.isDialogBreakEnabled);
          actor.run_talk_dialog(this.object, !this.isDialogBreakEnabled);
        }
      }

      if (!isBlackScreen()) {
        this.use = use;
      }
    }

    // Handle interaction label.
    const meetInteractionText: StringOptional<TSection> = pickSectionFromCondList(
      actor,
      this.object,
      this.state.use_text
    )!;

    if (meetInteractionText !== NIL) {
      this.object.set_tip_text(meetInteractionText);
    } else {
      if (this.object.is_talk_enabled()) {
        this.object.set_tip_text(captions.character_use);
      } else {
        this.object.set_tip_text("");
      }
    }

    this.object.allow_break_talk_dialog(this.isDialogBreakEnabled);

    // Handle interaction abusing logics.
    const abuse: Optional<TSection> = pickSectionFromCondList(actor, this.object, this.state.abuse);

    if (this.abuseMode !== abuse) {
      if (abuse === TRUE) {
        SchemeAbuse.enableAbuse(this.object);
      } else {
        SchemeAbuse.disableAbuse(this.object);
      }

      this.abuseMode = abuse;
    }

    // Handle possibility of trading
    if (isObjectWounded(this.object)) {
      this.isTradingEnabled = false;
    } else {
      const isTradingEnabled: boolean = pickSectionFromCondList(actor, this.object, this.state.trade_enable) === TRUE;

      if (this.isTradingEnabled !== isTradingEnabled) {
        this.isTradingEnabled = isTradingEnabled;

        if (this.isTradingEnabled) {
          this.object.enable_trade();
        } else {
          this.object.disable_trade();
        }
      }
    }
  }
}
