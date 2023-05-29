import { action_base, level, LuabindClass, time_global } from "xray16";

import { registry, setStalkerState } from "@/engine/core/database";
import { EStalkerState, ILookTargetDescriptor } from "@/engine/core/objects/state";
import { ISchemeCompanionState } from "@/engine/core/schemes/companion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { vectorRotateY } from "@/engine/core/utils/vector";
import { ClientObject, EClientObjectPath, Optional, Vector } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

const BEH_WALK_SIMPLE = 0;
const BEH_WALK_NEAR = 1;
const BEH_WALK_IGNORE = 2;
const BEH_WAIT_SIMPLE = 3;
const BEH_WAIT_NEAR = 4;
const BEH_WAIT_IGNORE = 5;

const MT_STAND = 0;
const MT_WALK = 1;
const MT_RUN = 2;
const MT_SPRINT = 3;

const DESIRED_DISTANCE = 1;
const MIN_DISTANCE = 1;
const KEEP_STATE_MIN_TIME = 1000;

const DIST_WALK = 4;
const DIST_RUN = 20;

const SOUND_WAIT = "weather,state";

/**
 * todo;
 */
@LuabindClass()
export class ActionCompanionActivity extends action_base {
  public state: ISchemeCompanionState;

  public assistPoint: Optional<number> = null;
  public keepStateUntil: number = 0;
  public lastState: EStalkerState = EStalkerState.GUARD_NA;

  public constructor(storage: ISchemeCompanionState) {
    super(null, ActionCompanionActivity.__name);
    this.state = storage;
  }

  /**
   * todo: Description.
   */
  public override initialize(): void {
    super.initialize();

    this.object.set_desired_position();
    this.object.set_desired_direction();
    this.object.enable_talk();

    this.assistPoint = null;
    this.lastState = EStalkerState.GUARD_NA;

    setStalkerState(this.object, this.lastState, null, null, null, { animation: true });

    this.keepStateUntil = time_global();
  }

  /**
   * todo: Description.
   */
  public behWalkSimple(): void {
    const actor: Optional<ClientObject> = registry.actor;
    let selectNewPt: boolean = false;
    const distFromSelfToActor: number = this.object.position().distance_to(actor.position());
    const distFromAssistPtToActor: Optional<number> = this.assistPoint
      ? level.vertex_position(this.assistPoint).distance_to(actor.position())
      : null;

    if (
      distFromSelfToActor >= DESIRED_DISTANCE &&
      (!distFromAssistPtToActor || distFromAssistPtToActor >= DESIRED_DISTANCE * 2)
    ) {
      selectNewPt = true;
    }

    if (selectNewPt) {
      this.assistPoint = selectPosition(this.object, this.state);
      if (!this.assistPoint) {
        return;
      }
    } else if (!this.assistPoint) {
      return;
    }

    this.object.set_path_type(EClientObjectPath.LEVEL_PATH);
    this.object.set_dest_level_vertex_id(this.assistPoint);

    const distToAssistPt = level.vertex_position(this.assistPoint).distance_to(this.object.position());
    let nextState: Optional<EStalkerState> = null;
    let target: Optional<ILookTargetDescriptor> = null;

    if (this.object.level_vertex_id() === this.assistPoint) {
      nextState = EStalkerState.THREAT;
      target = { lookObject: registry.actor, lookPosition: null };
    } else {
      const t = time_global();

      if (t >= this.keepStateUntil) {
        this.keepStateUntil = t + KEEP_STATE_MIN_TIME;

        if (distToAssistPt <= DIST_WALK) {
          nextState = EStalkerState.RAID;
          target = { lookObject: registry.actor, lookPosition: null };
        } else if (distToAssistPt <= DIST_RUN) {
          nextState = EStalkerState.RUSH;
        } else {
          nextState = EStalkerState.ASSAULT;
        }
      }
    }

    if (nextState !== null && nextState !== this.lastState) {
      setStalkerState(this.object, nextState, null, null, target, { animation: true });
      this.lastState = nextState;
    }

    // -- 4. ���� ����� �� ����� - ���� ������� � ������ �����
    // --    GlobalSound:set_sound(this.object, sound_wait)
  }

  /**
   * todo: Description.
   */
  public behWaitSimple(): void {
    const nextState: EStalkerState = EStalkerState.THREAT;

    if (nextState !== this.lastState) {
      setStalkerState(
        this.object,
        nextState,
        null,
        null,
        { lookObject: registry.actor, lookPosition: null },
        { animation: true }
      );
      this.lastState = nextState;
    }
  }

  /**
   * todo: Description.
   */
  public override execute(): void {
    super.execute();

    if (this.state.behavior === BEH_WALK_SIMPLE) {
      this.behWalkSimple();
    } else if (this.state.behavior === BEH_WAIT_SIMPLE) {
      this.behWaitSimple();
    }
  }

  /**
   * todo: Description.
   */
  public override finalize(): void {
    super.finalize();
  }
}

/**
 * todo;
 */
function selectPosition(object: ClientObject, state: ISchemeCompanionState) {
  let node1VertexId = null;
  let node1Distance = null;
  let node2VertexId = null;
  let node2Distance = null;
  const actor: ClientObject = registry.actor;

  let desiredDirection: Vector = vectorRotateY(actor.direction(), math.random(50, 60));

  node1VertexId = level.vertex_in_direction(actor.level_vertex_id(), desiredDirection, DESIRED_DISTANCE);

  if (object.accessible(node1VertexId) !== true || node1VertexId === actor.level_vertex_id()) {
    node1VertexId = null;
  }

  desiredDirection = vectorRotateY(actor.direction(), -math.random(50, 60));
  node2VertexId = level.vertex_in_direction(actor.level_vertex_id(), desiredDirection, DESIRED_DISTANCE);

  if (object.accessible(node2VertexId) !== true || node2VertexId === actor.level_vertex_id()) {
    node2VertexId = null;
  }

  if (node1VertexId !== null) {
    node1Distance = object.position().distance_to_sqr(level.vertex_position(node1VertexId));
  } else {
    node1Distance = -1;
  }

  if (node2VertexId !== null) {
    node2Distance = object.position().distance_to_sqr(level.vertex_position(node2VertexId));
  } else {
    node2Distance = -1;
  }

  if (node1Distance === -1 && node2Distance === -1) {
    return null;
  }

  if (node1Distance === -1) {
    return node2VertexId;
  }

  if (node2Distance === -1) {
    return node1VertexId;
  }

  if (node1Distance < node2Distance) {
    return node1VertexId;
  } else {
    return node2VertexId;
  }
}
