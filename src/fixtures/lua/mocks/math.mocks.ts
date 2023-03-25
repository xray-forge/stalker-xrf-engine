/**
 * todo;
 */
export const math = {
  pi: Math.PI,
  max: (...args: Array<number>) => Math.max(...args),
  abs: (value: number) => Math.abs(value),
  random: (max: number) => 1 + Math.random() * (max - 1),
};
