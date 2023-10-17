/**
 * Mock default lua library.
 */
export const mockMath = {
  pi: Math.PI,
  max: (...args: Array<number>) => Math.max(...args),
  min: (...args: Array<number>) => Math.min(...args),
  abs: (value: number) => Math.abs(value),
  sqrt: (value: number) => Math.sqrt(value),
  cos: (value: number) => Math.cos(value),
  ceil: (value: number) => Math.ceil(value),
  sin: (value: number) => Math.sin(value),
  mod: (value: number, base: number) => value % base,
  random: (max?: number) => {
    if (max === undefined) {
      return Math.random();
    }

    return 1 + Math.round(Math.random() * (max - 1));
  },
  floor: (value: number) => Math.floor(value),
  /**
   * value – a number representing a cosine, where x is between -1 and 1
   */
  acos: (value: number) => Math.acos(value),
};
