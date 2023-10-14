import { Frect } from "xray16";

/**
 * Create rectangle based on 4 coordinates.
 *
 * @param x1 - top left x point
 * @param y1 - top left y point
 * @param x2 - bot right y point
 * @param y2 - bot right y point
 * @returns new rectangle
 */
export function createRectangle(x1: number, y1: number, x2: number, y2: number): Frect {
  return new Frect().set(x1, y1, x2, y2);
}
