import { jest } from "@jest/globals";
import { XR_CTime } from "xray16";

/**
 * Mock CTime object.
 */
export class MockCTime {
  public static create(y: number, m: number, d: number, h: number, min: number, sec: number, ms: number): MockCTime {
    const time: MockCTime = new MockCTime();

    time.set(y, m, d, h, min, sec, ms);

    return time;
  }

  public static mock(y: number, m: number, d: number, h: number, min: number, sec: number, ms: number): XR_CTime {
    return MockCTime.create(y, m, d, h, min, sec, ms) as unknown as XR_CTime;
  }

  public y: number = 2012;
  public m: number = 6;
  public d: number = 12;
  public h: number = 9;
  public min: number = 30;
  public sec: number = 0;
  public ms: number = 0;

  public get = jest.fn(
    (
      y: number,
      m: number,
      d: number,
      h: number,
      min: number,
      sec: number,
      ms: number
    ): [number, number, number, number, number, number, number] => {
      return [this.y, this.m, this.d, this.h, this.min, this.sec, this.ms];
    }
  );

  public set = jest.fn((y: number, m: number, d: number, h: number, min: number, sec: number, ms: number): void => {
    this.y = y;
    this.m = m;
    this.d = d;
    this.h = h;
    this.min = min;
    this.sec = sec;
    this.ms = ms;
  });

  public toString(): string {
    return `y:${this.y}, m:${this.m}, d:${this.d}, h:${this.h}, min:${this.min}, sec:${this.sec}, ms:${this.ms}`;
  }
}
