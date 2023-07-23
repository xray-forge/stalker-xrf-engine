import { animpointAnimations } from "@/engine/core/objects/animation/animations/animpoint";
import { baseAnimations } from "@/engine/core/objects/animation/animations/base";
import { priA15Animations } from "@/engine/core/objects/animation/animations/priA15";
import { scenarioAnimations } from "@/engine/core/objects/animation/animations/scenarios";
import { IAnimationDescriptor } from "@/engine/core/objects/state/animation_types";
import { mergeTables } from "@/engine/core/utils/table";
import { TName } from "@/engine/lib/types";

/**
 * List of game animations to use in logics.
 */
export const animations: LuaTable<TName, IAnimationDescriptor> = mergeTables(
  new LuaTable(),
  baseAnimations,
  animpointAnimations,
  scenarioAnimations,
  priA15Animations
);
