import { MonsterHitInfo } from "xray16";
import { GameObject, Vector } from "xray16/alias";

import { Nillable, TTimestamp } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray/mocks/objects/game/game_object.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

export class MockMonsterHitInfo {
  public static mock(
    direction: Nillable<Vector> = MockVector.mock(1, 1, 1),
    time: TTimestamp = 1,
    who: Nillable<GameObject> = MockGameObject.mock()
  ): MonsterHitInfo {
    return new MockMonsterHitInfo(direction, time, who) as unknown as MonsterHitInfo;
  }

  public direction: Nillable<Vector> = MockVector.mock(1, 1, 1);
  public time: TTimestamp = 1;
  public who: Nillable<GameObject> = MockGameObject.mock();

  public constructor(
    direction: Nillable<Vector> = MockVector.mock(1, 1, 1),
    time: TTimestamp = 1,
    who: Nillable<GameObject> = MockGameObject.mock()
  ) {
    this.direction = direction;
    this.time = time;
    this.who = who;
  }
}
