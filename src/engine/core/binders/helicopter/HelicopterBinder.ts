import { callback, CHelicopter, clsid, level, LuabindClass, object_binder } from "xray16";

import {
  closeLoadMarker,
  closeSaveMarker,
  getManager,
  IRegistryObjectState,
  openLoadMarker,
  openSaveMarker,
  registerHelicopter,
  registry,
  resetObject,
  SYSTEM_INI,
  unregisterHelicopter,
} from "@/engine/core/database";
import { loadObjectLogic, saveObjectLogic } from "@/engine/core/database/logic";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { HelicopterCombatManager } from "@/engine/core/schemes/helicopter/heli_move/combat/HelicopterCombatManager";
import { HelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/fire/HelicopterFireManager";
import { getHelicopterFireManager } from "@/engine/core/schemes/helicopter/heli_move/utils";
import { getHelicopterHealth } from "@/engine/core/utils/helicopter";
import { readIniNumber } from "@/engine/core/utils/ini";
import { emitSchemeEvent, initializeObjectSchemeLogic } from "@/engine/core/utils/scheme";
import {
  ESchemeEvent,
  ESchemeType,
  GameObject,
  NetPacket,
  NetReader,
  Optional,
  ServerObject,
  TClassId,
  TDistance,
  TDuration,
  TIndex,
  TNumberId,
  TRate,
  Vector,
} from "@/engine/lib/types";

/**
 * Binder for helicopter game object events and logics.
 */
@LuabindClass()
export class HelicopterBinder extends object_binder {
  public isLoaded: boolean = false;
  public inInitialized: boolean = false;

  public state!: IRegistryObjectState;
  public helicopter: CHelicopter;
  public helicopterFireManager: HelicopterFireManager;
  public combatManager!: HelicopterCombatManager;

  public flameStartHealth: TRate = 0;

  public constructor(object: GameObject) {
    super(object);

    this.helicopter = this.object.get_helicopter();
    this.helicopterFireManager = getHelicopterFireManager(object);
  }

  public override reinit(): void {
    super.reinit();

    this.state = resetObject(this.object);

    this.combatManager = new HelicopterCombatManager(this.object);
    this.flameStartHealth = readIniNumber(SYSTEM_INI, "helicopter", "flame_start_health", true);

    this.object.set_callback(callback.helicopter_on_point, this.onWaypoint, this);
    this.object.set_callback(callback.helicopter_on_hit, this.onHit, this);
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (!this.inInitialized && registry.actor !== null) {
      this.inInitialized = true;
      initializeObjectSchemeLogic(this.object, this.state, this.isLoaded, ESchemeType.HELICOPTER);
    }

    if (this.state.activeScheme) {
      emitSchemeEvent(this.state[this.state.activeScheme]!, ESchemeEvent.UPDATE, delta);
    }

    // Check helicopter health and state.
    if (!this.helicopter.m_dead) {
      const health: TRate = getHelicopterHealth(this.helicopter, this.state.invulnerable);

      if (health < this.flameStartHealth && !this.helicopter.m_flame_started) {
        this.helicopter.StartFlame();
      }

      if (health <= 0.005 && !this.state.immortal) {
        this.helicopter.Die();
        unregisterHelicopter(this);
      }
    }

    getManager(SoundManager).update(this.object.id());
  }

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    registerHelicopter(this);

    return true;
  }

  public override net_destroy(): void {
    unregisterHelicopter(this);

    super.net_destroy();
  }

  public override net_save_relevant(): boolean {
    return true;
  }

  public override save(packet: NetPacket): void {
    openSaveMarker(packet, HelicopterBinder.__name);

    super.save(packet);

    saveObjectLogic(this.object, packet);

    closeSaveMarker(packet, HelicopterBinder.__name);

    this.combatManager.save(packet);
  }

  public override load(reader: NetReader): void {
    this.isLoaded = true;

    openLoadMarker(reader, HelicopterBinder.__name);

    super.load(reader);

    loadObjectLogic(this.object, reader);

    closeLoadMarker(reader, HelicopterBinder.__name);

    this.combatManager.load(reader);
  }

  /**
   * @param power - hit power
   * @param impulse - impulse power
   * @param type - type of the hit
   * @param objectId - object hitting helicopter
   */
  public onHit(power: TRate, impulse: TRate, type: TNumberId, objectId: TNumberId): void {
    const enemy: Optional<GameObject> = level.object_by_id(objectId);
    const enemyClassId: Optional<TClassId> = enemy?.clsid() as Optional<TClassId>;

    this.helicopterFireManager.enemy = enemy;
    this.helicopterFireManager.onHit();

    if (this.state.hit && (enemyClassId === clsid.actor || enemyClassId === clsid.script_stalker)) {
      emitSchemeEvent(this.state.hit, ESchemeEvent.HIT, this.object, power, null, enemy, null);
    }
  }

  /**
   * @param distance - ?
   * @param position - waypoint position
   * @param index - patrol point index
   */
  public onWaypoint(distance: TDistance, position: Vector, index: TIndex): void {
    if (this.state.activeScheme) {
      emitSchemeEvent(this.state[this.state.activeScheme]!, ESchemeEvent.WAYPOINT, this.object, null, index);
    }
  }
}
