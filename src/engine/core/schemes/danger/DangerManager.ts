import { level, snd_type, time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeDangerState } from "@/engine/core/schemes/danger/ISchemeDangerState";
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

    logger.info("HEAR SOUND:", object.name(), who.name(), soundType, soundPower);

    // Set danger state by hearing weapon bullets.
    if (isSoundType(soundType, snd_type.weapon_bullet_hit)) {
      const isSoundNear: boolean =
        object.position().distance_to_sqr(soundPosition) <= logicsConfig.COMBAT.BULLET_REACT_DISTANCE_SQR;
      const isEnemySound: boolean = object.relation(who) === EClientObjectRelation.ENEMY;

      /**
       * If sound is near:
       *  - If source object is enemy, start warning state
       *  - If source object is far and cannot tell, start warning state
       */
      if (
        isSoundNear &&
        (isEnemySound ||
          object.position().distance_to_sqr(who.position()) >= logicsConfig.COMBAT.BULLET_CONFUSED_DISTANCE_SQR ||
          !object.see(who))
      ) {
        this.state.dangerTime = time_global();
        object.set_dest_level_vertex_id(who.level_vertex_id());
      }
      // If hear others shooting at shared enemies, start danger.
    } else if (isSoundType(soundType, snd_type.weapon)) {
      const shootingAt: Optional<ClientObject> = who.best_enemy();

      if (
        shootingAt &&
        object.relation(shootingAt) === EClientObjectRelation.ENEMY &&
        object.position().distance_to_sqr(soundPosition) <= logicsConfig.COMBAT.ALLIES_SHOOTING_ASSIST_DISTANCE_SQR
      ) {
        this.state.dangerTime = time_global();
        object.set_dest_level_vertex_id(who.level_vertex_id());
      }
    }
  }
}
