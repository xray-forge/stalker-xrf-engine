import { describe, expect, it } from "@jest/globals";
import { Frect } from "xray16";

import { copyRectangle, createRectangle, createScreenRectangle } from "@/engine/core/utils/rectangle";

describe("rectangle utils", () => {
  it("createScreenRectangle should correctly create rectangles describing screen", () => {
    const rectangle: Frect = createScreenRectangle();

    expect(rectangle.x1).toBe(0);
    expect(rectangle.y1).toBe(0);
    expect(rectangle.x2).toBe(1024);
    expect(rectangle.y2).toBe(768);
  });

  it("createRectangle should correctly create rectangles", () => {
    const rectangle: Frect = createRectangle(0, 1, 2, 3);

    expect(rectangle.x1).toBe(0);
    expect(rectangle.y1).toBe(1);
    expect(rectangle.x2).toBe(2);
    expect(rectangle.y2).toBe(3);
  });

  it("copyRectangle should correctly copy rectangles", () => {
    const rectangle: Frect = createRectangle(0, 1, 2, 3);
    const copied: Frect = copyRectangle(rectangle);

    expect(copied).not.toBe(rectangle);
    expect(copied.x1).toBe(0);
    expect(copied.y1).toBe(1);
    expect(copied.x2).toBe(2);
    expect(copied.y2).toBe(3);
  });
});
