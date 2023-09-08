import { CUIGameCustom, game, get_hud, StaticDrawableWrapper } from "xray16";

import { registry } from "@/engine/core/database";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { EActorZoneState, ISchemeNoWeaponState } from "@/engine/core/schemes/sr_no_weapon/ISchemeNoWeaponState";
import { SchemeNoWeapon } from "@/engine/core/schemes/sr_no_weapon/SchemeNoWeapon";
import { LuaLogger } from "@/engine/core/utils/logging";
import { trySwitchToAnotherSection } from "@/engine/core/utils/scheme/scheme_switch";
import { ClientObject, Optional, TDuration, Time } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
export class NoWeaponManager extends AbstractSchemeManager<ISchemeNoWeaponState> {
  public static readonly SHOW_CAN_USE_WEAPON_DURATION_SEC: TDuration = 30;

  public currentActorState: EActorZoneState = EActorZoneState.NOWHERE;
  public noWeaponZoneLeftLabelShownAt: Time = game.CTime();
  public isNoWeaponZoneLeftLabelVisible: boolean = false;

  protected scheme: typeof SchemeNoWeapon;

  public constructor(object: ClientObject, state: ISchemeNoWeaponState, scheme: typeof SchemeNoWeapon) {
    super(object, state);
    this.scheme = scheme;
  }

  /**
   * todo: Description.
   */
  public override resetScheme(): void {
    this.currentActorState = EActorZoneState.NOWHERE;
    this.checkActorState(registry.actor);

    registry.noWeaponZones.delete(this.object.id());
  }

  /**
   * todo: Check frequency of calls.
   */
  public update(): void {
    if (trySwitchToAnotherSection(this.object, this.state)) {
      if (this.currentActorState === EActorZoneState.INSIDE) {
        this.onZoneLeave();
      }

      return;
    }

    this.checkActorState(registry.actor);

    if (
      this.isNoWeaponZoneLeftLabelVisible &&
      game.get_game_time().diffSec(this.noWeaponZoneLeftLabelShownAt) > NoWeaponManager.SHOW_CAN_USE_WEAPON_DURATION_SEC
    ) {
      this.removeCanUseWeaponLabelOnUI();
    }
  }

  /**
   * Check whether state is up-to-date or change it and fire events.
   */
  public checkActorState(actor: ClientObject): void {
    const currentActorState: EActorZoneState = this.currentActorState;
    const isActorInsideZone: boolean = this.object.inside(actor.center());

    if (currentActorState !== EActorZoneState.INSIDE && isActorInsideZone) {
      return this.onZoneEnter();
    } else if (currentActorState !== EActorZoneState.OUTSIDE && !isActorInsideZone) {
      return this.onZoneLeave();
    }
  }

  /**
   * todo: Description.
   */
  public showCanUseWeaponLabelOnUI(): void {
    if (this.isNoWeaponZoneLeftLabelVisible) {
      return;
    }

    const hud: CUIGameCustom = get_hud();
    const customStatic: Optional<StaticDrawableWrapper> = hud.GetCustomStatic("can_use_weapon_now");

    if (customStatic === null) {
      logger.info("Show can use weapon label");
      this.isNoWeaponZoneLeftLabelVisible = true;
      hud.AddCustomStatic("can_use_weapon_now", true).wnd().TextControl().SetTextST("st_can_use_weapon_now");
    }
  }

  /**
   * todo: Description.
   */
  public removeCanUseWeaponLabelOnUI(): void {
    if (!this.isNoWeaponZoneLeftLabelVisible) {
      return;
    }

    const hud: CUIGameCustom = get_hud();
    const customStatic: Optional<StaticDrawableWrapper> = hud.GetCustomStatic("can_use_weapon_now");

    if (customStatic !== null) {
      logger.info("Remove can use weapon label");
      this.isNoWeaponZoneLeftLabelVisible = false;
      hud.RemoveCustomStatic("can_use_weapon_now");
    }
  }

  /**
   * todo: Description.
   */
  public onZoneEnter(): void {
    logger.info("Entering no weapon zone");

    this.currentActorState = EActorZoneState.INSIDE;
    registry.noWeaponZones.set(this.object.id(), true);

    this.removeCanUseWeaponLabelOnUI();
  }

  /**
   * todo: Description.
   */
  public onZoneLeave(): void {
    logger.info("Leaving no weapon zone");

    this.currentActorState = EActorZoneState.OUTSIDE;

    if (registry.noWeaponZones.get(this.object.id())) {
      registry.noWeaponZones.delete(this.object.id());
    } else {
      this.showCanUseWeaponLabelOnUI();
    }

    this.noWeaponZoneLeftLabelShownAt = game.get_game_time();
  }
}
