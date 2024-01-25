import { MonsterHitInfo } from "xray16";

import { GameObject, Optional, TTimestamp, Vector } from "@/engine/lib/types";
import { MockGameObject } from "@/fixtures/xray/mocks/objects/game/game_object.mock";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

export class MockMonsterHitInfo {
  public static mock(
    direction: Optional<Vector> = MockVector.mock(1, 1, 1),
    time: TTimestamp = 1,
    who: Optional<GameObject> = MockGameObject.mock()
  ): MonsterHitInfo {
    return new MockMonsterHitInfo(direction, time, who) as unknown as MonsterHitInfo;
  }

  public direction: Optional<Vector> = MockVector.mock(1, 1, 1);
  public time: TTimestamp = 1;
  public who: Optional<GameObject> = MockGameObject.mock();

  public constructor(
    direction: Optional<Vector> = MockVector.mock(1, 1, 1),
    time: TTimestamp = 1,
    who: Optional<GameObject> = MockGameObject.mock()
  ) {
    this.direction = direction;
    this.time = time;
    this.who = who;
  }
}
