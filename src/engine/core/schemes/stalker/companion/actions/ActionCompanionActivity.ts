import { action_base, level, LuabindClass, time_global } from "xray16";
import { EGameObjectPath, GameObject, Vector } from "xray16/alias";
import { ACTOR_ID, Nillable, TNumberId, vectorRotateY } from "xray16/lib";

import { EStalkerState, ILookTargetDescriptor } from "@/engine/core/animation/types";
import { registry, setStalkerState } from "@/engine/core/database";
import { ISchemeCompanionState } from "@/engine/core/schemes/stalker/companion";

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
 * Action implementing companion activity, making the object follow and assist the actor.
 */
@LuabindClass()
export class ActionCompanionActivity extends action_base {
  public state: ISchemeCompanionState;

  public assistPoint: Nillable<number> = null;
  public keepStateUntil: number = 0;
  public lastState: EStalkerState = EStalkerState.GUARD_NA;

  public constructor(storage: ISchemeCompanionState) {
    super(null, ActionCompanionActivity.__name);
    this.state = storage;
  }

  /**
   * Initialize the action when the planner selects it.
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
   * Move the object toward an assist point near the actor and pick a walking, running or assault state by distance.
   */
  public behWalkSimple(): void {
    const actor: Nillable<GameObject> = registry.actor;
    let selectNewPt: boolean = false;
    const distFromSelfToActor: number = this.object.position().distance_to(actor.position());
    const distFromAssistPtToActor: Nillable<number> = this.assistPoint
      ? level.vertex_position(this.assistPoint).distance_to(actor.position())
      : null;

    if (
      distFromSelfToActor >= DESIRED_DISTANCE &&
      (!distFromAssistPtToActor || distFromAssistPtToActor >= DESIRED_DISTANCE * 2)
    ) {
      selectNewPt = true;
    }

    if (selectNewPt) {
      this.assistPoint = selectPosition(this.object);
      if (!this.assistPoint) {
        return;
      }
    } else if (!this.assistPoint) {
      return;
    }

    this.object.set_path_type(EGameObjectPath.LEVEL_PATH);
    this.object.set_dest_level_vertex_id(this.assistPoint);

    const distToAssistPt = level.vertex_position(this.assistPoint).distance_to(this.object.position());
    let nextState: Nillable<EStalkerState> = null;
    let target: Nillable<ILookTargetDescriptor> = null;

    if (this.object.level_vertex_id() === this.assistPoint) {
      nextState = EStalkerState.THREAT;
      target = { lookObjectId: ACTOR_ID, lookPosition: null };
    } else {
      const t = time_global();

      if (t >= this.keepStateUntil) {
        this.keepStateUntil = t + KEEP_STATE_MIN_TIME;

        if (distToAssistPt <= DIST_WALK) {
          nextState = EStalkerState.RAID;
          target = { lookObjectId: ACTOR_ID, lookPosition: null };
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
   * Keep the object standing and looking at the actor in a threat state while waiting.
   */
  public behWaitSimple(): void {
    const nextState: EStalkerState = EStalkerState.THREAT;

    if (nextState !== this.lastState) {
      setStalkerState(
        this.object,
        nextState,
        null,
        null,
        { lookObjectId: ACTOR_ID, lookPosition: null },
        { animation: true }
      );
      this.lastState = nextState;
    }
  }

  /**
   * Execute the action logic on planner update.
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
   * Finalize the action when the planner switches away.
   */
  public override finalize(): void {
    super.finalize();
  }
}

/**
 * Select an accessible level vertex to the side of the actor for the object to move to.
 *
 * @param object - The game object to find an accessible assist position for.
 * @returns The closest accessible level vertex id, or null when none is reachable.
 */
function selectPosition(object: GameObject): Nillable<TNumberId> {
  const actor: GameObject = registry.actor;

  let desiredDirection: Vector = vectorRotateY(actor.direction(), math.random(50, 60));

  let node1VertexId: Nillable<TNumberId> = level.vertex_in_direction(
    actor.level_vertex_id(),
    desiredDirection,
    DESIRED_DISTANCE
  );

  if (!object.accessible(node1VertexId) || node1VertexId === actor.level_vertex_id()) {
    node1VertexId = null;
  }

  desiredDirection = vectorRotateY(actor.direction(), -math.random(50, 60));

  let node2VertexId: Nillable<TNumberId> = level.vertex_in_direction(
    actor.level_vertex_id(),
    desiredDirection,
    DESIRED_DISTANCE
  );

  if (!object.accessible(node2VertexId) || node2VertexId === actor.level_vertex_id()) {
    node2VertexId = null;
  }

  let node1Distance: Nillable<TNumberId>;

  if (node1VertexId !== null) {
    node1Distance = object.position().distance_to_sqr(level.vertex_position(node1VertexId));
  } else {
    node1Distance = -1;
  }

  let node2Distance: Nillable<TNumberId>;

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
