import { Flags32, Patrol, TCount, TIndex, TName, TNumberId, Vector } from "@/engine/lib/types";
import { MockFlags32 } from "@/fixtures/xray/mocks/objects/Flags32.mock";
import { IPatrolMock, patrols } from "@/fixtures/xray/mocks/objects/path/patrols";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * Mock generic patrol object.
 */
export class MockPatrol {
  public static mock(name: string): Patrol {
    return new MockPatrol(name) as unknown as Patrol;
  }

  public patrolMock: IPatrolMock;

  public constructor(name: string) {
    if (patrols[name]) {
      this.patrolMock = patrols[name];
    } else {
      throw new Error("Not expected patrol provided, expect something defined in list of patrols mocks.");
    }
  }

  public flags(): Flags32 {
    return MockFlags32.mock();
  }

  public game_vertex_id(index: TIndex): TNumberId {
    return this.patrolMock.points[index].gvid;
  }

  public get_nearest(vector: Vector): TNumberId {
    return 121;
  }

  public index(name: string): TIndex {
    return this.patrolMock.points.findIndex((it) => it.name === name);
  }

  public level_vertex_id(index: TIndex): TNumberId {
    return this.patrolMock.points[index].lvid;
  }

  public name(index: TIndex): TName {
    return this.patrolMock.points[index].name;
  }

  public point(index: TIndex): Vector {
    return MockVector.mock(1, 1, 1);
  }

  public count(): TCount {
    return this.patrolMock.points.length;
  }

  public terminal(index: TIndex): boolean {
    return index === this.patrolMock.points.length - 1;
  }
}
