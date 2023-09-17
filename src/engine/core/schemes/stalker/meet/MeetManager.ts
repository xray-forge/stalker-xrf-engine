import { alife } from "xray16";

import { getObjectByStoryId, registry, setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { EStalkerState } from "@/engine/core/objects/animation/types";
import { EMeetDistance, ISchemeMeetState } from "@/engine/core/schemes/stalker/meet/ISchemeMeetState";
import { isBlackScreen } from "@/engine/core/utils/game";
import { pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectInCombat, isObjectWounded, setObjectAbuseState } from "@/engine/core/utils/object";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import {
  ClientObject,
  Optional,
  StringOptional,
  TDistance,
  TName,
  TNumberId,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Handle meeting interaction between object and actor.
 * - dialogs
 * - trading
 * - stop and wait actor interaction
 * - hello / goodbye when moving around
 */
export class MeetManager extends AbstractSchemeManager<ISchemeMeetState> {
  public startDialog: Optional<TName> = null;
  // Condlist result from abuse mode enabled check.
  public isAbuseModeEnabled: Optional<TName> = null;
  public currentDistanceToSpeaker: Optional<EMeetDistance> = null;
  public use: Optional<TSection> = null;

  public isTradingEnabled: Optional<boolean> = null;

  /**
   * If object is telling story, do not interact with actor until it is finished.
   */
  public isCampStoryDirector: boolean = false;
  public isDialogBreakEnabled: Optional<boolean> = null;
  public isHelloPassed: boolean = false;
  public isByePassed: boolean = false;

  /**
   * todo: Description.
   */
  public initialize(): void {
    const actor: Optional<ClientObject> = registry.actor;

    if (actor === null || !this.object.alive()) {
      this.isHelloPassed = false;
      this.isByePassed = false;
      this.currentDistanceToSpeaker = null;

      return;
    }

    const distance: TDistance = this.object.position().distance_to(actor.position());
    const isActorVisible: boolean = this.object.see(actor);
    const isObjectFar: boolean =
      isActorVisible && distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.farDistance))!;
    const isObjectClose: boolean =
      this.object.is_talking() ||
      (isActorVisible && distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.closeDistance))!);

    if (isObjectClose) {
      this.isHelloPassed = true;
      this.currentDistanceToSpeaker = EMeetDistance.CLOSE;
    } else if (isObjectFar) {
      this.isByePassed = true;
      this.currentDistanceToSpeaker = EMeetDistance.FAR;
    } else if (distance >= this.state.resetDistance) {
      this.isHelloPassed = false;
      this.isByePassed = false;
      this.currentDistanceToSpeaker = null;
    } else {
      this.currentDistanceToSpeaker = null;
    }
  }

  /**
   * Handles meet state activation.
   * Called when actor is joining close distance to object.
   */
  public activateMeetState(): void {
    const actor: ClientObject = registry.actor;
    let state: Optional<EStalkerState> = null;
    let victim: Optional<ClientObject> = null;
    let victimStoryId: Optional<TStringId> = null;

    if (this.currentDistanceToSpeaker === EMeetDistance.CLOSE) {
      state = pickSectionFromCondList(actor, this.object, this.state.closeAnimation);
      victimStoryId = pickSectionFromCondList(actor, this.object, this.state.closeVictim);
    } else if (this.currentDistanceToSpeaker === EMeetDistance.FAR) {
      state = pickSectionFromCondList(actor, this.object, this.state.farAnimation);
      victimStoryId = pickSectionFromCondList(actor, this.object, this.state.farVictim);
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
      setStalkerState(this.object, state as EStalkerState, null, null, {
        lookObjectId: victim?.id() as Optional<TNumberId>,
        lookPosition: null,
      });
    }

    // Say hello.
    const optionalSound: Optional<TSection> = pickSectionFromCondList(actor, this.object, this.state.farSound);

    if (tostring(optionalSound) !== NIL) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), optionalSound, null, null);
    }
  }

  /**
   * todo: Description.
   */
  public update(): void {
    const actor: ClientObject = registry.actor;
    const distance: TDistance = this.object.position().distance_to(actor.position());
    const isActorVisible: boolean = this.object.see(actor);

    if (isActorVisible) {
      if (distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.closeSoundDistance))!) {
        if (!this.isHelloPassed) {
          const closeSoundHello: Optional<TSection> = pickSectionFromCondList(
            actor,
            this.object,
            this.state.closeSoundHello
          );

          if (tostring(closeSoundHello) !== NIL && !isObjectInCombat(this.object)) {
            GlobalSoundManager.getInstance().playSound(this.object.id(), closeSoundHello);
          }

          this.isHelloPassed = true;
        }
      } else if (distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.farSoundDistance))!) {
        if (this.isHelloPassed) {
          if (!this.isByePassed) {
            const sound: Optional<TSection> = pickSectionFromCondList(actor, this.object, this.state.closeSoundBye);

            if (tostring(sound) !== NIL && !isObjectInCombat(this.object)) {
              GlobalSoundManager.getInstance().playSound(this.object.id(), sound, null, null);
            }

            this.isByePassed = true;
          }
        }
      }
    }

    const isObjectFar: boolean =
      isActorVisible && distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.farDistance))!;
    const isObjectClose: boolean =
      (isActorVisible &&
        distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.closeDistance))!) ||
      (this.object.is_talking() && this.state.isMeetOnTalking);

    if (isObjectClose) {
      this.currentDistanceToSpeaker = EMeetDistance.CLOSE;
    } else if (isObjectFar) {
      this.currentDistanceToSpeaker = EMeetDistance.FAR;
    } else if (distance > this.state.resetDistance) {
      this.isHelloPassed = false;
      this.isByePassed = false;
      this.currentDistanceToSpeaker = null;
    } else {
      this.currentDistanceToSpeaker = null;
    }

    this.isDialogBreakEnabled = pickSectionFromCondList(actor, this.object, this.state.isBreakAllowed) === TRUE;

    if (this.state.meetDialog !== null) {
      const startingDialog: Optional<TName> = pickSectionFromCondList(actor, this.object, this.state.meetDialog);

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
      this.state.useText
    )!;

    if (meetInteractionText !== NIL) {
      this.object.set_tip_text(meetInteractionText);
    } else {
      if (this.object.is_talk_enabled()) {
        this.object.set_tip_text("character_use");
      } else {
        this.object.set_tip_text("");
      }
    }

    this.object.allow_break_talk_dialog(this.isDialogBreakEnabled);

    // Handle interaction abusing logics.
    const abuse: Optional<TSection> = pickSectionFromCondList(actor, this.object, this.state.abuse);

    if (this.isAbuseModeEnabled !== abuse) {
      setObjectAbuseState(this.object, abuse === TRUE);
      this.isAbuseModeEnabled = abuse;
    }

    // Handle possibility of trading
    if (isObjectWounded(this.object.id())) {
      this.isTradingEnabled = false;
    } else {
      const isTradingEnabled: boolean = pickSectionFromCondList(actor, this.object, this.state.isTradeEnabled) === TRUE;

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
