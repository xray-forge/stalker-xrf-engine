import { Flags32, TIndex, TNumberId, Vector } from "@/engine/lib/types";
import { MockFlags32 } from "@/fixtures/xray/mocks/objects/Flags32.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

/**
 * Mock generic patrol object.
 */
export class MockPatrol {
  public flags(): Flags32 {
    return MockFlags32.mock();
  }

  public game_vertex_id(value: TNumberId): TNumberId {
    return 132;
  }

  public get_nearest(vector: Vector): TNumberId {
    return 121;
  }

  public index(value: string): TIndex {
    return 12;
  }

  public level_vertex_id(value: TIndex): TNumberId {
    return 11;
  }

  public name(point_index: TIndex): string {
    return "";
  }

  public point(index: TIndex): Vector {
    return MockVector.mock(1, 1, 1);
  }

  public terminal(point_index: TIndex): boolean {
    return false;
  }
}
