import { action_base, level, LuabindClass, move, time_global } from "xray16";

import { EStalkerState, ILookTargetDescriptor } from "@/engine/core/animation/types";
import { getManager, setStalkerState } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { EZombieCombatAction, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { chance } from "@/engine/core/utils/random";
import { copyVector } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";
import {
  EGameObjectPath,
  GameObject,
  Optional,
  TIndex,
  TNumberId,
  TRate,
  TTimestamp,
  Vector,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ActionZombieShoot extends action_base {
  public state: ISchemeCombatState;
  public targetStateDescriptor: ILookTargetDescriptor = {
    lookPosition: null,
    lookObjectId: null,
  };

  public wasHit: boolean = false;

  public enemyLastSeenVertexId: Optional<TNumberId> = null;
  public enemyLastSeenPosition: Optional<Vector> = null;
  public enemyLastVertexId: Optional<TNumberId> = null;
  public enemyLastAccessibleVertexId: Optional<TNumberId> = null;
  public enemyLastAccessiblePosition: Optional<Vector> = null;

  public hitReactionEndTime: TTimestamp = 0;
  public turnTime: TTimestamp = 0;

  public isValidPath: boolean = false;
  public previousState: Optional<EStalkerState> = null;

  public constructor(state: ISchemeCombatState) {
    super(null, ActionZombieShoot.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    logger.info("Activate: %s", this.object.name());

    super.initialize();

    this.object.set_desired_direction();
    this.object.set_detail_path_type(move.line);

    this.previousState = null;

    const bestEnemy: GameObject = this.object.best_enemy() as GameObject;

    this.enemyLastSeenPosition = bestEnemy.position();
    this.enemyLastSeenVertexId = bestEnemy.level_vertex_id();
    this.enemyLastVertexId = null;
    this.isValidPath = false;
    this.turnTime = 0;
    this.state.currentAction = EZombieCombatAction.SHOOT;

    if (chance(25)) {
      getManager(SoundManager).play(this.object.id(), "fight_attack");
    }
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    logger.info("Deactivate: %s", this.object.name());

    super.finalize();
    this.state.currentAction = null;
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    const bestEnemy: Optional<GameObject> = this.object.best_enemy()!;
    const isBestEnemyVisible: boolean = this.object.see(bestEnemy);

    if (isBestEnemyVisible) {
      this.enemyLastSeenPosition = bestEnemy.position();
      this.enemyLastSeenVertexId = bestEnemy.level_vertex_id();
    }

    if (this.enemyLastVertexId !== this.enemyLastSeenVertexId) {
      this.enemyLastVertexId = this.enemyLastSeenVertexId;
      this.isValidPath = false;

      if (!this.object.accessible(this.enemyLastSeenVertexId as TNumberId)) {
        [this.enemyLastAccessibleVertexId, this.enemyLastAccessiblePosition] = this.object.accessible_nearest(
          level.vertex_position(this.enemyLastSeenVertexId as TNumberId),
          ZERO_VECTOR
        );
      } else {
        this.enemyLastAccessibleVertexId = this.enemyLastSeenVertexId;
        this.enemyLastAccessiblePosition = this.enemyLastSeenPosition;
      }
    }

    this.object.set_path_type(EGameObjectPath.LEVEL_PATH);

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
  public setState(state: EStalkerState, bestEnemy: Optional<GameObject>, position: Optional<Vector>): void {
    this.targetStateDescriptor.lookObjectId = bestEnemy ? bestEnemy.id() : null;
    this.targetStateDescriptor.lookPosition = bestEnemy ? this.enemyLastSeenPosition : position;

    setStalkerState(this.object, state, null, null, this.targetStateDescriptor);

    this.previousState = state;
  }

  /**
   * todo: Description.
   */
  public getRandomLookDirection(): Vector {
    const angle: TRate = math.pi * 2 * math.random();
    const lookPosition: Vector = copyVector(this.object.position());

    lookPosition.x += math.cos(angle);
    lookPosition.z += math.sin(angle);

    return lookPosition;
  }

  /**
   * todo: Description.
   */
  public onHit(object: GameObject, amount: TRate, direction: Vector, who: Optional<GameObject>, boneId: TIndex): void {
    if (who === null) {
      return;
    }

    if (this.state.currentAction === EZombieCombatAction.SHOOT) {
      const bestEnemy: Optional<GameObject> = this.object?.best_enemy();

      if (bestEnemy && bestEnemy.id() === who.id()) {
        this.wasHit = true;
        this.enemyLastSeenPosition = bestEnemy.position();
        this.enemyLastSeenVertexId = bestEnemy.level_vertex_id();
      }
    }
  }
}
