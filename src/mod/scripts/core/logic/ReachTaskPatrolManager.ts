import { alife, level, vector, XR_cse_alife_creature_abstract, XR_game_object, XR_vector } from "xray16";

import { Optional } from "@/mod/lib/types";
import { reactTaskPatrols } from "@/mod/scripts/core/db";
import { getObjectSquad } from "@/mod/scripts/utils/alife";
import { isObjectMeeting } from "@/mod/scripts/utils/checkers";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { vectorCross, vectorRotateY, yawDegree } from "@/mod/scripts/utils/physics";

const logger: LuaLogger = new LuaLogger("ReachTaskPatrolManager");

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

const accel_by_curtype = {
  walk: "run",
  patrol: "rush",
  raid: "assault",
  sneak: "sneak_run",
  sneak_run: "assault",
};

export class ReachTaskPatrolManager {
  public static add_to_reach_patrol(object: XR_game_object, targetId: number): void {
    logger.info("Add to patrol:", object.name());

    const squadId: number = getObjectSquad(object)!.id;
    const patrolId: string = targetId + "_to_" + squadId;

    if (reactTaskPatrols.get(patrolId) === null) {
      reactTaskPatrols.set(patrolId, new ReachTaskPatrolManager(targetId));
    }

    reactTaskPatrols.get(patrolId).add_npc(object);
  }

  public npc_list: LuaTable<
    number,
    { soldier: number; dir: XR_vector; dist: number; vertex_id?: number; accepted?: boolean }
  > = new LuaTable();

  public readonly target_name: number;
  public current_state: string = "patrol";
  public commander_id: number = -1;
  public formation: string = "back";
  public commander_lid: number = -1;
  public commander_dir: XR_vector = new vector().set(0, 0, 1);
  public npc_count: number = 0;

  public constructor(target_id: number) {
    this.target_name = target_id;
  }

  public add_npc(npc: XR_game_object): void {
    if (npc === null || !npc.alive() || this.npc_list.has(npc.id())) {
      return;
    }

    this.npc_list.set(npc.id(), {
      soldier: npc.id(),
      dir: new vector().set(1, 0, 0),
      dist: 0,
    });
    this.npc_count = this.npc_count + 1;

    if (npc.id() === getObjectSquad(npc)!.commander_id()) {
      this.commander_id = npc.id();
    }

    this.reset_positions();
  }

  public remove_npc(npc: XR_game_object): void {
    if (npc === null) {
      return;
    }

    if (this.npc_list.get(npc.id()) === null) {
      return;
    }

    this.npc_list.delete(npc.id());
    this.npc_count = this.npc_count - 1;

    if (npc.id() === this.commander_id) {
      this.commander_id = -1;
      this.reset_positions();
    }
  }

  public reset_positions(): void {
    const form_ = formations[this.formation as "back"];
    let index = 1;

    for (const [key, data] of this.npc_list) {
      const se_npc = alife().object<XR_cse_alife_creature_abstract>(data.soldier)!;
      const squad = se_npc && getObjectSquad(se_npc);

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

  public set_formation(formation: string): void {
    if (formation === null) {
      abort("Invalid formation (nil) for PatrolManager[%s]", this.target_name);
    }

    if (formation !== "around" && formation !== "back" && formation !== "line") {
      abort("Invalid formation (%s) for PatrolManager[%s]", formation, this.target_name);
    }

    this.formation = formation;
    this.reset_positions();
  }

  public get_commander(npc: XR_game_object): XR_game_object {
    if (npc === null) {
      abort("Invalid NPC on call PatrolManager:get_npc_command in PatrolManager[%s]", this.target_name);
    }

    if (this.npc_list.get(npc.id()) === null) {
      abort("NPC with name %s can't present in PatrolManager[%s]", npc.name(), this.target_name);
    }

    if (npc.id() === this.commander_id) {
      abort("Patrol commander called function PatrolManager:get_npc_command in PatrolManager[%s]", this.target_name);
    }

    const commander: Optional<number> = this.npc_list.get(this.commander_id).soldier;

    if (commander === null) {
      abort("Patrol commander not present in PatrolManager[%s]", this.target_name);
    }

    return level.object_by_id(commander)!;
  }

  public get_npc_command(npc: XR_game_object): LuaMultiReturn<[number, XR_vector, Optional<string>]> {
    if (npc === null) {
      abort("Invalid NPC on call PatrolManager:get_npc_command in PatrolManager[%s]", this.target_name);
    }

    const npc_id = npc.id();

    if (this.npc_list.get(this.commander_id) === null) {
      return $multi(npc.level_vertex_id(), npc.direction(), this.current_state);
    } else if (this.npc_list.get(npc.id()) === null) {
      abort("NPC with name %s can't present in PatrolManager[%s]", npc.name(), this.target_name);
    } else if (npc.id() === this.commander_id) {
      abort("Patrol commander called function PatrolManager:get_npc_command in PatrolManager[%s]", this.target_name);
    }

    const commander = level.object_by_id(this.npc_list.get(this.commander_id).soldier);

    if (commander === null) {
      abort("Commander is nil!!!");
    }

    const dir: XR_vector = commander.direction();
    const pos: XR_vector = new vector().set(0, 0, 0);
    let vertex_id: number = commander.location_on_path(5, pos);

    if (
      level.vertex_position(vertex_id).distance_to(level.object_by_id(this.npc_list.get(npc_id).soldier)!.position()) >
      5
    ) {
      vertex_id = commander.level_vertex_id();
    }

    dir.y = 0;
    dir.normalize();

    let dir_s = this.npc_list.get(npc_id).dir;
    const dist_s = this.npc_list.get(npc_id).dist;
    const vvv = vectorCross(dir_s, new vector().set(0, 0, 1));
    let angle = yawDegree(dir_s, new vector().set(0, 0, 1));

    if (vvv.y < 0) {
      angle = -angle;
    }

    dir_s = vectorRotateY(dir, angle);

    const d = 2;
    const vertex = level.vertex_in_direction(level.vertex_in_direction(vertex_id, dir_s, dist_s), dir, d);

    this.npc_list.get(npc_id).vertex_id = vertex;

    const distance: number = commander
      .position()
      .distance_to(level.object_by_id(this.npc_list.get(npc_id).soldier)!.position());

    if (distance > dist_s + 2) {
      const new_state = accel_by_curtype[this.current_state as keyof typeof accel_by_curtype];

      if (new_state !== null) {
        return $multi(vertex, dir, new_state);
      }
    }

    return $multi(vertex, dir, this.current_state);
  }

  public set_command(npc: XR_game_object, command: string, formation: string): void {
    if (npc === null || !npc.alive()) {
      abort("NPC commander possible dead in PatrolManager[%s]", this.target_name);
    }

    if (npc.id() !== this.commander_id) {
      return; // --abort ("NPC %s is not commander in PatrolManager[%s]", npc.name (), this.target_name)
    }

    this.current_state = command;

    if (this.formation !== formation) {
      this.formation = formation;
      this.set_formation(formation);
    }

    this.commander_lid = npc.level_vertex_id();
    this.commander_dir = npc.direction();
    this.update();
  }

  public is_commander(npc_id: number): boolean {
    return npc_id === this.commander_id;
  }

  public is_commander_in_meet(): boolean {
    if (this.commander_id === -1) {
      return false;
    }

    const npc = level.object_by_id(this.npc_list.get(this.commander_id).soldier);

    if (npc !== null && npc.alive() === true) {
      return isObjectMeeting(npc);
    }

    return false;
  }

  public update(): void {}
}
