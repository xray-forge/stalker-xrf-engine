import { jest } from "@jest/globals";
import { CTime } from "xray16";

import { Time, TTimestamp } from "@/engine/lib/types";

/**
 * Mock CTime object.
 */
export class MockCTime {
  public static create(y: number, m: number, d: number, h: number, min: number, sec: number, ms: number): MockCTime {
    const time: MockCTime = new MockCTime();

    time.set(y, m, d, h, min, sec, ms);

    return time;
  }

  public static mock(y: number, m: number, d: number, h: number, min: number, sec: number, ms: number): Time {
    return MockCTime.create(y, m, d, h, min, sec, ms) as unknown as Time;
  }

  public static areEqual(first: MockCTime | CTime, second: MockCTime | CTime): boolean {
    return (first as MockCTime).isEqual(second);
  }

  public static nowTime: MockCTime = MockCTime.create(2012, 6, 12, 9, 30, 0, 0);

  public static now(): MockCTime {
    return MockCTime.nowTime.copy();
  }

  public y: number = 2012;
  public m: number = 6;
  public d: number = 12;
  public h: number = 9;
  public min: number = 30;
  public sec: number = 0;
  public ms: number = 0;

  public get = jest.fn((): [number, number, number, number, number, number, number] => {
    return [this.y, this.m, this.d, this.h, this.min, this.sec, this.ms];
  });

  public set = jest.fn((y: number, m: number, d: number, h: number, min: number, sec: number, ms: number): void => {
    this.y = y;
    this.m = m;
    this.d = d;
    this.h = h;
    this.min = min;
    this.sec = sec;
    this.ms = ms;
  });

  public diffSec = jest.fn((target: MockCTime): number => {
    return Math.abs(this.toAbsolute() - target.toAbsolute());
  });

  public copy(): MockCTime {
    const time: MockCTime = new MockCTime();

    time.set(this.y, this.m, this.d, this.h, this.min, this.sec, this.ms);

    return time;
  }

  public isEqual(time: MockCTime | CTime): boolean {
    const [y, m, d, h, min, sec, ms] = time.get(0, 0, 0, 0, 0, 0, 0);

    return (
      this.y === y &&
      this.m === m &&
      this.d === d &&
      this.h === h &&
      this.min === min &&
      this.sec === sec &&
      this.ms === ms
    );
  }

  public toString(): string {
    return `y:${this.y}, m:${this.m}, d:${this.d}, h:${this.h}, min:${this.min}, sec:${this.sec}, ms:${this.ms}`;
  }

  public toAbsolute(): number {
    return (
      this.ms +
      this.sec * 1000 +
      this.min * 60 +
      this.h * 3_600 +
      this.d * 86_400 +
      this.m * 2_592_000 +
      this.y * 31_104_000
    );
  }

  public toTimestamp(): TTimestamp {
    const base: number = MockCTime.create(1970, 1, 1, 0, 0, 0, 0).toAbsolute();
    const current: number = this.toAbsolute();

    if (base > current) {
      throw new Error("Not expected timestamp conversion - base is less than current.");
    }

    return current - base;
  }
}
