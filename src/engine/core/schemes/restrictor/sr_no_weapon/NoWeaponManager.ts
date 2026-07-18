import { $filename } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { EGameEvent, EventsManager } from "@/engine/core/managers/events";
import { AbstractSchemeManager } from "@/engine/core/schemes/base";
import {
  EActorZoneState,
  ISchemeNoWeaponState,
} from "@/engine/core/schemes/restrictor/sr_no_weapon/sr_no_weapon_types";
import { trySwitchToAnotherSection } from "@/engine/core/schemes/runtime/scheme_switch";
import { LuaLogger } from "@/engine/core/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle actor presence in no-weapon zones.
 * In no weapon zones actor is not able to use weapon and fire since all NPC expected to be invulnerable.
 */
export class NoWeaponManager extends AbstractSchemeManager<ISchemeNoWeaponState> {
  public actorState: EActorZoneState = EActorZoneState.NOWHERE;

  /**
   * Reset no weapon scheme for restrictor.
   * Instantly assume it is no weapon anymore and reset current states.
   * Recalculate actual state.
   */
  public override activate(): void {
    registry.noWeaponZones.delete(this.object.id());

    logger.info("Reset no weapon state");

    this.actorState = EActorZoneState.NOWHERE;
    this.updateActorState();
  }

  /**
   * Try to switch to another section.
   * If not switched, perform generic update.
   */
  public update(): void {
    if (trySwitchToAnotherSection(this.object, this.state)) {
      if (this.actorState === EActorZoneState.INSIDE) {
        this.onZoneLeave();
      }
    } else {
      this.updateActorState();
    }
  }

  /**
   * Check whether state is up-to-date or change it and fire events.
   */
  public updateActorState(): void {
    const currentActorState: EActorZoneState = this.actorState;
    const isActorInsideZone: boolean = this.object.inside(registry.actor.center());

    if (currentActorState !== EActorZoneState.INSIDE && isActorInsideZone) {
      return this.onZoneEnter();
    } else if (currentActorState !== EActorZoneState.OUTSIDE && !isActorInsideZone) {
      return this.onZoneLeave();
    }
  }

  /**
   * Handle enter no-weapon zone event.
   */
  public onZoneEnter(): void {
    logger.info("Entering no weapon zone: '%s'", this.object.name());

    this.actorState = EActorZoneState.INSIDE;
    registry.noWeaponZones.set(this.object.id(), true);

    EventsManager.emitEvent(EGameEvent.ACTOR_ENTER_NO_WEAPON_ZONE, this.object);
  }

  /**
   * Handle leave no-weapon zone event.
   */
  public onZoneLeave(): void {
    logger.info("Leaving no weapon zone: '%s'", this.object.name());

    this.actorState = EActorZoneState.OUTSIDE;
    registry.noWeaponZones.set(this.object.id(), false);

    EventsManager.emitEvent(EGameEvent.ACTOR_LEAVE_NO_WEAPON_ZONE, this.object);
  }
}
