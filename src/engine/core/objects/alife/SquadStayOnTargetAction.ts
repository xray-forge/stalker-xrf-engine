import { game, XR_CTime } from "xray16";

import { Squad } from "@/engine/core/objects";
import { Optional, TDuration, TNumberId } from "@/engine/lib/types";

/**
 * todo;
 */
export class SquadStayOnTargetAction {
  public static readonly STAY_POINT_IDLE_MIN = 180 * 60;
  public static readonly STAY_POINT_IDLE_MAX = 300 * 60;

  public readonly name: string = "stay_point";

  public squadId: TNumberId;

  /**
   * todo;
   */
  public constructor(squad: Squad) {
    this.squadId = squad.id;
  }

  public actionStartTime: Optional<XR_CTime> = null;
  public actionIdleTime: TDuration = math.random(
    SquadStayOnTargetAction.STAY_POINT_IDLE_MIN,
    SquadStayOnTargetAction.STAY_POINT_IDLE_MAX
  );

  /**
   * todo;
   */
  public finalize(): void {}

  /**
   * todo;
   */
  public update(isUnderSimulation: boolean): boolean {
    if (!isUnderSimulation) {
      return true;
    } else {
      return game.get_game_time().diffSec(this.actionStartTime!) > this.actionIdleTime;
    }
  }

  /**
   * todo;
   */
  public make(isUnderSimulation: boolean): void {
    this.actionStartTime = game.get_game_time();
  }
}
