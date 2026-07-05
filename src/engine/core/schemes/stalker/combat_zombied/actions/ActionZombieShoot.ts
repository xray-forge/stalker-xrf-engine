import { action_base, level, LuabindClass, move, time_global } from "xray16";
import { EGameObjectPath, GameObject, Vector } from "xray16/alias";
import { Nillable, TIndex, TNumberId, TRate, TTimestamp } from "xray16/lib";
import { $filename } from "xray16/macros";

import { EStalkerState, ILookTargetDescriptor } from "@/engine/core/animation/types";
import { getManager, setStalkerState } from "@/engine/core/database";
import { SoundManager } from "@/engine/core/managers/sounds/SoundManager";
import { EZombieCombatAction, ISchemeCombatState } from "@/engine/core/schemes/stalker/combat/combat_types";
import { LuaLogger } from "@/engine/core/utils/logging";
import { chance } from "@/engine/core/utils/random";
import { copyVector } from "@/engine/core/utils/vector";
import { ZERO_VECTOR } from "@/engine/lib/constants/vectors";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Action driving a zombied stalker to advance towards and shoot at its current enemy.
 * Tracks the last seen enemy position, reacts to hits and alternates between raiding and threatening states.
 */
@LuabindClass()
export class ActionZombieShoot extends action_base {
  public state: ISchemeCombatState;
  public targetStateDescriptor: ILookTargetDescriptor = {
    lookPosition: null,
    lookObjectId: null,
  };

  public wasHit: boolean = false;

  public enemyLastSeenVertexId: Nillable<TNumberId> = null;
  public enemyLastSeenPosition: Nillable<Vector> = null;
  public enemyLastVertexId: Nillable<TNumberId> = null;
  public enemyLastAccessibleVertexId: Nillable<TNumberId> = null;
  public enemyLastAccessiblePosition: Nillable<Vector> = null;

  public hitReactionEndTime: TTimestamp = 0;
  public turnTime: TTimestamp = 0;

  public isValidPath: boolean = false;
  public previousState: Nillable<EStalkerState> = null;

  public constructor(state: ISchemeCombatState) {
    super(null, ActionZombieShoot.__name);
    this.state = state;
  }

  /**
   * Initialize the action when the planner selects it, capturing the current enemy position and resetting state.
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
   * Finalize the action when the planner switches away, clearing the current combat action.
   */
  public override finalize(): void {
    logger.info("Deactivate: %s", this.object.name());

    super.finalize();
    this.state.currentAction = null;
  }

  /**
   * Execute the action logic on planner update, moving towards the enemy and selecting fire or search states.
   */
  public override execute(): void {
    super.execute();

    const bestEnemy: Nillable<GameObject> = this.object.best_enemy()!;
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
      // Stand and looking.
      if (isBestEnemyVisible) {
        this.setState(EStalkerState.THREAT_FIRE, bestEnemy, null);
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
   * Apply an animation state to the object with the given look target object or position.
   *
   * @param state - Stalker animation state to apply.
   * @param bestEnemy - Enemy game object to look at, if any.
   * @param position - Position to look at when no enemy is provided.
   */
  public setState(state: EStalkerState, bestEnemy: Nillable<GameObject>, position: Nillable<Vector>): void {
    this.targetStateDescriptor.lookObjectId = bestEnemy ? bestEnemy.id() : null;
    this.targetStateDescriptor.lookPosition = bestEnemy ? this.enemyLastSeenPosition : position;

    setStalkerState(this.object, state, null, null, this.targetStateDescriptor);

    this.previousState = state;
  }

  /**
   * Compute a random position around the object to look towards while searching for enemies.
   *
   * @returns Position offset from the object in a random direction.
   */
  public getRandomLookDirection(): Vector {
    const angle: TRate = math.pi * 2 * math.random();
    const lookPosition: Vector = copyVector(this.object.position());

    lookPosition.x += math.cos(angle);
    lookPosition.z += math.sin(angle);

    return lookPosition;
  }

  /**
   * Handle a hit on the object, flagging a reaction and updating the last seen enemy position when hit by the enemy.
   *
   * @param object - Object that received the hit.
   * @param amount - Amount of damage dealt.
   * @param direction - Direction the hit came from.
   * @param who - Game object that caused the hit, if any.
   * @param boneId - Identifier of the bone that was hit.
   */
  public onHit(object: GameObject, amount: TRate, direction: Vector, who: Nillable<GameObject>, boneId: TIndex): void {
    if (!who) {
      return;
    }

    if (this.state.currentAction === EZombieCombatAction.SHOOT) {
      const bestEnemy: Nillable<GameObject> = this.object?.best_enemy();

      if (bestEnemy && bestEnemy.id() === who.id()) {
        this.wasHit = true;
        this.enemyLastSeenPosition = bestEnemy.position();
        this.enemyLastSeenVertexId = bestEnemy.level_vertex_id();
      }
    }
  }
}
