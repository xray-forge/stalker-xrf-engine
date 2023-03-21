import { alife, time_global, XR_alife_simulator, XR_game_object } from "xray16";

import { registry } from "@/engine/core/database";
import { portableStoreGet, portableStoreSet } from "@/engine/core/database/portable_store";
import { GlobalSoundManager } from "@/engine/core/managers/GlobalSoundManager";
import { AbstractSchemeManager } from "@/engine/core/schemes/base/AbstractSchemeManager";
import { ISchemeWoundedState } from "@/engine/core/schemes/wounded/ISchemeWoundedState";
import { pickSectionFromCondList } from "@/engine/core/utils/ini/config";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { FALSE, NIL, TRUE } from "@/engine/lib/constants/words";
import { LuaArray, Optional, TCount, TRate } from "@/engine/lib/types";

/**
 * todo;
 */
export class WoundManager extends AbstractSchemeManager<ISchemeWoundedState> {
  public can_use_medkit: boolean = false;

  public fight!: string;
  public cover!: string;
  public victim!: string;
  public sound!: string;
  public wound_state!: string;

  /**
   * todo: Description.
   */
  public constructor(object: XR_game_object, state: ISchemeWoundedState) {
    super(object, state);
  }

  /**
   * todo: Description.
   */
  public override update(): void {
    const hp: TCount = 100 * this.object.health;
    const psy: TCount = 100 * this.object.psy_health;

    const [nState, nSound] = this.process_psy_wound(psy);

    this.wound_state = nState;
    this.sound = nSound;

    if (this.wound_state === NIL && this.sound === NIL) {
      const [state, sound] = this.process_hp_wound(hp);

      this.wound_state = state;
      this.sound = sound;

      this.fight = this.processFight(hp);
      this.victim = this.process_victim(hp);
    } else {
      this.fight = FALSE;
      this.cover = FALSE;
      this.victim = NIL;
    }

    portableStoreSet(this.object, "wounded_state", this.wound_state);
    portableStoreSet(this.object, "wounded_sound", this.sound);
    portableStoreSet(this.object, "wounded_fight", this.fight);
    portableStoreSet(this.object, "wounded_victim", this.victim);
  }

  /**
   * todo: Description.
   */
  public unlockMedkit(): void {
    this.can_use_medkit = true;
  }

  /**
   * todo: Description.
   */
  public eatMedkit(): void {
    if (this.can_use_medkit) {
      if (this.object.object("medkit_script") !== null) {
        this.object.eat(this.object.object("medkit_script")!);
      }

      const sim: XR_alife_simulator = alife();

      if (this.object.object(drugs.medkit) !== null) {
        sim.release(sim.object(this.object.object(drugs.medkit)!.id()), true);
      } else if (this.object.object(drugs.medkit_army) !== null) {
        sim.release(sim.object(this.object.object(drugs.medkit_army)!.id()), true);
      } else if (this.object.object(drugs.medkit_scientic) !== null) {
        sim.release(sim.object(this.object.object(drugs.medkit_scientic)!.id()), true);
      }

      const current_time: number = time_global();
      const begin_wounded: Optional<number> = portableStoreGet(this.object, "begin_wounded");

      if (begin_wounded !== null && current_time - begin_wounded <= 60000) {
        GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), "help_thanks", null, null);
      }

      portableStoreSet(this.object, "begin_wounded", null);
    }

    this.can_use_medkit = false;
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
  public process_victim(hp: TRate): string {
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
  public process_hp_wound(hp: TRate): LuaMultiReturn<[string, string]> {
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
  public process_psy_wound(hp: number): LuaMultiReturn<[string, string]> {
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
