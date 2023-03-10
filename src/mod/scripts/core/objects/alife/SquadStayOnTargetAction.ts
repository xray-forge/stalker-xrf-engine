import { game, XR_CTime } from "xray16";

import { Optional } from "@/mod/lib/types";
import type { Squad } from "@/mod/scripts/core/objects/alife/Squad";

const STAY_POINT_IDLE_MIN = 180 * 60;
const STAY_POINT_IDLE_MAX = 300 * 60;

/**
 * todo;
 */
export class SquadStayOnTargetAction {
  public readonly name: string = "stay_point";
  public start_time: Optional<XR_CTime>;
  public idle_time: number;

  public constructor(squad: Squad) {
    this.name = "";
    this.start_time = null;
    this.idle_time = math.random(STAY_POINT_IDLE_MIN, STAY_POINT_IDLE_MAX);
  }

  public finalize(): void {}

  public update(isUnderSimulation: boolean): boolean {
    if (!isUnderSimulation) {
      return true;
    } else {
      return game.get_game_time().diffSec(this.start_time!) > this.idle_time;
    }
  }

  public make(isUnderSimulation: boolean) {
    this.start_time = game.get_game_time();
  }
}
