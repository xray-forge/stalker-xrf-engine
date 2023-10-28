import { animpointStates } from "@/engine/core/animation/states/animpoint";
import { baseStates } from "@/engine/core/animation/states/base";
import { priA15States } from "@/engine/core/animation/states/priA15";
import { scenarioStates } from "@/engine/core/animation/states/scenarios";
import { IStateDescriptor } from "@/engine/core/animation/types/state_types";
import { mergeTables } from "@/engine/core/utils/table";
import { TName } from "@/engine/lib/types";

/**
 * List of default state descriptors to use in scripts.
 */
export const states: LuaTable<TName, IStateDescriptor> = mergeTables(
  new LuaTable(),
  baseStates,
  animpointStates,
  scenarioStates,
  priA15States
);
