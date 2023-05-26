import { action_base, game_object, level, LuabindClass, move, time_global, vector } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { GlobalSoundManager } from "@/engine/core/managers/sounds/GlobalSoundManager";
import { EStalkerState, ITargetStateDescriptor } from "@/engine/core/objects/state";
import { EZombieCombatAction, ISchemeCombatState } from "@/engine/core/schemes/combat/ISchemeCombatState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { chance } from "@/engine/core/utils/number";
import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";
import { Optional, TNumberId, TRate, TTimestamp } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionZombieShoot extends action_base {
  public state: ISchemeCombatState;
  public targetStateDescriptor: ITargetStateDescriptor = {
    look_position: null,
    look_object: null,
  };

  public wasHit: boolean = false;

  public enemyLastSeenVertexId!: TNumberId;
  public enemyLastSeenPosition: Optional<vector> = null;
  public enemyLastVertexId: Optional<TNumberId> = null;
  public enemyLastAccessibleVertexId: Optional<TNumberId> = null;
  public enemyLastAccessiblePosition: Optional<vector> = null;

  public hitReactionEndTime: TTimestamp = 0;
  public turnTime: TTimestamp = 0;

  public isValidPath: boolean = false;
  public previousState: Optional<EStalkerState> = null;

  /**
   * todo: Description.
   */
  public constructor(state: ISchemeCombatState) {
    super(null, ActionZombieShoot.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_direction();
    this.object.set_detail_path_type(move.line);

    this.previousState = null;

    const bestEnemy: game_object = this.object.best_enemy() as game_object;

    this.enemyLastSeenPosition = bestEnemy.position();
    this.enemyLastSeenVertexId = bestEnemy.level_vertex_id();
    this.enemyLastVertexId = null;
    this.isValidPath = false;
    this.turnTime = 0;
    this.state.currentAction = EZombieCombatAction.SHOOT;

    if (chance(25)) {
      GlobalSoundManager.getInstance().playSound(this.object.id(), scriptSounds.fight_attack);
    }
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    const bestEnemy: Optional<game_object> = this.object.best_enemy()!;
    const isBestEnemyVisible: boolean = this.object.see(bestEnemy);

    if (isBestEnemyVisible) {
      this.enemyLastSeenPosition = bestEnemy.position();
      this.enemyLastSeenVertexId = bestEnemy.level_vertex_id();
    }

    if (this.enemyLastVertexId !== this.enemyLastSeenVertexId) {
      this.enemyLastVertexId = this.enemyLastSeenVertexId;
      this.isValidPath = false;

      if (!this.object.accessible(this.enemyLastSeenVertexId)) {
        this.enemyLastAccessibleVertexId = this.object.accessible_nearest(
          level.vertex_position(this.enemyLastSeenVertexId),
          new vector()
        );
        this.enemyLastAccessiblePosition = null;
      } else {
        this.enemyLastAccessibleVertexId = this.enemyLastSeenVertexId;
        this.enemyLastAccessiblePosition = this.enemyLastSeenPosition;
      }
    }

    this.object.set_path_type(game_object.level_path);

    const now: TTimestamp = time_global();

    if (this.object.position().distance_to_sqr(this.enemyLastAccessiblePosition!) > 9) {
      if (!this.isValidPath) {
        this.isValidPath = true;
        this.object.set_dest_level_vertex_id(this.enemyLastAccessibleVertexId!);
      }

      if (isBestEnemyVisible) {
        this.setState(EStalkerState.RAID_FIRE, bestEnemy, null);
      } else if (this.wasHit) {
        this.wasHit = false;
        this.hitReactionEndTime = now + 5000;

        this.setState(EStalkerState.RAID_FIRE, null, this.enemyLastSeenPosition);
      } else if (this.hitReactionEndTime > now) {
        // Continue walking
      } else {
        this.setState(EStalkerState.RAID, null, this.enemyLastSeenPosition);
      }

      this.turnTime = 0;
    } else {
      // Stank and looking.
      if (isBestEnemyVisible) {
        this.setState(EStalkerState.THREAT_FIRE, null, null);
        this.turnTime = 0;
      } else {
        // Randomly searching for enemies.
        if (this.wasHit) {
          this.wasHit = false;
          this.turnTime = now + math.random(3000, 6000);
          this.setState(EStalkerState.THREAT_NA, null, this.enemyLastSeenPosition);
        } else if (this.turnTime < now) {
          this.turnTime = now + math.random(2500, 5000);
          this.setState(EStalkerState.THREAT_NA, null, this.getRandomLookDirection());
        }
      }
    }
  }

  /**
   * todo: Description.
   */
  public setState(state: EStalkerState, bestEnemy: Optional<game_object>, position: Optional<vector>): void {
    this.targetStateDescriptor.look_object = bestEnemy;
    this.targetStateDescriptor.look_position = bestEnemy ? this.enemyLastSeenPosition : position;

    setStalkerState(this.object, state, null, null, this.targetStateDescriptor, null);

    this.previousState = state;
  }

  /**
   * todo: Description.
   */
  public getRandomLookDirection(): vector {
    const angle: TRate = math.pi * 2 * math.random();
    const lookPosition: vector = new vector().set(this.object.position());

    lookPosition.x = lookPosition.x + math.cos(angle);
    lookPosition.z = lookPosition.z + math.sin(angle);

    return lookPosition;
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();
    this.state.currentAction = null;
  }

  /**
   * todo: Description.
   */
  public hit_callback(object: game_object, amount: TRate, direction: vector, who: game_object, bone_id: number): void {
    if (who === null) {
      return;
    }

    if (this.state.currentAction === EZombieCombatAction.SHOOT) {
      const bestEnemy: Optional<game_object> = this.object?.best_enemy();

      if (bestEnemy && bestEnemy.id() === who.id()) {
        this.wasHit = true;
        this.enemyLastSeenPosition = bestEnemy.position();
        this.enemyLastSeenVertexId = bestEnemy.level_vertex_id();
      }
    }
  }
}
