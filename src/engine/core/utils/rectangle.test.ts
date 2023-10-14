import { describe, expect, it } from "@jest/globals";
import { Frect } from "xray16";

import { createRectangle } from "@/engine/core/utils/rectangle";

describe("rectangle.test.ts class", () => {
  it("createRectangle should correctly create rectangles", () => {
    const rectangle: Frect = createRectangle(0, 1, 2, 3);

    expect(rectangle.x1).toBe(0);
    expect(rectangle.y1).toBe(1);
    expect(rectangle.x2).toBe(2);
    expect(rectangle.y2).toBe(3);
  });
});
