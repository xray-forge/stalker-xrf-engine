import { GameObject } from "xray16/alias";
import { LuaArray, NIL, Nillable, TCount, TIndex, TRate, TRUE, TSection } from "xray16/lib";
import { $isNil } from "xray16/macros";

import { registry } from "@/engine/core/database";
import { getStateIndexByHp } from "@/engine/core/schemes/stalker/wounded/utils/wounded_parse";
import { IWoundedStateDescriptor } from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";

/**
 * Process object wounded condition lists for HP based on whether actor sees object or not.
 *
 * @param object - Target game object to process logics for.
 * @param states - List of wounded state breakpoints when object does not see actor.
 * @param statesSee - List of wounded state breakpoints when object see actor.
 * @param hp - Current object health in [0, 100] range.
 * @returns Multiple values, where first is result of state condition list and second is result of sound condition list.
 */
export function processHPWound(
  object: GameObject,
  states: LuaArray<IWoundedStateDescriptor>,
  statesSee: LuaArray<IWoundedStateDescriptor>,
  hp: TRate
): LuaMultiReturn<[TSection, TSection]> {
  // todo: Probably key should be taken from states or states see based on *.see() condition.
  // todo: Potential crash if visible/not visible keys are different.
  const key: Nillable<TIndex> = getStateIndexByHp(states, hp);

  if ($isNil(key)) {
    return $multi(NIL, NIL);
  }

  const descriptor: IWoundedStateDescriptor = object.see(registry.actor) ? statesSee.get(key) : states.get(key);

  let stateResult: Nillable<TSection> = null;
  let soundResult: Nillable<TSection> = null;

  if (descriptor.state) {
    stateResult = pickSectionFromCondList(registry.actor, object, descriptor.state as TConditionList);
  }

  if (descriptor.sound) {
    soundResult = pickSectionFromCondList(registry.actor, object, descriptor.sound as TConditionList);
  }

  return $multi(tostring(stateResult), tostring(soundResult));
}

/**
 * Process object wounded condition lists for psy HP.
 *
 * @param object - Target game object to process logics for.
 * @param states - List of wounded state breakpoints.
 * @param hp - Current object psy health in [0, 100] range.
 * @returns Multiple values, where first is result of state condition list and second is result of sound condition list.
 */
export function processPsyWound(
  object: GameObject,
  states: LuaArray<IWoundedStateDescriptor>,
  hp: TCount
): LuaMultiReturn<[TSection, TSection]> {
  const key: Nillable<TIndex> = getStateIndexByHp(states, hp);

  if ($isNil(key)) {
    return $multi(NIL, NIL);
  }

  const descriptor: IWoundedStateDescriptor = states.get(key);

  let stateResult: Nillable<TSection> = null;
  let soundResult: Nillable<TSection> = null;

  if (descriptor.state) {
    stateResult = pickSectionFromCondList(registry.actor, object, descriptor.state as TConditionList);
  }

  if (descriptor.sound) {
    soundResult = pickSectionFromCondList(registry.actor, object, descriptor.sound as TConditionList);
  }

  return $multi(tostring(stateResult), tostring(soundResult));
}

/**
 * Process object being wound victim condition lists.
 *
 * @param object - Target game object to process logics for.
 * @param states - List of wounded state breakpoints for victim logics.
 * @param hp - Current object psy health in [0, 100] range.
 * @returns Result of victim condition list based on current HP breakpoint.
 */
export function processVictim(object: GameObject, states: LuaArray<IWoundedStateDescriptor>, hp: TRate): string {
  const key: Nillable<TIndex> = getStateIndexByHp(states, hp);

  if ($isNil(key)) {
    return NIL;
  }

  const descriptor: IWoundedStateDescriptor = states.get(key);

  return descriptor.state
    ? tostring(pickSectionFromCondList(registry.actor, object, descriptor.state as TConditionList))
    : NIL;
}

/**
 * Process object fighting logics while wounded.
 *
 * @param object - Target game object to process logics for.
 * @param states - List of wounded state breakpoints for fighting logics.
 * @param hp - Current object psy health in [0, 100] range.
 * @returns Result of fight condition list based on current HP breakpoint.
 */
export function processFight(object: GameObject, states: LuaArray<IWoundedStateDescriptor>, hp: TRate): string {
  const key: Nillable<TIndex> = getStateIndexByHp(states, hp);

  if ($isNil(key)) {
    return TRUE;
  }

  const descriptor: IWoundedStateDescriptor = states.get(key);

  return descriptor.state ? tostring(pickSectionFromCondList(registry.actor, object, descriptor.state)) : TRUE;
}
