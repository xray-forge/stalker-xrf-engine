import { Vector } from "xray16/alias";
import { TDistance, TRate } from "xray16/lib";

import { copyVector, createVector } from "@/engine/core/utils/vector";

/**
 * @param position - Object position.
 * @param velocity - Object velocity.
 * @param destination - Destination to calculate position around.
 * @param radius - Radius around destination.
 * @returns Position in radius around required destination.
 */
export function calculatePositionInRadius(
  position: Readonly<Vector>,
  velocity: Readonly<Vector>,
  destination: Readonly<Vector>,
  radius: TDistance
): Vector {
  const po: Vector = copyVector(destination).sub(position);
  const vperp: Vector = createVector(-velocity.z, 0, velocity.x);
  const l: TRate = math.sqrt(radius ** 2 - copyVector(po).dotproduct(vperp) ** 2);

  return copyVector(position).add(copyVector(velocity).mul(copyVector(po).dotproduct(velocity) + l));
}
