export class TimeTracker {

  private static STARTED_AT: string = "STARTED_AT";
  private static ENDED_AT: string = "ENDED_AT";

  private marks: Map<string, number> = new Map();

  private startedAt: number = 0;
  private endedAt: number = 0;

  public constructor() {}

  public start(): TimeTracker {
    if (this.marks.has(TimeTracker.STARTED_AT)) {
      throw new Error("Blocked attempt to start time tracker multiple times.");
    }

    this.startedAt = Date.now();

    return this;
  }

  public end(): TimeTracker {
    if (!TimeTracker.STARTED_AT) {
      throw new Error("Blocked attempt to end time tracker without start.");
    }

    this.endedAt = Date.now();

    return this;
  }

  public addMark(name: string): TimeTracker {
    this.marks.set(name, Date.now());

    return this;
  }

  public getDuration(): number {
    return this.endedAt - this.startedAt;
  }

  public getStats(): Record<string, number> {
    const stats: Record<string, number> = {};
    let lastTs: number = this.startedAt;

    if (!this.startedAt) {
      throw new Error("Cannot collect stats, timer is not started yet.");
    }

    for (const [ key, value ] of this.marks.entries()) {
      stats[key] = value - lastTs;
      lastTs = value;
    }

    if (this.endedAt) {
      stats["TOTAL"] = this.getDuration();
    }

    return stats;
  }

}
