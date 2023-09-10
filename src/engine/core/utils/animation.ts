import { TAnimationSequenceElement, TAnimationSequenceElements } from "@/engine/core/objects/animation/types";
import { LuaArray, Optional } from "@/engine/lib/types";

/**
 * Create animation sequence.
 *
 * @param sequence - variadic parameters describing animations
 * @returns sequence of animations, 0-based array
 */
export function createSequence(
  ...sequence: Array<
    Optional<TAnimationSequenceElements | LuaArray<TAnimationSequenceElement>> | Array<TAnimationSequenceElements>
  >
): LuaArray<TAnimationSequenceElements> {
  const list: LuaArray<TAnimationSequenceElements> = new LuaTable();

  for (const [index, it] of $fromArray(sequence)) {
    list.set(index - 1, it as TAnimationSequenceElement);
  }

  return list;
}
