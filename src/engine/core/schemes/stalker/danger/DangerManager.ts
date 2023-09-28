import { level, snd_type, time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/objects/ai/scheme";
import { ISchemeDangerState } from "@/engine/core/schemes/stalker/danger/ISchemeDangerState";
import { canObjectSelectAsEnemy } from "@/engine/core/schemes/stalker/danger/utils";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isSoundType } from "@/engine/core/utils/sound";
import { logicsConfig } from "@/engine/lib/configs/LogicsConfig";
import {
  ClientObject,
  EClientObjectRelation,
  Optional,
  TNumberId,
  TRate,
  TSoundType,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Manage danger events.
 */
export class DangerManager extends AbstractSchemeManager<ISchemeDangerState> {
  /**
   * Based on hearing enemies or different events turn on danger state.
   * todo: Warn squad?
   * todo: If hear sound and already in danger just extend it?
   * todo: Adjust sound power to ignore silencers or weak sounds
   * todo: Description.
   */
  public onHear(
    object: ClientObject,
    whoId: TNumberId,
    soundType: TSoundType,
    soundPosition: Vector,
    soundPower: TRate
  ): void {
    const who: Optional<ClientObject> = level.object_by_id(whoId);

    // If already in combat or no client object 'who'.
    if (!who || object.best_enemy()) {
      return;
    }

    // If object cannot select new enemy, ignore hearing logic.
    if (!canObjectSelectAsEnemy(object, who)) {
      return;
    }

    const isEnemySound: boolean = object.relation(who) === EClientObjectRelation.ENEMY;

    // Set danger state by hearing weapon bullets.
    if (isEnemySound && isSoundType(soundType, snd_type.weapon_bullet_hit)) {
      const isSoundNear: boolean =
        object.position().distance_to_sqr(soundPosition) <= logicsConfig.COMBAT.BULLET_REACT_DISTANCE_SQR;

      /**
       * If sound is near:
       *  - If source object is enemy, start warning state
       */
      if (isSoundNear) {
        this.state.dangerTime = time_global();
        object.set_dest_level_vertex_id(who.level_vertex_id());
      }
    } else if (isSoundType(soundType, snd_type.weapon)) {
      const shootingAt: Optional<ClientObject> = who.best_enemy();

      // If hear others shooting at enemy OR enemy shooting in range, try to help
      if (
        ((shootingAt && object.relation(shootingAt) === EClientObjectRelation.ENEMY) || isEnemySound) &&
        object.position().distance_to_sqr(soundPosition) <= logicsConfig.COMBAT.ALLIES_SHOOTING_ASSIST_DISTANCE_SQR
      ) {
        this.state.dangerTime = time_global();
        object.set_dest_level_vertex_id(who.level_vertex_id());
      }
    }
  }
}
