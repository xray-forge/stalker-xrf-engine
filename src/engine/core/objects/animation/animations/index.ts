import { animpointAnimations } from "@/engine/core/objects/animation/animations/animpoint";
import { baseAnimations } from "@/engine/core/objects/animation/animations/base";
import { scenarioAnimations } from "@/engine/core/objects/animation/animations/scenarios";
import { scenariosPriA15Animations } from "@/engine/core/objects/animation/animations/scenariosPriA15";
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
  scenariosPriA15Animations
);
