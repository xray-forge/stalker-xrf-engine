import { game } from "xray16";

import { Squad } from "@/engine/core/objects/squad/Squad";
import { ESquadActionType, ISquadAction } from "@/engine/core/objects/squad/squad_types";
import { squadConfig } from "@/engine/core/objects/squad/SquadConfig";
import { Optional, TDuration, Time } from "@/engine/lib/types";

/**
 * Implement alife action to stay on target.
 */
export class SquadStayOnTargetAction implements ISquadAction {
  public readonly type: ESquadActionType = ESquadActionType.STAY_ON_TARGET;
  // Squad performing stay target action.
  public readonly squad: Squad;

  public constructor(squad: Squad) {
    this.squad = squad;
  }

  public actionStartTime: Optional<Time> = null;
  public actionIdleTime: TDuration = math.random(squadConfig.STAY_POINT_IDLE_MIN, squadConfig.STAY_POINT_IDLE_MAX);

  /**
   * Stay on target, initialize action.
   */
  public initialize(isUnderSimulation: boolean): void {
    this.actionStartTime = game.get_game_time();
  }

  /**
   * Generic cleanup method.
   */
  public finalize(): void {}

  /**
   * Generic update tick.
   * Check whether idle time passed for offline mode.
   * Do not stay on target for online mode.
   */
  public update(): boolean {
    return game.get_game_time().diffSec(this.actionStartTime as Time) > this.actionIdleTime;
  }

  /**
   * @returns remaining duration to stay on target
   */
  public getStayIdleDuration(): TDuration {
    return this.actionStartTime ? this.actionIdleTime - game.get_game_time().diffSec(this.actionStartTime) : 0;
  }
}
