import { alife, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded/ISchemeWoundedState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/ini_config";
import { LuaLogger } from "@/engine/core/utils/logging";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { misc } from "@/engine/lib/constants/items/misc";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import {
  AlifeSimulator,
  ClientObject,
  LuaArray,
  Optional,
  TCount,
  TIndex,
  TRate,
  TTimestamp,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manager to handle wounded state of stalkers.
 * On low HP eat medkits / lay on the floor and call for help.
 */
export class WoundManager extends AbstractSchemeManager<ISchemeWoundedState> {
  public canUseMedkit: boolean = false;

  public fight!: string;
  public cover!: string;
  public victim!: string;
  public sound!: string;
  public woundState!: string;

  /**
   * Handle recalculation of wounded state on each iteration.
   */
  public update(): void {
    const hp: TCount = 100 * this.object.health;
    const psy: TCount = 100 * this.object.psy_health;

    const [nextState, nextSound] = this.processPsyWound(psy);

    this.woundState = nextState;
    this.sound = nextSound;

    if (this.woundState === NIL && this.sound === NIL) {
      const [state, sound] = this.processHPWound(hp);

      this.woundState = state;
      this.sound = sound;

      this.fight = this.processFight(hp);
      this.victim = this.processVictim(hp);
    } else {
      this.fight = FALSE;
      this.cover = FALSE;
      this.victim = NIL;
    }

    setPortableStoreValue(this.object.id(), "wounded_state", this.woundState);
    setPortableStoreValue(this.object.id(), "wounded_sound", this.sound);
    setPortableStoreValue(this.object.id(), "wounded_fight", this.fight);
    setPortableStoreValue(this.object.id(), "wounded_victim", this.victim);
  }

  /**
   * todo: Description.
   */
  public unlockMedkit(): void {
    this.canUseMedkit = true;
  }

  /**
   * todo: Description.
   */
  public eatMedkit(): void {
    if (this.canUseMedkit) {
      logger.info("Eat medkit:", this.object.name());

      if (this.object.object(misc.medkit_script) !== null) {
        this.object.eat(this.object.object(misc.medkit_script) as ClientObject);
      }

      const simulator: AlifeSimulator = alife();

      if (this.object.object(drugs.medkit) !== null) {
        simulator.release(simulator.object(this.object.object(drugs.medkit)!.id()), true);
      } else if (this.object.object(drugs.medkit_army) !== null) {
        simulator.release(simulator.object(this.object.object(drugs.medkit_army)!.id()), true);
      } else if (this.object.object(drugs.medkit_scientic) !== null) {
        simulator.release(simulator.object(this.object.object(drugs.medkit_scientic)!.id()), true);
      }

      const now: TTimestamp = time_global();
      const beginAt: Optional<TTimestamp> = getPortableStoreValue(this.object.id(), "begin_wounded");

      if (beginAt !== null && now - beginAt <= 60_000) {
        GlobalSoundManager.getInstance().playSound(this.object.id(), "help_thanks");
      }

      setPortableStoreValue(this.object.id(), "begin_wounded", null);
    }

    this.canUseMedkit = false;
    this.update();
  }

  /**
   * todo: Description.
   */
  public processFight(hp: TRate): string {
    const key: Optional<TIndex> = this.getKeyFromDistance(this.state.hp_fight, hp);

    if (key !== null) {
      if (this.state.hp_fight.get(key).state) {
        return tostring(pickSectionFromCondList(registry.actor, this.object, this.state.hp_fight.get(key).state));
      }
    }

    return TRUE;
  }

  /**
   * todo: Description.
   */
  public processVictim(hp: TRate): string {
    const key: Optional<TIndex> = this.getKeyFromDistance(this.state.hp_victim, hp);

    if (key !== null) {
      if (this.state.hp_victim.get(key).state) {
        return tostring(pickSectionFromCondList(registry.actor, this.object, this.state.hp_victim.get(key).state));
      }
    }

    return NIL;
  }

  /**
   * todo: Description.
   */
  public processHPWound(hp: TRate): LuaMultiReturn<[string, string]> {
    const key: Optional<TIndex> = this.getKeyFromDistance(this.state.hp_state, hp);

    if (key !== null) {
      let r1: Optional<string> = null;
      let r2: Optional<string> = null;

      if (this.object.see(registry.actor)) {
        if (this.state.hp_state_see.get(key).state) {
          r1 = pickSectionFromCondList(registry.actor, this.object, this.state.hp_state_see.get(key).state);
        }

        if (this.state.hp_state_see.get(key).sound) {
          r2 = pickSectionFromCondList(registry.actor, this.object, this.state.hp_state_see.get(key).sound);
        }
      } else {
        if (this.state.hp_state.get(key).state) {
          r1 = pickSectionFromCondList(registry.actor, this.object, this.state.hp_state.get(key).state);
        }

        if (this.state.hp_state.get(key).sound) {
          r2 = pickSectionFromCondList(registry.actor, this.object, this.state.hp_state.get(key).sound);
        }
      }

      return $multi(tostring(r1), tostring(r2));
    }

    return $multi(NIL, NIL);
  }

  /**
   * todo: Description.
   */
  public processPsyWound(hp: TCount): LuaMultiReturn<[string, string]> {
    const key: Optional<TIndex> = this.getKeyFromDistance(this.state.psy_state, hp);

    if (key !== null) {
      let r1: Optional<string> = null;
      let r2: Optional<string> = null;

      if (this.state.psy_state.get(key).state) {
        r1 = pickSectionFromCondList(registry.actor, this.object, this.state.psy_state.get(key).state);
      }

      if (this.state.psy_state.get(key).sound) {
        r2 = pickSectionFromCondList(registry.actor, this.object, this.state.psy_state.get(key).sound);
      }

      return $multi(tostring(r1), tostring(r2));
    }

    return $multi(NIL, NIL);
  }

  /**
   * todo: Description.
   */
  public getKeyFromDistance(list: LuaArray<any>, hp: TRate): Optional<number> {
    let key: Optional<number> = null;

    for (const [k, v] of list) {
      if (v.dist >= hp) {
        key = k;
      } else {
        return key;
      }
    }

    return key;
  }

  /**
   * Handle object being hit.
   * Recalculate wounded states.
   */
  public override onHit(): void {
    if (!this.object.alive() || this.object.critically_wounded()) {
      return;
    }

    this.update();
  }
}