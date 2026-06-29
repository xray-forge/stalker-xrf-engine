import { snd_type, time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { registry } from "@/engine/core/database";
import { combatConfig } from "@/engine/core/schemes/stalker/combat/CombatConfig";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger/danger_types";
import { canObjectSelectAsEnemy } from "@/engine/core/schemes/stalker/danger/utils";
import { isSoundType } from "@/engine/core/utils/sound";
import { EGameObjectRelation, GameObject, Optional, TNumberId, TRate, TSoundType, Vector } from "@/engine/lib/types";

/**
 * Manage danger events.
 */
export class DangerManager extends AbstractSchemeManager<ISchemeDangerState> {
  /**
   * Enter the danger state when the object hears hostile weapon sounds within reaction range.
   *
   * Todo: Warn squad?
   * Todo: If hear sound and already in danger just extend it?
   * Todo: Adjust sound power to ignore silencers or weak sounds.
   *
   * @param object - Game object that heard the sound.
   * @param whoId - Identifier of the object that produced the sound.
   * @param soundType - Type of the sound that was heard.
   * @param soundPosition - World position the sound originated from.
   * @param soundPower - Power of the heard sound.
   */
  public onHear(
    object: GameObject,
    whoId: TNumberId,
    soundType: TSoundType,
    soundPosition: Vector,
    soundPower: TRate
  ): void {
    const who: Optional<GameObject> = registry.objects.get(whoId)?.object;

    // If already in combat or no game object 'who'.
    if (!who || object.best_enemy()) {
      return;
    }

    // If object cannot select new enemy, ignore hearing logic.
    if (!canObjectSelectAsEnemy(object, who)) {
      return;
    }

    // Set danger state by hearing weapon bullets.
    if (isSoundType(soundType, snd_type.weapon_bullet_hit) && object.relation(who) === EGameObjectRelation.ENEMY) {
      const isSoundNear: boolean =
        object.position().distance_to_sqr(soundPosition) <= combatConfig.BULLET_REACT_DISTANCE_SQR;

      /**
       * If sound is near:
       *  - If source object is enemy, start warning state.
       */
      if (isSoundNear) {
        this.state.dangerTime = time_global();
        object.set_dest_level_vertex_id(who.level_vertex_id());
      }
    } else if (isSoundType(soundType, snd_type.weapon)) {
      const shootingAt: Optional<GameObject> = who.best_enemy();

      // If hear others shooting at enemy OR enemy shooting in range, try to help
      if (
        ((shootingAt && object.relation(shootingAt) === EGameObjectRelation.ENEMY) ||
          object.relation(who) === EGameObjectRelation.ENEMY) &&
        object.position().distance_to_sqr(soundPosition) <= combatConfig.ALLIES_SHOOTING_ASSIST_DISTANCE_SQR
      ) {
        this.state.dangerTime = time_global();
        object.set_dest_level_vertex_id(who.level_vertex_id());
      }
    }
  }
}
