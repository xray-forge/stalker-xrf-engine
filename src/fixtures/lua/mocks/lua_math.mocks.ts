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
  random: (...args: Array<number>) => {
    // Assert all numbers are integers.
    for (const arg of args) {
      if (arg % 1 !== 0) {
        throw new Error(
          `Expected only integer values to be provided for lua math.random method, got [${args.join(", ")}].`
        );
      }
    }

    if (args.length === 0) {
      return Math.random();
    } else if (args.length === 1) {
      return Math.max(1, Math.round(Math.random() * args[0]));
    } else {
      if (args[1] < args[0]) {
        throw new Error(
          `Bad call for lua math.random method, second argument should be bigger than first (${args[1]} > ${args[0]}).`
        );
      }

      return args[0] + Math.round(Math.random() * (args[1] - args[0]));
    }
  },
  floor: (value: number) => Math.floor(value),
  /**
   * value – a number representing a cosine, where x is between -1 and 1
   */
  acos: (value: number) => Math.acos(value),
};
