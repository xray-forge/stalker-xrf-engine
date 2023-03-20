import { alife, device, XR_game_object } from "xray16";

import { getObjectByStoryId, registry } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { set_state } from "@/engine/core/objects/state/StateManager";
import { SchemeAbuse } from "@/engine/core/schemes/abuse";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { ISchemeMeetState } from "@/engine/core/schemes/meet/ISchemeMeetState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { isObjectInCombat } from "@/engine/core/utils/object";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import { Optional, TDistance, TStringId } from "@/engine/lib/types";

/**
 * todo;
 */
export class MeetManager extends AbstractSchemeManager<ISchemeMeetState> {
  public startdialog: Optional<string> = null;
  public abuse_mode: Optional<string> = null;
  public trade_enable: Optional<boolean> = null;
  public use: Optional<string> = null;
  public allow_break: Optional<boolean> = null;
  public npc_is_camp_director: boolean = false;
  public hello_passed: boolean = false;
  public bye_passed: boolean = false;
  public current_distance: Optional<string> = null;

  /**
   * todo: Description.
   */
  public updateState(): void {
    const actor: XR_game_object = registry.actor;
    let state: Optional<string> = null;
    let victim: Optional<XR_game_object> = null;
    let victimStoryId: Optional<TStringId> = null;

    if (this.current_distance === "close") {
      state = pickSectionFromCondList(actor as XR_game_object, this.object, this.state.close_anim);
      victimStoryId = pickSectionFromCondList(actor as XR_game_object, this.object, this.state.close_victim);
    } else if (this.current_distance === "far") {
      state = pickSectionFromCondList(actor as XR_game_object, this.object, this.state.far_anim);
      victimStoryId = pickSectionFromCondList(actor as XR_game_object, this.object, this.state.far_victim);
    }

    if (tostring(victimStoryId) === NIL) {
      victimStoryId = null;
    } else {
      if (alife() !== null) {
        victim = getObjectByStoryId(victimStoryId as TStringId);
      }
    }

    if (tostring(state) !== NIL) {
      if (victim === null) {
        set_state(this.object, state!, null, null, null, null);
      } else {
        set_state(this.object, state!, null, null, { look_object: victim, look_position: null }, null);
      }
    }

    const snd = pickSectionFromCondList(actor, this.object, this.state.far_snd);

    if (tostring(snd) !== NIL) {
      GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), snd, null, null);
    }
  }

  /**
   * todo: Description.
   */
  public setStartDistance(): void {
    const actor: Optional<XR_game_object> = registry.actor;

    if (actor === null) {
      this.hello_passed = false;
      this.bye_passed = false;
      this.current_distance = null;

      return;
    }

    if (!this.object.alive()) {
      this.hello_passed = false;
      this.bye_passed = false;
      this.current_distance = null;

      return;
    }

    const distance = this.object.position().distance_to(actor.position());
    const actor_visible = this.object.see(actor);

    const is_object_far =
      actor_visible && distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.far_distance))!;
    const is_object_close =
      (actor_visible &&
        distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.close_distance))!) ||
      this.object.is_talking();

    if (is_object_close === true) {
      this.hello_passed = true;
      this.current_distance = "close";
    } else if (is_object_far === true) {
      this.bye_passed = true;
      this.current_distance = "far";
    } else if (distance > this.state.reset_distance) {
      this.hello_passed = false;
      this.bye_passed = false;
      this.current_distance = null;
    } else {
      this.current_distance = null;
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
        if (this.hello_passed === false) {
          const snd = pickSectionFromCondList(actor, this.object, this.state.close_snd_hello);

          if (tostring(snd) !== NIL && !isObjectInCombat(this.object)) {
            GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), snd, null, null);
          }

          this.hello_passed = true;
        }
      } else if (distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.far_snd_distance))!) {
        if (this.hello_passed === true) {
          if (this.bye_passed === false) {
            const snd = pickSectionFromCondList(actor, this.object, this.state.close_snd_bye);

            if (tostring(snd) !== NIL && !isObjectInCombat(this.object)) {
              GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), snd, null, null);
            }

            this.bye_passed = true;
          }
        }
      }
    }

    const isObjectFar =
      isActorVisible && distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.far_distance))!;
    const isObjectClose =
      (isActorVisible &&
        distance <= tonumber(pickSectionFromCondList(actor, this.object, this.state.close_distance))!) ||
      (this.object.is_talking() && this.state.meet_on_talking);

    if (isObjectClose === true) {
      if (this.current_distance !== "close") {
        this.current_distance = "close";
      }
    } else if (isObjectFar === true) {
      this.current_distance = "far";
    } else if (distance > this.state.reset_distance) {
      this.hello_passed = false;
      this.bye_passed = false;
      this.current_distance = null;
    } else {
      this.current_distance = null;
    }

    const allow_break = pickSectionFromCondList(actor, this.object, this.state.allow_break);

    if (this.allow_break !== (allow_break === TRUE)) {
      this.allow_break = allow_break === TRUE;
    }

    if (this.state.meet_dialog !== null) {
      const start_dialog = pickSectionFromCondList(actor, this.object, this.state.meet_dialog);

      if (this.startdialog !== start_dialog) {
        this.startdialog = start_dialog;
        if (start_dialog === null || start_dialog === NIL) {
          this.object.restore_default_start_dialog();
        } else {
          this.object.set_start_dialog(start_dialog);
          if (this.object.is_talking()) {
            actor.run_talk_dialog(this.object, !this.allow_break);
          }
        }
      }
    }

    const is_talking = this.object.is_talking();
    let use = pickSectionFromCondList(actor, this.object, this.state.use);

    if (this.npc_is_camp_director === true) {
      use = FALSE;
    }

    if (this.use !== use) {
      if (use === "self") {
        if (!is_talking && device().precache_frame < 1) {
          this.object.enable_talk();
          this.object.allow_break_talk_dialog(this.allow_break);
          actor.run_talk_dialog(this.object, !this.allow_break);
        }
      }

      if (device().precache_frame < 1) {
        this.use = use;
      }
    }

    const shouldUseText = pickSectionFromCondList(actor, this.object, this.state.use_text)!;

    if (shouldUseText !== NIL) {
      this.object.set_tip_text(shouldUseText);
    } else {
      if (this.object.is_talk_enabled()) {
        this.object.set_tip_text("character_use");
      } else {
        this.object.set_tip_text("");
      }
    }

    this.object.allow_break_talk_dialog(this.allow_break);

    /**
     *   // -- [[
     *     if (is_talking {
     *       db.actor:allow_break_talk_dialog(this.allow_break)
     *     }
     *   ]]
     */

    const abuse = pickSectionFromCondList(actor, this.object, this.state.abuse);

    if (this.abuse_mode !== abuse) {
      if (abuse === TRUE) {
        SchemeAbuse.enableAbuse(this.object);
      } else {
        SchemeAbuse.disableAbuse(this.object);
      }

      this.abuse_mode = abuse;
    }
  }
}
