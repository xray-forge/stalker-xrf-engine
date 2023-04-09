import { describe, expect, it } from "@jest/globals";
import { vector } from "xray16";

import {
  areSameVectors,
  areSameVectorsByPrecision,
  distanceBetween2d,
  vectorCross,
  vectorRotateY,
  yaw,
  yawDegree,
  yawDegree3d,
} from "@/engine/core/utils/vector";
import { MockVector } from "@/fixtures/xray/mocks/vector.mock";

describe("'vector' utils", () => {
  it("should correctly compare same vectors by value", () => {
    expect(areSameVectors(new vector(), new vector())).toBeTruthy();
    expect(areSameVectors(MockVector.mock(1, 2, 3), MockVector.mock(1, 2, 3))).toBeTruthy();
    expect(areSameVectors(MockVector.mock(1, 2, 3), new vector())).toBeFalsy();
    // Not precision based.
    expect(areSameVectors(MockVector.mock(1, 1, 0.3), MockVector.mock(1, 1, 0.2 + 0.1))).toBeFalsy();
  });

  it("should correctly compare same vectors by precision rate", () => {
    expect(areSameVectorsByPrecision(new vector(), new vector(), 0.001)).toBeTruthy();
    expect(areSameVectorsByPrecision(MockVector.mock(1, 2, 3), MockVector.mock(1, 2, 3), 0.001)).toBeTruthy();
    expect(areSameVectorsByPrecision(MockVector.mock(1, 2, 3), new vector(), 0.001)).toBeFalsy();

    // Precision based, correct.
    expect(areSameVectorsByPrecision(MockVector.mock(1, 1, 0.3), MockVector.mock(1, 1, 0.2 + 0.1), 0.001)).toBeTruthy();
  });

  it("should correctly check 2d distance", () => {
    expect(distanceBetween2d(new vector(), new vector())).toBe(0);
    expect(distanceBetween2d(MockVector.mock(1, 1, 1), MockVector.mock(-1, -1, -1))).toBe(2.8284271247461903);
    expect(distanceBetween2d(MockVector.mock(1, 1, 0), MockVector.mock(-1, -1, -1))).toBe(2.23606797749979);
    expect(distanceBetween2d(MockVector.mock(1, 1, 0), MockVector.mock(-1, -1, 0))).toBe(2);
    expect(distanceBetween2d(MockVector.mock(1, 0, 0), MockVector.mock(-1, -1, 0))).toBe(2);
    expect(distanceBetween2d(MockVector.mock(1, 1, 0), MockVector.mock(0, -1, 0))).toBe(1);
    expect(distanceBetween2d(MockVector.mock(1000, 1, 0), MockVector.mock(0, -1, 0))).toBe(1000);
  });

  it("should correctly calculate yaw", () => {
    expect(yaw(MockVector.mock(1, 0.25, 0.33), MockVector.mock(0.2, 0.2, 0.1))).toBe(0.1449000485801625);
    expect(yaw(MockVector.mock(0.5, 0.25, 0.1), MockVector.mock(0.05, 0.1, 0.8))).toBe(1.3109819569490586);
    expect(yaw(MockVector.mock(0.1, 0.1, 0.1), MockVector.mock(0.9, 0.9, 0.9))).toBe(0);
    expect(yaw(MockVector.mock(0.01, 0.01, 0.01), MockVector.mock(0.99, 0.99, 0.99))).toBe(0);
    expect(yaw(MockVector.mock(0.5, 0.5, 0.5), MockVector.mock(0.5, 0.5, 0.5))).toBe(2.1073424255447017e-8);
    expect(yaw(MockVector.mock(1, 1, 1), MockVector.mock(1, 1, 1))).toBe(2.1073424255447017e-8);
    expect(yaw(MockVector.mock(0, 0, 0), MockVector.mock(1, 1, 1))).toBeNaN();
    expect(yaw(MockVector.mock(0, 0, 0), MockVector.mock(0, 0, 0))).toBeNaN();
  });

  it("should correctly calculate yaw degree", () => {
    expect(yawDegree(MockVector.mock(1, 0.25, 0.33), MockVector.mock(0.2, 0.2, 0.1))).toBe(8.302149713434416);
    expect(yawDegree(MockVector.mock(0.5, 0.25, 0.1), MockVector.mock(0.05, 0.1, 0.8))).toBe(75.11362891076617);
    expect(yawDegree(MockVector.mock(0.1, 0.1, 0.1), MockVector.mock(0.9, 0.9, 0.9))).toBe(0);
    expect(yawDegree(MockVector.mock(0.01, 0.01, 0.01), MockVector.mock(0.99, 0.99, 0.99))).toBe(0);
    expect(yawDegree(MockVector.mock(0.5, 0.5, 0.5), MockVector.mock(0.5, 0.5, 0.5))).toBe(0.0000012074165941128156);
    expect(yawDegree(MockVector.mock(1, 1, 1), MockVector.mock(1, 1, 1))).toBe(0.0000012074165941128156);
    expect(yawDegree(MockVector.mock(0, 0, 0), MockVector.mock(1, 1, 1))).toBeNaN();
    expect(yawDegree(MockVector.mock(0, 0, 0), MockVector.mock(0, 0, 0))).toBeNaN();
  });

  it("should correctly calculate yaw degree 3d", () => {
    expect(yawDegree3d(MockVector.mock(1, 0.25, 0.33), MockVector.mock(0.2, 0.2, 0.1))).toBe(29.355944608609963);
    expect(yawDegree3d(MockVector.mock(0.5, 0.25, 0.1), MockVector.mock(0.05, 0.1, 0.8))).toBe(73.53711801923248);
    expect(yawDegree3d(MockVector.mock(0.1, 0.1, 0.1), MockVector.mock(0.9, 0.9, 0.9))).toBe(0);
    expect(yawDegree3d(MockVector.mock(0.01, 0.01, 0.01), MockVector.mock(0.99, 0.99, 0.99))).toBeNaN();
    expect(yawDegree3d(MockVector.mock(0.5, 0.5, 0.5), MockVector.mock(0.5, 0.5, 0.5))).toBeNaN();
    expect(yawDegree3d(MockVector.mock(1, 1, 1), MockVector.mock(1, 1, 1))).toBeNaN();
    expect(yawDegree3d(MockVector.mock(0, 0, 0), MockVector.mock(1, 1, 1))).toBeNaN();
    expect(yawDegree3d(MockVector.mock(0, 0, 0), MockVector.mock(0, 0, 0))).toBeNaN();
  });

  it("should correctly calculate vector cross", () => {
    expect(vectorCross(MockVector.mock(1, -0.1, 0.25), MockVector.mock(0.2, -1, -1))).toEqual(
      MockVector.create(0.35, 1.05, -0.98)
    );
    expect(vectorCross(MockVector.mock(5, 25, 125), MockVector.mock(-10, -100, -1000))).toEqual(
      MockVector.create(-12500, 3750, -250)
    );
    expect(vectorCross(MockVector.mock(0.01, 0.01, 0.01), MockVector.mock(0.99, 0.99, 0.99))).toEqual(
      MockVector.create(0, 0, 0)
    );
    expect(vectorCross(MockVector.mock(0.5, 0.5, 0.5), MockVector.mock(0.5, 0.5, 0.5))).toEqual(
      MockVector.create(0, 0, 0)
    );
    expect(vectorCross(MockVector.mock(1, 1, 1), MockVector.mock(1, 1, 1))).toEqual(MockVector.create(0, 0, 0));
    expect(vectorCross(MockVector.mock(0, 0, 0), MockVector.mock(1, 1, 1))).toEqual(MockVector.create(0, 0, 0));
    expect(vectorCross(MockVector.mock(0, 0, 0), MockVector.mock(0, 0, 0))).toEqual(MockVector.create(0, 0, 0));
  });

  it("should correctly rotate y", () => {
    expect(vectorRotateY(MockVector.mock(1, 0.5, 0.25), 45)).toEqual(
      MockVector.create(0.5303300858899107, 0.5, 0.8838834764831843)
    );
    expect(vectorRotateY(MockVector.mock(-0.25, 0.3, 0.45), 10)).toEqual(
      MockVector.create(-0.32434361820317065, 0.3, 0.39975144443876104)
    );
  });
});
