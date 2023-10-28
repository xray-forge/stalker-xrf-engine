import { time_global } from "xray16";

import { AbstractSchemeManager } from "@/engine/core/ai/scheme";
import { ISchemeAbuseState } from "@/engine/core/schemes/stalker/abuse/abuse_types";
import { Optional, TCount, TRate, TTimestamp } from "@/engine/lib/types";

/**
 * Abuse manager to handle state for an object.
 */
export class AbuseManager extends AbstractSchemeManager<ISchemeAbuseState> {
  public isEnabled: boolean = true;
  public isHitDone: boolean = false;

  public abuseRate: TRate = 2;
  public abuseValue: TCount = 0;
  public abuseThreshold: TRate = 5;

  public lastUpdatedAt: Optional<TTimestamp> = null;

  /**
   * @returns whether target is abused
   */
  public update(): boolean {
    if (!this.isEnabled) {
      return false;
    }

    const now: TTimestamp = time_global();

    if (this.lastUpdatedAt === null) {
      this.lastUpdatedAt = now;
    }

    if (this.abuseValue > 0) {
      this.abuseValue = this.abuseValue - (now - this.lastUpdatedAt) * 0.00005;
    } else {
      this.abuseValue = 0;
    }

    if (this.abuseValue > this.abuseThreshold * 1.1) {
      this.abuseValue = this.abuseThreshold * 1.1;
    }

    if (this.isHitDone && this.abuseValue < (this.abuseThreshold * 2) / 3) {
      this.isHitDone = false;
    }

    this.lastUpdatedAt = now;

    return this.isAbused();
  }

  /**
   * Change abuse rate for an object.
   */
  public setAbuseRate(rate: TRate): void {
    this.abuseRate = rate;
  }

  /**
   * @returns whether object is abused
   */
  public isAbused(): boolean {
    return this.abuseValue >= this.abuseThreshold;
  }

  /**
   * Increment abuse count.
   */
  public addAbuse(value: TCount): void {
    if (this.isEnabled) {
      this.abuseValue = this.abuseValue + value * this.abuseRate;
    }
  }

  /**
   * Clear object abuse state.
   */
  public clearAbuse(): void {
    this.abuseValue = 0;
  }

  /**
   * Disable abuse possibility.
   */
  public disableAbuse(): void {
    this.isEnabled = false;
  }

  /**
   * Enable abuse possibility.
   */
  public enableAbuse(): void {
    this.isEnabled = true;
  }
}
