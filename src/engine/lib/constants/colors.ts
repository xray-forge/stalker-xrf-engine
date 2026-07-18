/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * RGB color used by engine and generated form color definitions.
 */
export interface IRgbColor {
  r: number;
  g: number;
  b: number;
}

export const BLACK: IRgbColor = { b: 0, g: 0, r: 0 };
export const WHITE: IRgbColor = { b: 255, g: 255, r: 255 };
export const DEFAULT_GENERIC: IRgbColor = { b: 80, g: 80, r: 80 };
