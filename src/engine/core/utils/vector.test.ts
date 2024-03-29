import { describe, expect, it } from "@jest/globals";
import { vector, vector2 } from "xray16";

import {
  addVectors,
  angleDiff,
  angleToDirection,
  areSame2dVectors,
  areSameVectors,
  areSameVectorsByPrecision,
  copyVector,
  create2dVector,
  createEmpty2dVector,
  createEmptyVector,
  createVector,
  degreeToRadian,
  distanceBetween2d,
  radianToDegree,
  subVectors,
  vectorCross,
  vectorRotateY,
  vectorToString,
  yaw,
  yawDegree,
  yawDegree3d,
} from "@/engine/core/utils/vector";
import { Vector } from "@/engine/lib/types";
import { MockVector, MockVector2D } from "@/fixtures/xray";

describe("createEmptyVector util", () => {
  it("should correctly create empty vectors", () => {
    expect(areSameVectors(new vector().set(0, 0, 0), createEmptyVector())).toBeTruthy();
    expect(areSameVectors(new vector().set(1, 0, 0), createEmptyVector())).not.toBeTruthy();
  });
});

describe("createEmpty2dVector util", () => {
  it("should correctly create empty vectors", () => {
    expect(areSame2dVectors(new vector2().set(0, 0), createEmpty2dVector())).toBeTruthy();
    expect(areSame2dVectors(new vector2().set(1, 0), createEmpty2dVector())).not.toBeTruthy();
  });
});

describe("createVector util", () => {
  it("should correctly create vectors", () => {
    expect(areSameVectors(new vector().set(0, 0, 0), createVector(0, 0, 0))).toBeTruthy();
    expect(areSameVectors(new vector().set(1, 0, 1), createVector(1, 0, 1))).toBeTruthy();
    expect(areSameVectors(new vector().set(55, -5, 25), createVector(55, -5, 25))).toBeTruthy();
  });
});

describe("create2dVector util", () => {
  it("should correctly create vectors", () => {
    expect(areSame2dVectors(new vector2().set(0, 0), create2dVector(0, 0))).toBeTruthy();
    expect(areSame2dVectors(new vector2().set(1, 0), create2dVector(1, 0))).toBeTruthy();
    expect(areSame2dVectors(new vector2().set(55, -5), create2dVector(55, -5))).toBeTruthy();
  });
});

describe("addVectors util", () => {
  it("should correctly add vectors", () => {
    const first: Vector = createVector(1, 2, 4);
    const second: Vector = createVector(3, 6, 9);
    const result: Vector = addVectors(first, second);

    expect(areSameVectors(result, createVector(4, 8, 13))).toBeTruthy();
    expect(first).not.toBe(result);
    expect(second).not.toBe(result);
  });
});

describe("subVectors util", () => {
  it("should correctly sub vectors", () => {
    const first: Vector = createVector(25, 50, 100);
    const second: Vector = createVector(12, 15, 25);
    const result: Vector = subVectors(first, second);

    expect(areSameVectors(result, createVector(13, 35, 75))).toBeTruthy();
    expect(first).not.toBe(result);
    expect(second).not.toBe(result);
  });
});

describe("copyVector util", () => {
  it("should correctly copy vectors", () => {
    const first: Vector = createVector(1, 2, 3);
    const second: Vector = createVector(-1, -2, -3);

    expect(areSameVectors(first, copyVector(first))).toBeTruthy();
    expect(areSameVectors(second, copyVector(second))).toBeTruthy();

    const copy: Vector = copyVector(second);

    expect(copy.x).toBe(-1);
    expect(copy.y).toBe(-2);
    expect(copy.z).toBe(-3);
  });
});

describe("areSameVectors util", () => {
  it("should correctly compare same vectors by value", () => {
    expect(areSameVectors(createEmptyVector(), createEmptyVector())).toBeTruthy();
    expect(areSameVectors(MockVector.mock(1, 2, 3), MockVector.mock(1, 2, 3))).toBeTruthy();
    expect(areSameVectors(MockVector.mock(1, 2, 3), createEmptyVector())).toBeFalsy();
    // Not precision based.
    expect(areSameVectors(MockVector.mock(1, 1, 0.3), MockVector.mock(1, 1, 0.2 + 0.1))).toBeFalsy();
  });
});

describe("areSame2dVectors util", () => {
  it("should correctly compare same 2d vectors by value", () => {
    expect(areSame2dVectors(createEmpty2dVector(), createEmpty2dVector())).toBeTruthy();
    expect(areSame2dVectors(MockVector2D.mock(1, 2), MockVector2D.mock(1, 2))).toBeTruthy();
    expect(areSame2dVectors(MockVector2D.mock(1, 2), createEmpty2dVector())).toBeFalsy();
    // Not precision based.
    expect(areSame2dVectors(MockVector2D.mock(1, 0.3), MockVector2D.mock(1, 0.2 + 0.1))).toBeFalsy();
  });
});

describe("areSameVectorsByPrecision util", () => {
  it("should correctly compare same vectors by precision rate", () => {
    expect(areSameVectorsByPrecision(createEmptyVector(), createEmptyVector(), 0.001)).toBeTruthy();
    expect(areSameVectorsByPrecision(MockVector.mock(1, 2, 3), MockVector.mock(1, 2, 3), 0.001)).toBeTruthy();
    expect(areSameVectorsByPrecision(MockVector.mock(1, 2, 3), createEmptyVector(), 0.001)).toBeFalsy();

    // Precision based, correct.
    expect(areSameVectorsByPrecision(MockVector.mock(1, 1, 0.3), MockVector.mock(1, 1, 0.2 + 0.1), 0.001)).toBeTruthy();
  });
});

