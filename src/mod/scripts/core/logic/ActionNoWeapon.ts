import {
  game,
  get_hud,
  XR_CTime,
  XR_CUIGameCustom,
  XR_game_object,
  XR_ini_file,
  XR_StaticDrawableWrapper
} from "xray16";

import { AnyCallablesModule, Optional } from "@/mod/lib/types";
import { hide_weapon, restore_weapon } from "@/mod/scripts/core/binders/ActorBinder";
import { getActor, IStoredObject, noWeapZones } from "@/mod/scripts/core/db";
import { AbstractSchemeAction } from "@/mod/scripts/core/logic/AbstractSchemeAction";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("ActionNoWeapon");

export enum EActorZoneState {
  NOWHERE,
  INSIDE,
  OUTSIDE
}

/**
 * Observe whether actor is in no-weapon zone or not and allow usage of weapons.
 */
export class ActionNoWeapon extends AbstractSchemeAction {
  public static readonly SCHEME_SECTION: string = "sr_no_weapon";
  public static readonly SHOW_CAN_USE_WEAPON_DURATION_SEC: number = 30;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: string,
    section: string,
    state: IStoredObject
  ): void {
    log.info("Add to binder:", object.name());

    get_global<AnyCallablesModule>("xr_logic").subscribe_action_for_events(
      object,
      state,
      new ActionNoWeapon(object, state)
    );
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: string, section: string): void {
    const state: IStoredObject = get_global<AnyCallablesModule>("xr_logic").assign_storage_and_bind(
      object,
      ini,
      scheme,
      section
    );

    state.logic = get_global<AnyCallablesModule>("xr_logic").cfg_get_switch_conditions(ini, section, object);
  }

  public currentActorState: EActorZoneState = EActorZoneState.NOWHERE;
  public noWeaponZoneLeftLabelShownAt: XR_CTime = game.CTime();
  public isNoWeaponZoneLeftLabelVisible: boolean = false;

  public reset_scheme(): void {
    this.currentActorState = EActorZoneState.NOWHERE;

    this.checkActorState(getActor()!);

    noWeapZones.set(this.object.name(), false);
  }

  /**
   * todo: Check frequency of calls.
   */
  public update(delta: number): void {
    const actor: XR_game_object = getActor()!;

    if (get_global<AnyCallablesModule>("xr_logic").try_switch_to_another_section(this.object, this.state, actor)) {
      if (this.currentActorState === EActorZoneState.INSIDE) {
        this.onZoneLeave();
      }

      return;
    }

    this.checkActorState(actor);

    if (
      this.isNoWeaponZoneLeftLabelVisible &&
      game.get_game_time().diffSec(this.noWeaponZoneLeftLabelShownAt) > ActionNoWeapon.SHOW_CAN_USE_WEAPON_DURATION_SEC
    ) {
      this.removeCanUseWeaponLabelOnUI();
    }
  }

  /**
   * Check whether state is up-to-date or change it and fire events.
   */
  public checkActorState(actor: XR_game_object): void {
    const currentActorState: EActorZoneState = this.currentActorState;
    const isActorInsideZone: boolean = this.object.inside(actor.center());

    if (currentActorState !== EActorZoneState.INSIDE && isActorInsideZone) {
      return this.onZoneEnter();
    } else if (currentActorState !== EActorZoneState.OUTSIDE && !isActorInsideZone) {
      return this.onZoneLeave();
    }
  }

  public onZoneEnter(): void {
    log.info("Entering no weapon zone");

    this.currentActorState = EActorZoneState.INSIDE;
    hide_weapon(this.object.id());

    this.removeCanUseWeaponLabelOnUI();
  }

  public onZoneLeave(): void {
    log.info("Leaving no weapon zone");

    this.currentActorState = EActorZoneState.OUTSIDE;
    restore_weapon(this.object.id());

    if (noWeapZones.get(this.object.name())) {
      noWeapZones.set(this.object.name(), false);
    } else {
      this.showCanUseWeaponLabelOnUI();
    }

    this.noWeaponZoneLeftLabelShownAt = game.get_game_time();
  }

  public showCanUseWeaponLabelOnUI(): void {
    if (this.isNoWeaponZoneLeftLabelVisible) {
      return;
    }

    const hud: XR_CUIGameCustom = get_hud();
    const customStatic: Optional<XR_StaticDrawableWrapper> = hud.GetCustomStatic("can_use_weapon_now");

    if (customStatic === null) {
      log.info("Show can use weapon label");
      this.isNoWeaponZoneLeftLabelVisible = true;
      hud.AddCustomStatic("can_use_weapon_now", true).wnd().TextControl().SetTextST("st_can_use_weapon_now");
    }
  }

  public removeCanUseWeaponLabelOnUI(): void {
    if (!this.isNoWeaponZoneLeftLabelVisible) {
      return;
    }

    const hud: XR_CUIGameCustom = get_hud();
    const customStatic: Optional<XR_StaticDrawableWrapper> = hud.GetCustomStatic("can_use_weapon_now");

    if (customStatic !== null) {
      log.info("Remove can use weapon label");
      this.isNoWeaponZoneLeftLabelVisible = false;
      hud.RemoveCustomStatic("can_use_weapon_now");
    }
  }
}
