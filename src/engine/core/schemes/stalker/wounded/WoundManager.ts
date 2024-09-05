import { time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { getManager, registry } from "@/engine/core/database";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database/portable_store";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import {
  processFight,
  processHPWound,
  processPsyWound,
  processVictim,
} from "@/engine/core/schemes/stalker/wounded/utils";
import { ISchemeWoundedState } from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { misc } from "@/engine/lib/constants/items/misc";
import { FALSE, NIL } from "@/engine/lib/constants/words";
import { AlifeSimulator, GameObject, Optional, TCount, TNumberId, TTimestamp } from "@/engine/lib/types";

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
    const state: ISchemeWoundedState = this.state;
    const object: GameObject = this.object;
    const objectId: TNumberId = object.id();
    const hp: TCount = 100 * object.health;
    const psyHp: TCount = 100 * object.psy_health;

    const [nextState, nextSound] = processPsyWound(object, state.psyState, psyHp);

    this.woundState = nextState;
    this.sound = nextSound;

    if (this.woundState === NIL && this.sound === NIL) {
      const [woundState, woundSound] = processHPWound(object, state.hpState, state.hpStateSee, hp);

      this.woundState = woundState;
      this.sound = woundSound;

      this.fight = processFight(object, state.hpFight, hp);
      this.victim = processVictim(object, state.hpVictim, hp);
    } else {
      this.fight = FALSE;
      this.cover = FALSE;
      this.victim = NIL;
    }

    setPortableStoreValue(objectId, "wounded_state", this.woundState);
    setPortableStoreValue(objectId, "wounded_sound", this.sound);
    setPortableStoreValue(objectId, "wounded_fight", this.fight);
    setPortableStoreValue(objectId, "wounded_victim", this.victim);
  }

  /**
   * Allow usage of medkit by wounded victim.
   */
  public unlockMedkit(): void {
    this.canUseMedkit = true;
  }

  /**
   * todo: Description.
   */
  public useMedkit(): void {
    if (this.canUseMedkit) {
      const object: GameObject = this.object;

      logger.info("Eat medkit: %s", object.name());

      if (object.object(misc.medkit_script)) {
        object.eat(object.object(misc.medkit_script) as GameObject);
      }

      const simulator: AlifeSimulator = registry.simulator;

      // Remove one of medkits from inventory.
      // todo: Create util to consume medkits from worse to best?
      // todo: Create util to consume item if exists?
      if (object.object(drugs.medkit)) {
        simulator.release(simulator.object(object.object(drugs.medkit)!.id()), true);
      } else if (object.object(drugs.medkit_army)) {
        simulator.release(simulator.object(object.object(drugs.medkit_army)!.id()), true);
      } else if (object.object(drugs.medkit_scientic)) {
        simulator.release(simulator.object(object.object(drugs.medkit_scientic)!.id()), true);
      }

      const now: TTimestamp = time_global();
      const beginAt: Optional<TTimestamp> = getPortableStoreValue(object.id(), "begin_wounded");

      if (beginAt !== null && now - beginAt <= 60_000) {
        getManager(SoundManager).play(object.id(), "help_thanks");
      }

      setPortableStoreValue(object.id(), "begin_wounded", null);
    }

    this.canUseMedkit = false;
    this.update();
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
