import { copyVector, createVector } from "@/engine/core/utils/vector";
import { TDistance, TRate, Vector } from "@/engine/lib/types";

/**
 * @param position - object position
 * @param velocity - object velocity
 * @param destination - destination to calculate position around
 * @param radius - radius around destination
 * @returns position in radius around required destination
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
