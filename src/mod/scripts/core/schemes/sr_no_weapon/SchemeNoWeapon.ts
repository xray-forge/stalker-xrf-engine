import {
  game,
  get_hud,
  XR_CTime,
  XR_CUIGameCustom,
  XR_game_object,
  XR_ini_file,
  XR_StaticDrawableWrapper,
} from "xray16";

import { EScheme, ESchemeType, Optional, TSection } from "@/mod/lib/types";
import { hide_weapon, restore_weapon } from "@/mod/scripts/core/binders/ActorBinder";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemeNoWeapon");

export enum EActorZoneState {
  NOWHERE,
  INSIDE,
  OUTSIDE,
}

/**
 * Observe whether actor is in no-weapon zone or not and allow usage of weapons.
 */
export class SchemeNoWeapon extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.SR_NO_WEAPON;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;
  public static readonly SHOW_CAN_USE_WEAPON_DURATION_SEC: number = 30;

  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    subscribeActionForEvents(object, state, new SchemeNoWeapon(object, state));
  }

  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state: IStoredObject = assignStorageAndBind(object, ini, scheme, section);

    state.logic = getConfigSwitchConditions(ini, section, object);
  }

  public currentActorState: EActorZoneState = EActorZoneState.NOWHERE;
  public noWeaponZoneLeftLabelShownAt: XR_CTime = game.CTime();
  public isNoWeaponZoneLeftLabelVisible: boolean = false;

  public override resetScheme(): void {
    this.currentActorState = EActorZoneState.NOWHERE;
    this.checkActorState(registry.actor);

    registry.noWeaponZones.set(this.object.name(), false);
  }

  /**
   * todo: Check frequency of calls.
   */
  public override update(delta: number): void {
    const actor: XR_game_object = registry.actor;

    if (trySwitchToAnotherSection(this.object, this.state, actor)) {
      if (this.currentActorState === EActorZoneState.INSIDE) {
        this.onZoneLeave();
      }

      return;
    }

    this.checkActorState(actor);

    if (
      this.isNoWeaponZoneLeftLabelVisible &&
      game.get_game_time().diffSec(this.noWeaponZoneLeftLabelShownAt) > SchemeNoWeapon.SHOW_CAN_USE_WEAPON_DURATION_SEC
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
    logger.info("Entering no weapon zone");

    this.currentActorState = EActorZoneState.INSIDE;
    hide_weapon(this.object.id());

    this.removeCanUseWeaponLabelOnUI();
  }

  public onZoneLeave(): void {
    logger.info("Leaving no weapon zone");

    this.currentActorState = EActorZoneState.OUTSIDE;
    restore_weapon(this.object.id());

    if (registry.noWeaponZones.get(this.object.name())) {
      registry.noWeaponZones.set(this.object.name(), false);
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
      logger.info("Show can use weapon label");
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
      logger.info("Remove can use weapon label");
      this.isNoWeaponZoneLeftLabelVisible = false;
      hud.RemoveCustomStatic("can_use_weapon_now");
    }
  }
}
