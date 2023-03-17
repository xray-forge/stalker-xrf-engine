import { alife, time_global, XR_alife_simulator, XR_game_object } from "xray16";

import { drugs } from "@/engine/lib/constants/items/drugs";
import { STRINGIFIED_FALSE, STRINGIFIED_NIL, STRINGIFIED_TRUE } from "@/engine/lib/constants/lua";
import { LuaArray, Optional, TCount, TRate } from "@/engine/lib/types";
import { registry } from "@/engine/scripts/core/database";
import { pstor_retrieve, pstor_store } from "@/engine/scripts/core/database/pstor";
import { GlobalSoundManager } from "@/engine/scripts/core/managers/GlobalSoundManager";
import { AbstractSchemeManager } from "@/engine/scripts/core/schemes/base/AbstractSchemeManager";
import { ISchemeWoundedState } from "@/engine/scripts/core/schemes/wounded/ISchemeWoundedState";
import { pickSectionFromCondList } from "@/engine/scripts/utils/config";

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
   * todo;
   */
  public constructor(object: XR_game_object, state: ISchemeWoundedState) {
    super(object, state);
  }

  /**
   * todo;
   */
  public override update(): void {
    const hp: TCount = 100 * this.object.health;
    const psy: TCount = 100 * this.object.psy_health;

    const [nState, nSound] = this.process_psy_wound(psy);

    this.wound_state = nState;
    this.sound = nSound;

    if (this.wound_state === STRINGIFIED_NIL && this.sound === STRINGIFIED_NIL) {
      const [state, sound] = this.process_hp_wound(hp);

      this.wound_state = state;
      this.sound = sound;

      this.fight = this.processFight(hp);
      this.victim = this.process_victim(hp);
    } else {
      this.fight = STRINGIFIED_FALSE;
      this.cover = STRINGIFIED_FALSE;
      this.victim = STRINGIFIED_NIL;
    }

    pstor_store(this.object, "wounded_state", this.wound_state);
    pstor_store(this.object, "wounded_sound", this.sound);
    pstor_store(this.object, "wounded_fight", this.fight);
    pstor_store(this.object, "wounded_victim", this.victim);
  }

  /**
   * todo;
   */
  public unlockMedkit(): void {
    this.can_use_medkit = true;
  }

  /**
   * todo;
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
      const begin_wounded: Optional<number> = pstor_retrieve(this.object, "begin_wounded");

      if (begin_wounded !== null && current_time - begin_wounded <= 60000) {
        GlobalSoundManager.getInstance().setSoundPlaying(this.object.id(), "help_thanks", null, null);
      }

      pstor_store(this.object, "begin_wounded", null);
    }

    this.can_use_medkit = false;
    this.update();
  }

  /**
   * todo;
   */
  public processFight(hp: TRate): string {
    const key = this.getKeyFromDistance(this.state.hp_fight, hp);

    if (key !== null) {
      if (this.state.hp_fight.get(key).state) {
        return tostring(pickSectionFromCondList(registry.actor, this.object, this.state.hp_fight.get(key).state));
      }
    }

    return STRINGIFIED_TRUE;
  }

  /**
   * todo;
   */
  public process_victim(hp: TRate): string {
    const key = this.getKeyFromDistance(this.state.hp_victim, hp);

    if (key !== null) {
      if (this.state.hp_victim.get(key).state) {
        return tostring(pickSectionFromCondList(registry.actor, this.object, this.state.hp_victim.get(key).state));
      }
    }

    return STRINGIFIED_NIL;
  }

  /**
   * todo;
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

    return $multi(STRINGIFIED_NIL, STRINGIFIED_NIL);
  }

  /**
   * todo;
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

    return $multi(STRINGIFIED_NIL, STRINGIFIED_NIL);
  }

  /**
   * todo;
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
   * todo;
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
