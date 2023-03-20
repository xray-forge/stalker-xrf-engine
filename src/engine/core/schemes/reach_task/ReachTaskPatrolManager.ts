import { alife, level, vector, XR_cse_alife_creature_abstract, XR_game_object, XR_vector } from "xray16";

import { Squad } from "@/engine/core/objects";
import { isObjectMeeting } from "@/engine/core/utils/check/check";
import { abort } from "@/engine/core/utils/debug";
import { LuaLogger } from "@/engine/core/utils/logging";
import { getObjectSquad } from "@/engine/core/utils/object";
import { vectorCross, vectorRotateY, yawDegree } from "@/engine/core/utils/physics";
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
const accel_by_curtype = {
  walk: "run",
  patrol: "rush",
  raid: "assault",
  sneak: "sneak_run",
  sneak_run: "assault",
};

/**
 * todo;
 */
export class ReachTaskPatrolManager {
  public npc_list: LuaTable<
    number,
    { soldier: number; dir: XR_vector; dist: number; vertex_id?: TNumberId; accepted?: boolean }
  > = new LuaTable();

  public readonly target_name: number;
  public current_state: string = "patrol";
  public commander_id: number = -1;
  public formation: string = "back";
  public commander_lid: number = -1;
  public commander_dir: XR_vector = new vector().set(0, 0, 1);
  public objectsCount: TCount = 0;

  /**
   * todo: Description.
   */
  public constructor(targetId: TNumberId) {
    this.target_name = targetId;
  }

  /**
   * todo: Description.
   */
  public addObjectToPatrol(object: XR_game_object): void {
    if (!object.alive() || this.npc_list.has(object.id())) {
      return;
    }

    logger.info("Add object to patrol:", object.name(), this.target_name);

    this.npc_list.set(object.id(), {
      soldier: object.id(),
      dir: new vector().set(1, 0, 0),
      dist: 0,
    });
    this.objectsCount = this.objectsCount + 1;

    if (object.id() === getObjectSquad(object)!.commander_id()) {
      this.commander_id = object.id();
    }

    this.reset_positions();
  }

  /**
   * todo: Description.
   */
  public removeObjectFromPatrol(object: XR_game_object): void {
    logger.info("Remove object from patrol:", object.name(), this.target_name);

    if (this.npc_list.get(object.id()) === null) {
      return;
    }

    this.npc_list.delete(object.id());
    this.objectsCount = this.objectsCount - 1;

    if (object.id() === this.commander_id) {
      this.commander_id = -1;
      this.reset_positions();
    }
  }

  /**
   * todo: Description.
   */
  public reset_positions(): void {
    logger.info("Reset formation positions:", this.target_name, this.commander_id, this.objectsCount);

    const form_ = formations[this.formation as "back"];
    let index = 1;

    for (const [key, data] of this.npc_list) {
      const serverObject: Optional<XR_cse_alife_creature_abstract> = alife().object(data.soldier)!;
      const squad: Optional<Squad> = serverObject && getObjectSquad(serverObject);

      if (squad === null) {
        return;
      }

      if (this.commander_id === -1) {
        this.commander_id = squad.commander_id();
      }

      if (this.commander_id !== this.npc_list.get(key).soldier) {
        const it = this.npc_list.get(key);

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
      abort("Invalid formation (nil) for PatrolManager[%s]", this.target_name);
    }

    if (formation !== "around" && formation !== "back" && formation !== "line") {
      abort("Invalid formation (%s) for PatrolManager[%s]", formation, this.target_name);
    }

    this.formation = formation;
    this.reset_positions();
  }

  /**
   * todo: Description.
   */
  public get_commander(object: XR_game_object): XR_game_object {
    if (object === null) {
      abort("Invalid NPC on call PatrolManager:get_npc_command in PatrolManager[%s]", this.target_name);
    }

    if (this.npc_list.get(object.id()) === null) {
      abort("NPC with name %s can't present in PatrolManager[%s]", object.name(), this.target_name);
    }

    if (object.id() === this.commander_id) {
      abort("Patrol commander called function PatrolManager:get_npc_command in PatrolManager[%s]", this.target_name);
    }

    const commander: Optional<number> = this.npc_list.get(this.commander_id).soldier;

    if (commander === null) {
      abort("Patrol commander not present in PatrolManager[%s]", this.target_name);
    }

    return level.object_by_id(commander)!;
  }

  /**
   * todo: Description.
   */
  public getObjectOrders(object: XR_game_object): LuaMultiReturn<[TNumberId, XR_vector, Optional<TName>]> {
    if (object === null) {
      abort("Invalid NPC on call PatrolManager:get_npc_command in PatrolManager[%s]", this.target_name);
    }

    const objectId: TNumberId = object.id();

    if (this.npc_list.get(this.commander_id) === null) {
      return $multi(object.level_vertex_id(), object.direction(), this.current_state);
    } else if (this.npc_list.get(object.id()) === null) {
      abort("NPC with name %s can't present in PatrolManager[%s]", object.name(), this.target_name);
    } else if (object.id() === this.commander_id) {
      abort("Patrol commander called function PatrolManager:get_npc_command in PatrolManager[%s]", this.target_name);
    }

    const commander = level.object_by_id(this.npc_list.get(this.commander_id).soldier);

    if (commander === null) {
      abort("Commander is nil!!!");
    }

    const dir: XR_vector = commander.direction();
    const pos: XR_vector = new vector().set(0, 0, 0);
    let vertexId: TNumberId = commander.location_on_path(5, pos);

    if (
      level.vertex_position(vertexId).distance_to(level.object_by_id(this.npc_list.get(objectId).soldier)!.position()) >
      5
    ) {
      vertexId = commander.level_vertex_id();
    }

    dir.y = 0;
    dir.normalize();

    let dir_s = this.npc_list.get(objectId).dir;
    const dist_s = this.npc_list.get(objectId).dist;
    const vvv = vectorCross(dir_s, new vector().set(0, 0, 1));
    let angle = yawDegree(dir_s, new vector().set(0, 0, 1));

    if (vvv.y < 0) {
      angle = -angle;
    }

    dir_s = vectorRotateY(dir, angle);

    const d = 2;
    const vertex = level.vertex_in_direction(level.vertex_in_direction(vertexId, dir_s, dist_s), dir, d);

    this.npc_list.get(objectId).vertex_id = vertex;

    const distance: TDistance = commander
      .position()
      .distance_to(level.object_by_id(this.npc_list.get(objectId).soldier)!.position());

    if (distance > dist_s + 2) {
      const new_state = accel_by_curtype[this.current_state as keyof typeof accel_by_curtype];

      if (new_state !== null) {
        return $multi(vertex, dir, new_state);
      }
    }

    return $multi(vertex, dir, this.current_state);
  }

  /**
   * todo: Description.
   */
  public setObjectOrders(object: XR_game_object, command: string, formation: TName): void {
    if (object === null || !object.alive()) {
      abort("NPC commander possible dead in PatrolManager[%s]", this.target_name);
    }

    if (object.id() !== this.commander_id) {
      return; // --abort ("NPC %s is not commander in PatrolManager[%s]", npc.name (), this.target_name)
    }

    logger.info("Set object orders:", object.name(), command, formation);

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
    return objectId === this.commander_id;
  }

  /**
   * todo: Description.
   */
  public is_commander_in_meet(): boolean {
    if (this.commander_id === -1) {
      return false;
    }

    const object: Optional<XR_game_object> = level.object_by_id(this.npc_list.get(this.commander_id).soldier);

    if (object?.alive()) {
      return isObjectMeeting(object);
    }

    return false;
  }
}
