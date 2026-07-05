import { $fromArray } from "xray16/macros";

import { TAnimationSequenceElement, TAnimationSequenceElements } from "@/engine/core/animation/types";
import { LuaArray, Nillable } from "@/engine/lib/types";

/**
 * Create animation sequence.
 *
 * @param sequence - Variadic parameters describing animations.
 * @returns Sequence of animations, 0-based array.
 */
export function createSequence(
  ...sequence: Array<
    Nillable<TAnimationSequenceElements | LuaArray<TAnimationSequenceElement>> | Array<TAnimationSequenceElements>
  >
): LuaArray<TAnimationSequenceElements> {
  const list: LuaArray<TAnimationSequenceElements> = new LuaTable();

  for (const [index, it] of $fromArray(sequence)) {
    list.set(index - 1, it as TAnimationSequenceElement);
  }

  return list;
}
