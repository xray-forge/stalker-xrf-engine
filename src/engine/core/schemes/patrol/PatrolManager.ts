import { level } from "xray16";

import { EStalkerState } from "@/engine/core/objects/animation/types";
import { abort } from "@/engine/core/utils/assertion";
import { createEmptyVector, createVector, vectorCross, vectorRotateY, yawDegree } from "@/engine/core/utils/vector";
import { ClientObject, Optional, TCount, TDistance, TName, TNumberId, TRate, Vector } from "@/engine/lib/types";

const formations = {
  line: [
    { dir: createVector(-1, 0, 0), dist: 2 },
    { dir: createVector(-1, 0, 0), dist: 4 },
    { dir: createVector(-1, 0, 0), dist: 6 },
    { dir: createVector(1, 0, 0), dist: 2 },
    { dir: createVector(1, 0, 0), dist: 4 },
    { dir: createVector(1, 0, 0), dist: 6 },
  ],
  back: [
    { dir: createVector(0.3, 0, -1), dist: 1.2 },
    { dir: createVector(-0.3, 0, -1), dist: 2.4 },
    { dir: createVector(0.3, 0, -1), dist: 3.6 },
    { dir: createVector(-0.3, 0, -1), dist: 4.8 },
    { dir: createVector(0.3, 0, -1), dist: 6 },
    { dir: createVector(-0.3, 0, -1), dist: 7.2 },
  ],
  around: [
    { dir: createVector(0.44721359, 0, -0.89442718), dist: 2.236068 },
    { dir: createVector(-0.44721359, 0, -0.89442718), dist: 2.236068 },
    { dir: createVector(1.0, 0, 0), dist: 2 },
    { dir: createVector(-1, 0, 0), dist: 2 },
    { dir: createVector(0.44721359, 0, 0.89442718), dist: 2.236068 },
    { dir: createVector(-0.44721359, 0, 0.89442718), dist: 2.236068 },
  ],
};

const ACCEL_BY_CURTYPE = {
  walk: EStalkerState.RUN,
  patrol: EStalkerState.RUSH,
  raid: EStalkerState.ASSAULT,
  sneak: EStalkerState.SNEAK_RUN,
  sneak_run: EStalkerState.ASSAULT,
};

/**
 * todo;
 */
export class PatrolManager {
  public pathName: TName;
  public npcList: LuaTable = new LuaTable();
  public currentState: EStalkerState = EStalkerState.PATROL;
  public commanderId: TNumberId = -1;
  public formation: string = "back";
  public commanderLid: TNumberId = -1;
  public commanderDir: Vector = createVector(0, 0, 1);
  public npcCount: TCount = 0;

  public constructor(pathName: TName) {
    this.pathName = pathName;
  }

  public addNpc(object: ClientObject, leader: Optional<boolean>): void {
    if (object === null || object.alive() === false || this.npcList.get(object.id()) !== null) {
      return;
    }

    if (this.npcCount === 7) {
      abort("[XR_PATROL] attempt to add more { 7 npc. [%s]", object.name());
    }

    this.npcList.set(object.id(), { soldier: object, dir: createVector(1, 0, 0), dist: 0 });

    this.npcCount = this.npcCount + 1;

    if (this.npcCount === 1 || leader === true) {
      this.commanderId = object.id();
    }

    this.resetPositions();
  }

  public removeNpc(npc: Optional<ClientObject>): void {
    if (npc === null) {
      return;
    }

    if (this.npcList.get(npc.id()) === null) {
      return;
    }

    this.npcList.delete(npc.id());
    this.npcCount = this.npcCount - 1;

    if (npc.id() === this.commanderId) {
      this.commanderId = -1;
      this.resetPositions();
    }
  }

  public resetPositions(): void {
    const form_ = formations[this.formation as keyof typeof formations];
    let index = 1;

    for (const [key, data] of this.npcList) {
      if (this.commanderId === -1 && index === 1) {
        this.commanderId = data.soldier.id();
      }

      if (this.commanderId !== this.npcList.get(key).soldier.id()) {
        this.npcList.get(key).dir = form_[index].dir;
        this.npcList.get(key).dist = form_[index].dist;
        this.npcList.get(key).vertex_id = -1;
        this.npcList.get(key).accepted = true;

        index = index + 1;
      }
    }
  }

