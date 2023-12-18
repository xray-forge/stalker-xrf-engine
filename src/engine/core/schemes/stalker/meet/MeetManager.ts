import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { EStalkerState } from "@/engine/core/animation/types";
import { getManager, getObjectByStoryId, registry, setStalkerState } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { EMeetDistance, ISchemeMeetState } from "@/engine/core/schemes/stalker/meet/meet_types";
import { setObjectAbuseState } from "@/engine/core/schemes/stalker/meet/utils";
import { isBlackScreen } from "@/engine/core/utils/game";
import { parseStringOptional, pickSectionFromCondList } from "@/engine/core/utils/ini";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectInCombat, isObjectWounded } from "@/engine/core/utils/planner";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import {
  GameObject,
  Optional,
  StringOptional,
  TDistance,
  TName,
  TNumberId,
  TSection,
  TStringId,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename, { file: "meet" });

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
    const actor: Optional<GameObject> = registry.actor;

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

    logger.format("Initialize meet manager for: '%s', '%s', '%s'", this.object.name(), isObjectClose, isObjectFar);

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
   * Called when actor is starting meet and stalker is captured in action.
   */
  public execute(): void {
    const actor: GameObject = registry.actor;

    let state: Optional<EStalkerState> = null;
    let victim: Optional<GameObject> = null;
    let victimStoryId: Optional<TStringId> = null;

    if (this.currentDistanceToSpeaker === EMeetDistance.CLOSE) {
      state = parseStringOptional(pickSectionFromCondList(actor, this.object, this.state.closeAnimation));
      victimStoryId = parseStringOptional(pickSectionFromCondList(actor, this.object, this.state.closeVictim));
    } else if (this.currentDistanceToSpeaker === EMeetDistance.FAR) {
      state = parseStringOptional(pickSectionFromCondList(actor, this.object, this.state.farAnimation));
      victimStoryId = parseStringOptional(pickSectionFromCondList(actor, this.object, this.state.farVictim));
    }

    // Find by SID if defined.
    if (victimStoryId !== null && registry.simulator !== null) {
      victim = getObjectByStoryId(victimStoryId as TStringId);
    }

    // Use animation if it is defined.
    if (state !== null) {
      setStalkerState(this.object, state, null, null, {
        lookObjectId: victim?.id() as Optional<TNumberId>,
        lookPosition: null,
      });
    }

    const optionalSound: Optional<TSection> = parseStringOptional(
      pickSectionFromCondList(actor, this.object, this.state.farSound)
    );

    if (optionalSound !== null) {
      logger.format("Execute play sound: '%s', '%s'", this.object.name(), optionalSound);
      getManager(SoundManager).playSound(this.object.id(), optionalSound);
    }
  }

  /**
   * todo: Description.
   */
  public update(): void {
    const actor: GameObject = registry.actor;
    const distance: TDistance = this.object.position().distance_to(actor.position());
    const isActorVisible: boolean = this.object.see(actor);

    // Handle greeting / bye.
    if (isActorVisible) {
      if (
        !this.isHelloPassed &&
        distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.closeSoundDistance))!
      ) {
        const sound: Optional<TSection> = parseStringOptional(
          pickSectionFromCondList(actor, this.object, this.state.closeSoundHello)
        );

        if (sound !== null && !isObjectInCombat(this.object)) {
          logger.format("Execute play sound hello: '%s', '%s'", this.object.name(), sound);
          getManager(SoundManager).playSound(this.object.id(), sound);
        }

        this.isHelloPassed = true;
      } else if (
        this.isHelloPassed &&
        !this.isByePassed &&
        distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.farSoundDistance))!
      ) {
        const sound: Optional<TSection> = parseStringOptional(
          pickSectionFromCondList(actor, this.object, this.state.closeSoundBye)
        );

        if (sound !== null && !isObjectInCombat(this.object)) {
          logger.format("Execute play sound bye: '%s', '%s'", this.object.name(), sound);
          getManager(SoundManager).playSound(this.object.id(), sound);
        }

        this.isByePassed = true;
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
      this.object.set_tip_text(this.object.is_talk_enabled() ? "character_use" : "");
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
