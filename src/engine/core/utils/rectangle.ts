import { Frect } from "xray16";

import { screenConfig } from "@/engine/lib/configs/ScreenConfig";

/**
 * Create rectangle based on screen base layout expectations.
 *
 * @inline
 *
 * @returns New rectangle describing screen layout.
 */
export function createScreenRectangle(): Frect {
  return new Frect().set(0, 0, screenConfig.BASE_WIDTH, screenConfig.BASE_HEIGHT);
}

/**
 * Create rectangle based on 4 coordinates.
 *
 * @inline
 *
 * @param x1 - Top left x point.
 * @param y1 - Top left y point.
 * @param x2 - Bot right y point.
 * @param y2 - Bot right y point.
 * @returns New rectangle.
 */
export function createRectangle(x1: number, y1: number, x2: number, y2: number): Frect {
  return new Frect().set(x1, y1, x2, y2);
}

/**
 * Create rectangle based on another rectangle.
 *
 * @inline
 *
 * @param from - Target to copy coordinates from.
 * @returns New copied rectangle.
 */
export function copyRectangle(from: Frect): Frect {
  return new Frect().set(from.x1, from.y1, from.x2, from.y2);
}
