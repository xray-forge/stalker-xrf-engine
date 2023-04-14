import { jest } from "@jest/globals";

/**
 * Mock CTime object.
 */
export class MockCTime {
  public y: number = 0;
  public m: number = 0;
  public d: number = 0;
  public h: number = 0;
  public min: number = 0;
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
    this.h = min;
    this.min = min;
    this.sec = sec;
    this.ms = ms;
  });
}
