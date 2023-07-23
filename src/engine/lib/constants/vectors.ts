import { createEmptyVector, createVector } from "@/engine/core/utils/vector";
import { Vector } from "@/engine/lib/types";

/**
 * Empty zero vector singleton.
 */
export const ZERO_VECTOR: Vector = createEmptyVector();

export const X_VECTOR: Vector = createVector(1, 0, 0);
export const MX_VECTOR: Vector = createVector(-1, 0, 0);

export const Y_VECTOR: Vector = createVector(0, 1, 0);
export const MY_VECTOR: Vector = createVector(0, -1, 0);

export const Z_VECTOR: Vector = createVector(0, 0, 1);
export const MZ_VECTOR: Vector = createVector(0, 0, -1);