  public setFormation(formation: string): void {
    if (formation === null) {
      abort("Invalid formation (null) for PatrolManager[%s]", this.pathName);
    }

    if (formation !== "around" && formation !== "back" && formation !== "line") {
      abort("Invalid formation (%s) for PatrolManager[%s]", formation, this.pathName);
    }

    this.formation = formation;
    this.resetPositions();
  }

  public getCommander(npc: ClientObject): void {
    if (npc === null) {
      abort("Invalid NPC on call PatrolManager:get_npc_command in PatrolManager[%s]", this.pathName);
    }

    if (this.npcList.get(npc.id()) === null) {
      abort("NPC with name %s can't present in PatrolManager[%s]", npc.name(), this.pathName);
    }

    if (npc.id() === this.commanderId) {
      abort("Patrol commander called function PatrolManager:get_npc_command in PatrolManager[%s]", this.pathName);
    }

    const commander = this.npcList.get(this.commanderId).soldier;

    if (commander === null) {
      abort("Patrol commander not present in PatrolManager[%s]", this.pathName);
    }

    return commander;
  }

  public getNpcCommand(npc: ClientObject): LuaMultiReturn<[number, Vector, EStalkerState]> {
    if (npc === null) {
      abort("Invalid NPC on call PatrolManager:get_npc_command in PatrolManager[%s]", this.pathName);
    }

    // --'���������� �������� ������
    const npcId: TNumberId = npc.id();

    // --'�������� ������ �� ���������� � ������
    if (this.npcList.get(npc.id()) === null) {
      abort("NPC with name %s can't present in PatrolManager[%s]", npc.name(), this.pathName);
    }

    // --'��������, ����� �������� �� ������� �������� ������ ��������
    if (npc.id() === this.commanderId) {
      abort("Patrol commander called function PatrolManager:get_npc_command in PatrolManager[%s]", this.pathName);
    }

    const commander = this.npcList.get(this.commanderId).soldier;
    const dir: Vector = commander.direction();
    const pos: Vector = createEmptyVector();
    let vertexId: TNumberId = commander.location_on_path(5, pos);

    if (level.vertex_position(vertexId).distance_to(this.npcList.get(npcId).soldier.position()) > 5) {
      vertexId = commander.level_vertex_id();
    }

    dir.y = 0;
    dir.normalize();

    let dirS: Vector = this.npcList.get(npcId).dir;
    const distS: TDistance = this.npcList.get(npcId).dist;

    let angle: TRate = yawDegree(dirS, createVector(0, 0, 1));
    const vvv: Vector = vectorCross(dirS, createVector(0, 0, 1));

    if (vvv.y < 0) {
      angle = -angle;
    }

    dirS = vectorRotateY(dir, angle);

    const d: number = 2;
    const vertex: TNumberId = level.vertex_in_direction(level.vertex_in_direction(vertexId, dirS, distS), dir, d);

    this.npcList.get(npcId).vertex_id = vertex;

    const distance: TDistance = commander.position().distance_to(this.npcList.get(npcId).soldier.position());

    if (distance > distS + 2) {
      const newState: EStalkerState = ACCEL_BY_CURTYPE[this.currentState as keyof typeof ACCEL_BY_CURTYPE];

      if (newState !== null) {
        return $multi(vertex, dir, newState);
      }
    }

    return $multi(vertex, dir, this.currentState);
  }

  public setCommand(object: ClientObject, command: EStalkerState, formation: string): void {
    if (object === null || object.alive() === false) {
      this.removeNpc(object);

      return;
    }

    if (object.id() !== this.commanderId) {
      return; // --abort ("NPC %s is not commander in PatrolManager[%s]", npc:name (), this.path_name)
    }

    this.currentState = command;
    if (this.formation !== formation) {
      this.formation = formation;
      this.setFormation(formation);
    }

    this.commanderLid = object.level_vertex_id();
    this.commanderDir = object.direction();
    this.update();
  }

  public isCommander(objectId: TNumberId): boolean {
    return objectId === this.commanderId;
  }

  public update(): void {
    /*
    if (tm_enabled === true) {
      this.tm.update();
    }
    */
  }
}