describe("distanceBetween2d util", () => {
  it("should correctly check 2d distance", () => {
    expect(distanceBetween2d(createEmptyVector(), createEmptyVector())).toBe(0);
    expect(distanceBetween2d(MockVector.mock(1, 1, 1), MockVector.mock(-1, -1, -1))).toBe(2.8284271247461903);
    expect(distanceBetween2d(MockVector.mock(1, 1, 0), MockVector.mock(-1, -1, -1))).toBe(2.23606797749979);
    expect(distanceBetween2d(MockVector.mock(1, 1, 0), MockVector.mock(-1, -1, 0))).toBe(2);
    expect(distanceBetween2d(MockVector.mock(1, 0, 0), MockVector.mock(-1, -1, 0))).toBe(2);
    expect(distanceBetween2d(MockVector.mock(1, 1, 0), MockVector.mock(0, -1, 0))).toBe(1);
    expect(distanceBetween2d(MockVector.mock(1000, 1, 0), MockVector.mock(0, -1, 0))).toBe(1000);
  });
});

describe("yaw util", () => {
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
});

describe("yawDegree util", () => {
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
});

describe("yawDegree3d util", () => {
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
});

describe("vectorCross util", () => {
  it("should correctly calculate cross multiplication", () => {
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
    expect(vectorCross(MockVector.mock(5, 1, 2), MockVector.mock(0, 0, 0))).toEqual(MockVector.create(0, 0, 0));
    expect(vectorCross(MockVector.mock(-5, -1, -2), MockVector.mock(0, 0, 0))).toEqual(MockVector.create(0, 0, 0));
  });
});

describe("vectorRotateY util", () => {
  it("should correctly rotate y", () => {
    expect(vectorRotateY(MockVector.mock(1, 0.5, 0.25), 45)).toEqual(
      MockVector.create(0.5303300858899107, 0.5, 0.8838834764831843)
    );
    expect(vectorRotateY(MockVector.mock(-0.25, 0.3, 0.45), 10)).toEqual(
      MockVector.create(-0.32434361820317065, 0.3, 0.39975144443876104)
    );
  });
});

describe("angleDiff util", () => {
  it("should correctly get angle diff", () => {
    expect(angleDiff(MockVector.mock(1, 0.5, 0.25), MockVector.mock(1, 0.5, 0.25))).toBe(0.0000012074182697257333);
    expect(angleDiff(MockVector.mock(0, 0, 0.5), MockVector.mock(1, 1, 0.5))).toBe(70.52877936550931);
    expect(angleDiff(MockVector.mock(0, 1.5, 0), MockVector.mock(1, 1, 0.5))).toBe(48.189685104221404);
  });
});

describe("angleToDirection util", () => {
  it("should correctly create new vector based on provided values", () => {
    expect(angleToDirection(MockVector.mock(1, 0.5, 0.25))).toEqual(
      MockVector.mock(-0.2590347239999257, 0.8414709848078965, 0.4741598817790379)
    );
    expect(angleToDirection(MockVector.mock(50, -20, 30))).toEqual(
      MockVector.mock(0.8809611528253755, -0.26237485370392877, 0.3937853264869419)
    );
  });
});

describe("radianToDegree util", () => {
  it("should correctly convert", () => {
    expect(radianToDegree(1)).toBe(57.29577951308232);
    expect(radianToDegree(1000)).toBe(57295.77951308232);
    expect(radianToDegree(math.pi)).toBe(180);
    expect(radianToDegree(math.pi * 5)).toBe(900);
  });
});

describe("distanceBetween2d util", () => {
  it("should correctly get distance", () => {
    expect(distanceBetween2d(MockVector.mock(0, 0, 0), MockVector.mock(1, 1, 1))).toBe(1.4142135623730951);
    expect(distanceBetween2d(MockVector.mock(0, 0, 0), MockVector.mock(1, 500, 1))).toBe(1.4142135623730951);
    expect(distanceBetween2d(MockVector.mock(0, 0, 0), MockVector.mock(55, 500, 0))).toBe(55);
    expect(distanceBetween2d(MockVector.mock(0, 0, 0), MockVector.mock(-55, 0, 0))).toBe(55);
  });
});

describe("degreeToRadian util", () => {
  it("should correctly convert", () => {
    expect(degreeToRadian(57.29577951308232)).toBe(1);
    expect(degreeToRadian(57295.77951308232)).toBe(1000);
    expect(degreeToRadian(180)).toBe(math.pi);
    expect(degreeToRadian(900)).toBe(math.pi * 5);
  });
});

describe("vectorToString util", () => {
  it("should correctly transform to string", () => {
    expect(vectorToString(null)).toBe("nil");
    expect(vectorToString(createEmptyVector())).toBe("[0:0:0]");
    expect(vectorToString(createVector(1, 2, 3))).toBe("[1:2:3]");
    expect(vectorToString(createVector(-55, 0.125, -3.6))).toBe("[-55:0.125:-3.6]");
  });
});
