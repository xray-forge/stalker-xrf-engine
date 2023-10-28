import { Frect } from "xray16";

import { screenConfig } from "@/engine/lib/configs/ScreenConfig";

/**
 * Create rectangle based on screen base layout expectations.
 *
 * @returns new rectangle describing screen layout
 */
export function createScreenRectangle(): Frect {
  return new Frect().set(0, 0, screenConfig.BASE_WIDTH, screenConfig.BASE_HEIGHT);
}

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

/**
 * Create rectangle based on another rectangle.
 *
 * @param from - target to copy coordinates from
 * @returns new copied rectangle
 */
export function copyRectangle(from: Frect): Frect {
  return new Frect().set(from.x1, from.y1, from.x2, from.y2);
}
