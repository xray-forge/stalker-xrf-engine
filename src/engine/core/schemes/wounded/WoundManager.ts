import { alife, time_global } from "xray16";

import { registry } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded/ISchemeWoundedState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import { AlifeSimulator, LuaArray, Optional, TCount, TRate, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
export class WoundManager extends AbstractSchemeManager<ISchemeWoundedState> {
  public canUseMedkit: boolean = false;

  public fight!: string;
  public cover!: string;
  public victim!: string;
  public sound!: string;
  public woundState!: string;

  /**
   * todo: Description.
   */
  public override update(): void {
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

    setPortableStoreValue(this.object, "wounded_state", this.woundState);
    setPortableStoreValue(this.object, "wounded_sound", this.sound);
    setPortableStoreValue(this.object, "wounded_fight", this.fight);
    setPortableStoreValue(this.object, "wounded_victim", this.victim);
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
      if (this.object.object("medkit_script") !== null) {
        this.object.eat(this.object.object("medkit_script")!);
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
      const beginAt: Optional<TTimestamp> = getPortableStoreValue(this.object, "begin_wounded");

      if (beginAt !== null && now - beginAt <= 60_000) {
        GlobalSoundManager.getInstance().playSound(this.object.id(), "help_thanks", null, null);
      }

      setPortableStoreValue(this.object, "begin_wounded", null);
    }

    this.canUseMedkit = false;
    this.update();
  }

  /**
   * todo: Description.
   */
  public processFight(hp: TRate): string {
    const key = this.getKeyFromDistance(this.state.hp_fight, hp);

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
    const key = this.getKeyFromDistance(this.state.hp_victim, hp);

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
    const key = this.getKeyFromDistance(this.state.hp_state, hp);

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
    const key = this.getKeyFromDistance(this.state.psy_state, hp);

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
  public getKeyFromDistance(t: LuaArray<any>, hp: TRate): Optional<number> {
    let key: Optional<number> = null;

    for (const [k, v] of t) {
      if (v.dist >= hp) {
        key = k;
      } else {
        return key;
      }
    }

    return key;
  }

  /**
   * todo: Description.
   */
  public hit_callback(): void {
    if (!this.object.alive()) {
      return;
    }

    if (this.object.critically_wounded()) {
      return;
    }

    this.update();
  }
}
