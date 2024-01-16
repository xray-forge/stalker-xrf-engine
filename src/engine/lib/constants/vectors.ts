import { createEmptyVector, createVector } from "@/engine/core/utils/vector";
import { Vector } from "@/engine/lib/types";

/**
 * Empty zero vector singleton.
 */
export const ZERO_VECTOR: Readonly<Vector> = createEmptyVector();

export const ONE_VECTOR: Readonly<Vector> = createVector(1, 1, 1);

export const X_VECTOR: Readonly<Vector> = createVector(1, 0, 0);
export const MX_VECTOR: Readonly<Vector> = createVector(-1, 0, 0);

export const Y_VECTOR: Readonly<Vector> = createVector(0, 1, 0);
export const MY_VECTOR: Readonly<Vector> = createVector(0, -1, 0);

export const Z_VECTOR: Readonly<Vector> = createVector(0, 0, 1);
export const MZ_VECTOR: Readonly<Vector> = createVector(0, 0, -1);
