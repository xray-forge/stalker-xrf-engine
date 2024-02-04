import { describe, expect, it } from "@jest/globals";

import { transformBytesToMegabytes } from "#/utils/fs/transform";

describe("transformBytesToMegabytes util", () => {
  it("should correctly convert values", () => {
    expect(transformBytesToMegabytes(1024 * 1024)).toBe(1);
    expect(transformBytesToMegabytes(1024 * 1024 * 5)).toBe(5);

    expect(transformBytesToMegabytes(6_836_411)).toBe(6.52);
    expect(transformBytesToMegabytes(15_836_411)).toBe(15.103);
    expect(transformBytesToMegabytes(255_255_255)).toBe(243.43);
  });

  it("should measure with precision", () => {
    expect(transformBytesToMegabytes(1_023_610)).toBe(0.976);
    expect(transformBytesToMegabytes(1_023_610, 3)).toBe(0.976);
    expect(transformBytesToMegabytes(1_023_610, 2)).toBe(0.98);
    expect(transformBytesToMegabytes(1_023_610, 1)).toBe(1);
    expect(transformBytesToMegabytes(923_610, 1)).toBe(0.9);
  });
});
