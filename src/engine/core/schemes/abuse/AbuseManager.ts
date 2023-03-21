import { time_global, XR_game_object } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/schemes";
import { ISchemeAbuseState } from "@/engine/core/schemes/abuse/ISchemeAbuseState";
import { Optional, TCount, TRate, TTimestamp } from "@/engine/lib/types";

/**
 * todo;
 */
export class AbuseManager extends AbstractSchemeManager<ISchemeAbuseState> {
  public enable: boolean = true;
  public hit_done: boolean = false;
  public abuse_rate: TRate = 2;
  public abuse_value: TCount = 0;
  public abuse_threshold: TRate = 5;
  public last_update: Optional<TTimestamp> = null;

  /**
   * todo: Description.
   */
  public setAbuseRate(rate: TRate): void {
    this.abuse_rate = rate;
  }

  /**
   * todo: Description.
   */
  public isAbused(): boolean {
    return this.abuse_value >= this.abuse_threshold;
  }

  /**
   * todo: Description.
   */
  public override update(): boolean {
    if (this.last_update === null) {
      this.last_update = time_global();
    }

    if (this.abuse_value > 0) {
      this.abuse_value = this.abuse_value - (time_global() - this.last_update) * 0.00005;
    } else {
      this.abuse_value = 0;
    }

    if (this.abuse_value > this.abuse_threshold * 1.1) {
      this.abuse_value = this.abuse_threshold * 1.1;
    }

    if (this.hit_done && this.abuse_value < (this.abuse_threshold * 2) / 3) {
      this.hit_done = false;
    }

    this.last_update = time_global();

    return this.isAbused();
  }

  /**
   * todo: Description.
   */
  public addAbuse(value: TCount): void {
    if (this.enable) {
      this.abuse_value = this.abuse_value + value * this.abuse_rate;
    }
  }

  /**
   * todo: Description.
   */
  public clearAbuse(): void {
    this.abuse_value = 0;
  }

  /**
   * todo: Description.
   */
  public disableAbuse(): void {
    this.enable = false;
  }

  /**
   * todo: Description.
   */
  public enableAbuse(): void {
    this.enable = true;
  }
}
