import { action_base, danger_object, LuabindClass, move, time_global } from "xray16";

import { setStalkerState } from "@/engine/core/database";
import { EStalkerState, ILookTargetDescriptor } from "@/engine/core/objects/state";
import { EZombieCombatAction, ISchemeCombatState } from "@/engine/core/schemes/combat/ISchemeCombatState";
import { LuaLogger } from "@/engine/core/utils/logging";
import { sendToNearestAccessibleVertex } from "@/engine/core/utils/object/object_general";
import {
  ClientObject,
  DangerObject,
  EClientObjectPath,
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
export class ActionZombieGoToDanger extends action_base {
  public state: ISchemeCombatState;
  public targetState: ILookTargetDescriptor = { lookObject: null, lookPosition: null };

  public wasHit: boolean = false;
  public hitReactionEndTime: TTimestamp = 0;

  public lastState: Optional<EStalkerState> = null;
  public bestDangerObjectVertexId: Optional<TNumberId> = null;
  public lastSentVertexId: Optional<TNumberId> = null;
  public bestDangerObjectId: Optional<TNumberId> = null;

  public enemyLastSeenPos: Optional<Vector> = null;
  public enemyLastSeenVid: Optional<TNumberId> = null;

  public constructor(state: ISchemeCombatState) {
    super(null, ActionZombieGoToDanger.__name);
    this.state = state;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    logger.info("Go to danger:", this.object.name());

    super.initialize();

    this.object.set_desired_direction();
    this.object.set_detail_path_type(move.line);
    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);
    this.lastState = null;
    this.bestDangerObjectId = null;
    this.bestDangerObjectVertexId = null;
    this.lastSentVertexId = null;
    this.state.currentAction = EZombieCombatAction.DANGER;
  }

  /**
   * todo: Description.
   */
  public setState(state: EStalkerState, bestEnemy: Optional<ClientObject>, position: Optional<Vector>): void {
    if (state !== this.lastState) {
      this.targetState.lookObject = bestEnemy;
      this.targetState.lookPosition = position;
      setStalkerState(this.object, state, null, null, this.targetState);
      this.lastState = state;
    }
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    const now: TTimestamp = time_global();

    if (this.wasHit) {
      this.wasHit = false;
      this.hitReactionEndTime = now + 5000;
      this.setState(EStalkerState.RAID_FIRE, null, this.enemyLastSeenPos);
    } else if (this.hitReactionEndTime > now) {
      // -
    } else {
      const bestDanger: DangerObject = this.object.best_danger()!;
      const object: Optional<ClientObject> = bestDanger.object();

      if (object && bestDanger.type() !== danger_object.grenade) {
        if (!this.bestDangerObjectId || this.bestDangerObjectId !== object.id()) {
          this.bestDangerObjectId = object.id();
          this.bestDangerObjectVertexId = object.level_vertex_id();
        }

        if (this.bestDangerObjectVertexId !== this.lastSentVertexId) {
          this.lastSentVertexId = this.bestDangerObjectVertexId;
          sendToNearestAccessibleVertex(this.object, this.bestDangerObjectVertexId!);
        }

        this.setState(EStalkerState.RAID, null, bestDanger.position());
      } else {
        this.setState(EStalkerState.THREAT_NA, null, bestDanger.position());
      }
    }
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    logger.info("Stop going to danger:", this.object.name());

    super.finalize();
    this.state.currentAction = null;
  }

  /**
   * todo: Description.
   */
  public onHit(object: ClientObject, amount: TRate, direction: Vector, who: ClientObject, boneId: TIndex): void {
    if (who === null) {
      return;
    }

    if (this.state.currentAction === EZombieCombatAction.DANGER) {
      const bestDanger: Optional<DangerObject> = this.object.best_danger();

      if (bestDanger) {
        const bestDangerObject: Optional<ClientObject> = bestDanger.object();

        if (bestDangerObject !== null && (bestDanger.type() === danger_object.attacked || amount > 0)) {
          this.enemyLastSeenPos = bestDangerObject.position();
          this.enemyLastSeenVid = bestDangerObject.level_vertex_id();
          this.wasHit = true;
        }
      }
    }
  }
}
