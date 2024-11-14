import { registry } from "@/engine/core/database";
import { getStateIndexByHp } from "@/engine/core/schemes/stalker/wounded/utils/wounded_parse";
import { IWoundedStateDescriptor } from "@/engine/core/schemes/stalker/wounded/wounded_types";
import { pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { GameObject, type LuaArray, Optional, TCount, TIndex, TRate, TSection } from "@/engine/lib/types";

/**
 * Process object wounded condition lists for HP based on whether actor sees object or not.
 *
 * @param object - target game object to process logics for
 * @param states - list of wounded state breakpoints when object does not see actor
 * @param statesSee - list of wounded state breakpoints when object see actor
 * @param hp - current object health in [0, 100] range
 * @returns multiple values, where first is result of state condition list and second is result of sound condition list
 */
export function processHPWound(
  object: GameObject,
  states: LuaArray<IWoundedStateDescriptor>,
  statesSee: LuaArray<IWoundedStateDescriptor>,
  hp: TRate
): LuaMultiReturn<[TSection, TSection]> {
  // todo: Probably key should be taken from states or states see based on *.see() condition.
  // todo: Potential crash if visible/not visible keys are different.
  const key: Optional<TIndex> = getStateIndexByHp(states, hp);

  if (key === null) {
    return $multi(NIL, NIL);
  }

  const descriptor: IWoundedStateDescriptor = object.see(registry.actor) ? statesSee.get(key) : states.get(key);

  let stateResult: Optional<TSection> = null;
  let soundResult: Optional<TSection> = null;

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
 * @param object - target game object to process logics for
 * @param states - list of wounded state breakpoints
 * @param hp - current object psy health in [0, 100] range
 * @returns multiple values, where first is result of state condition list and second is result of sound condition list
 */
export function processPsyWound(
  object: GameObject,
  states: LuaArray<IWoundedStateDescriptor>,
  hp: TCount
): LuaMultiReturn<[TSection, TSection]> {
  const key: Optional<TIndex> = getStateIndexByHp(states, hp);

  if (key === null) {
    return $multi(NIL, NIL);
  }

  const descriptor: IWoundedStateDescriptor = states.get(key);

  let stateResult: Optional<TSection> = null;
  let soundResult: Optional<TSection> = null;

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
 * @param object - target game object to process logics for
 * @param states - list of wounded state breakpoints for victim logics
 * @param hp - current object psy health in [0, 100] range
 * @returns result of victim condition list based on current HP breakpoint
 */
export function processVictim(object: GameObject, states: LuaArray<IWoundedStateDescriptor>, hp: TRate): string {
  const key: Optional<TIndex> = getStateIndexByHp(states, hp);

  if (key === null) {
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
 * @param object - target game object to process logics for
 * @param states - list of wounded state breakpoints for fighting logics
 * @param hp - current object psy health in [0, 100] range
 * @returns result of fight condition list based on current HP breakpoint
 */
export function processFight(object: GameObject, states: LuaArray<IWoundedStateDescriptor>, hp: TRate): string {
  const key: Optional<TIndex> = getStateIndexByHp(states, hp);

  if (key === null) {
    return TRUE;
  }

  const descriptor: IWoundedStateDescriptor = states.get(key);

  return descriptor.state ? tostring(pickSectionFromCondList(registry.actor, object, descriptor.state)) : TRUE;
}
