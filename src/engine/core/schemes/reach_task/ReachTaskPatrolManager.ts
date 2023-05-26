import { alife, cse_alife_creature_abstract, game_object, level, vector } from "xray16";

import { Squad } from "@/engine/core/objects";
import { EStalkerState } from "@/engine/core/objects/state";
import { abort, assertDefined } from "@/engine/core/utils/assertion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSquad } from "@/engine/core/utils/object";
import { vectorCross, vectorRotateY, yawDegree } from "@/engine/core/utils/vector";
import { Optional, TCount, TDistance, TName, TNumberId } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
const formations = {
  back: [
    { dir: new vector().set(0.3, 0, -1), dist: 1.2 },
    { dir: new vector().set(-0.3, 0, -1), dist: 1.2 },
    { dir: new vector().set(0.3, 0, -1), dist: 2.4 },
    { dir: new vector().set(-0.3, 0, -1), dist: 2.4 },
    { dir: new vector().set(0.3, 0, -1), dist: 3.6 },
    { dir: new vector().set(-0.3, 0, -1), dist: 3.6 },
    { dir: new vector().set(0.3, 0, -1), dist: 4.8 },
    { dir: new vector().set(-0.3, 0, -1), dist: 4.8 },
    { dir: new vector().set(0.3, 0, -1), dist: 6 },
    { dir: new vector().set(-0.3, 0, -1), dist: 6 },
    { dir: new vector().set(0.3, 0, -1), dist: 7.2 },
    { dir: new vector().set(-0.3, 0, -1), dist: 7.2 },
    { dir: new vector().set(0.3, 0, -1), dist: 8.4 },
    { dir: new vector().set(-0.3, 0, -1), dist: 8.4 },
  ],
};

/**
 * todo;
 */
const accelerationByCurrentType: LuaTable<EStalkerState, EStalkerState> = $fromObject<EStalkerState, EStalkerState>({
  [EStalkerState.WALK]: EStalkerState.RUN,
  [EStalkerState.PATROL]: EStalkerState.RUSH,
  [EStalkerState.RAID]: EStalkerState.ASSAULT,
  [EStalkerState.SNEAK]: EStalkerState.SNEAK_RUN,
  [EStalkerState.SNEAK_RUN]: EStalkerState.ASSAULT,
} as Record<EStalkerState, EStalkerState>);

/**
 * todo;
 */
export class ReachTaskPatrolManager {
  public objectsList: LuaTable<
    TNumberId,
    { soldier: number; dir: vector; dist: TDistance; vertex_id?: TNumberId; accepted?: boolean }
  > = new LuaTable();

  public targetId: TNumberId;
  public current_state: EStalkerState = EStalkerState.PATROL;
  public commanderId: TNumberId = -1;
  public formation: string = "back";
  public commander_lid: number = -1;
  public commander_dir: vector = new vector().set(0, 0, 1);
  public objectsCount: TCount = 0;

  public constructor(targetId: TNumberId) {
    this.targetId = targetId;
  }

  /**
   * todo: Description.
   */
  public addObjectToPatrol(object: game_object): void {
    if (!object.alive() || this.objectsList.has(object.id())) {
      return;
    }

    logger.info("Add object to patrol:", object.name(), this.targetId);

    this.objectsList.set(object.id(), {
      soldier: object.id(),
      dir: new vector().set(1, 0, 0),
      dist: 0,
    });
    this.objectsCount = this.objectsCount + 1;

    if (object.id() === getObjectSquad(object)!.commander_id()) {
      this.commanderId = object.id();
    }

    this.resetPositions();
  }

  /**
   * todo: Description.
   */
  public removeObjectFromPatrol(object: game_object): void {
    logger.info("Remove object from patrol:", object.name(), this.targetId);

    if (this.objectsList.get(object.id()) === null) {
      return;
    }

    this.objectsList.delete(object.id());
    this.objectsCount = this.objectsCount - 1;

    if (object.id() === this.commanderId) {
      this.commanderId = -1;
      this.resetPositions();
    }
  }

  /**
   * todo: Description.
   */
  public resetPositions(): void {
    logger.info("Reset formation positions:", this.targetId, this.commanderId, this.objectsCount);

    const form_ = formations[this.formation as "back"];
    let index = 1;

    for (const [key, data] of this.objectsList) {
      const serverObject: Optional<cse_alife_creature_abstract> = alife().object(data.soldier)!;
      const squad: Optional<Squad> = serverObject && getObjectSquad(serverObject);

      if (squad === null) {
        return;
      }

      if (this.commanderId === -1) {
        this.commanderId = squad.commander_id();
      }

      if (this.commanderId !== this.objectsList.get(key).soldier) {
        const it = this.objectsList.get(key);

        it.dir = form_[index].dir;
        it.dist = form_[index].dist;
        it.vertex_id = -1;
        it.accepted = true;
        index = index + 1;
      }
    }
  }

  /**
   * todo: Description.
   */
  public set_formation(formation: TName): void {
    if (formation === null) {
      abort("Invalid formation (nil) for PatrolManager[%s]", this.targetId);
    }

    if (formation !== "around" && formation !== "back" && formation !== "line") {
      abort("Invalid formation (%s) for PatrolManager[%s]", formation, this.targetId);
    }

    this.formation = formation;
    this.resetPositions();
  }

  /**
   * todo: Description.
   */
  public getCommander(object: game_object): game_object {
    if (object === null) {
      abort("Invalid NPC on call PatrolManager:get_npc_command in PatrolManager[%s]", this.targetId);
    }

    if (this.objectsList.get(object.id()) === null) {
      abort("NPC with name %s can't present in PatrolManager[%s]", object.name(), this.targetId);
    }

    if (object.id() === this.commanderId) {
      abort("Patrol commander called function PatrolManager:get_npc_command in PatrolManager[%s]", this.targetId);
    }

    const commander: Optional<number> = this.objectsList.get(this.commanderId).soldier;

    if (commander === null) {
      abort("Patrol commander not present in PatrolManager[%s]", this.targetId);
    }

    return level.object_by_id(commander)!;
  }

  /**
   * todo: Description.
   */
  public getObjectOrders(object: game_object): LuaMultiReturn<[TNumberId, vector, Optional<EStalkerState>]> {
    if (object === null) {
      abort("Invalid NPC on call PatrolManager:get_npc_command in PatrolManager[%s]", this.targetId);
    }

    const objectId: TNumberId = object.id();

    if (this.objectsList.get(this.commanderId) === null) {
      return $multi(object.level_vertex_id(), object.direction(), this.current_state);
    } else if (this.objectsList.get(object.id()) === null) {
      abort("NPC with name %s can't present in PatrolManager[%s]", object.name(), this.targetId);
    } else if (object.id() === this.commanderId) {
      abort("Patrol commander called function PatrolManager:get_npc_command in PatrolManager[%s]", this.targetId);
    }

    const commander: Optional<game_object> = level.object_by_id(this.objectsList.get(this.commanderId).soldier);

    assertDefined(commander, "Commander is nil!");

    const direction: vector = commander.direction();
    const position: vector = new vector().set(0, 0, 0);
    let vertexId: TNumberId = commander.location_on_path(5, position);

    if (
      level
        .vertex_position(vertexId)
        .distance_to(level.object_by_id(this.objectsList.get(objectId).soldier)!.position()) > 5
    ) {
      vertexId = commander.level_vertex_id();
    }

    direction.y = 0;
    direction.normalize();

    let dir_s = this.objectsList.get(objectId).dir;
    const dist_s = this.objectsList.get(objectId).dist;
    const vvv = vectorCross(dir_s, new vector().set(0, 0, 1));
    let angle = yawDegree(dir_s, new vector().set(0, 0, 1));

    if (vvv.y < 0) {
      angle = -angle;
    }

    dir_s = vectorRotateY(direction, angle);

    const d = 2;
    const vertex = level.vertex_in_direction(level.vertex_in_direction(vertexId, dir_s, dist_s), direction, d);

    this.objectsList.get(objectId).vertex_id = vertex;

    const distance: TDistance = commander
      .position()
      .distance_to(level.object_by_id(this.objectsList.get(objectId).soldier)!.position());

    if (distance > dist_s + 2) {
      const nextState: EStalkerState = accelerationByCurrentType.get(this.current_state);

      if (nextState !== null) {
        return $multi(vertex, direction, nextState);
      }
    }

    return $multi(vertex, direction, this.current_state);
  }

  /**
   * todo: Description.
   */
  public setObjectOrders(object: game_object, command: EStalkerState, formation: TName): void {
    if (object === null || !object.alive()) {
      abort("NPC commander possible dead in PatrolManager[%s]", this.targetId);
    }

    if (object.id() !== this.commanderId) {
      return; // --abort ("NPC %s is not commander in PatrolManager[%s]", npc.name (), this.target_name)
    }

    this.current_state = command;

    if (this.formation !== formation) {
      this.formation = formation;
      this.set_formation(formation);
    }

    this.commander_lid = object.level_vertex_id();
    this.commander_dir = object.direction();
  }

  /**
   * todo: Description.
   */
  public isCommander(objectId: TNumberId): boolean {
    return objectId === this.commanderId;
  }
}
