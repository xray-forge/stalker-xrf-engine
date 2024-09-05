import { registry } from "@/engine/core/database";
import { IWoundedStateDescriptor } from "@/engine/core/schemes/stalker/wounded";
import { getStateIndexByHp } from "@/engine/core/schemes/stalker/wounded/utils/wounded_parse";
import { pickSectionFromCondList, TConditionList } from "@/engine/core/utils/ini";
import { NIL, TRUE } from "@/engine/lib/constants/words";
import { GameObject, type LuaArray, Optional, TCount, TIndex, TRate } from "@/engine/lib/types";

/**
 * todo: Description.
 */
export function processHPWound(
  object: GameObject,
  hpState: LuaArray<IWoundedStateDescriptor>,
  hpStateSee: LuaArray<IWoundedStateDescriptor>,
  hp: TRate
): LuaMultiReturn<[string, string]> {
  const key: Optional<TIndex> = getStateIndexByHp(hpState, hp);

  if (key === null) {
    return $multi(NIL, NIL);
  }

  const descriptor: IWoundedStateDescriptor = object.see(registry.actor) ? hpStateSee.get(key) : hpState.get(key);

  let r1: Optional<string> = null;
  let r2: Optional<string> = null;

  if (descriptor.state) {
    r1 = pickSectionFromCondList(registry.actor, object, descriptor.state as TConditionList);
  }

  if (descriptor.sound) {
    r2 = pickSectionFromCondList(registry.actor, object, descriptor.sound as TConditionList);
  }

  return $multi(tostring(r1), tostring(r2));
}

/**
 * todo;
 * todo;
 * todo;
 *
 * @param object
 * @param psyState
 * @param hp
 */
export function processPsyWound(
  object: GameObject,
  psyState: LuaArray<IWoundedStateDescriptor>,
  hp: TCount
): LuaMultiReturn<[string, string]> {
  const key: Optional<TIndex> = getStateIndexByHp(psyState, hp);

  if (key === null) {
    return $multi(NIL, NIL);
  }

  const descriptor: IWoundedStateDescriptor = psyState.get(key);

  let r1: Optional<string> = null;
  let r2: Optional<string> = null;

  if (descriptor.state) {
    r1 = pickSectionFromCondList(registry.actor, object, descriptor.state as TConditionList);
  }

  if (descriptor.sound) {
    r2 = pickSectionFromCondList(registry.actor, object, descriptor.sound as TConditionList);
  }

  return $multi(tostring(r1), tostring(r2));
}

/**
 * todo: Description.
 */
export function processVictim(object: GameObject, hpVictim: LuaArray<IWoundedStateDescriptor>, hp: TRate): string {
  const key: Optional<TIndex> = getStateIndexByHp(hpVictim, hp);

  if (key === null) {
    return NIL;
  }

  const descriptor: IWoundedStateDescriptor = hpVictim.get(key);

  return descriptor.state
    ? tostring(pickSectionFromCondList(registry.actor, object, descriptor.state as TConditionList))
    : NIL;
}

/**
 * todo: Description.
 */
export function processFight(object: GameObject, hpFight: LuaArray<IWoundedStateDescriptor>, hp: TRate): string {
  const key: Optional<TIndex> = getStateIndexByHp(hpFight, hp);

  if (key === null) {
    return TRUE;
  }

  const descriptor: IWoundedStateDescriptor = hpFight.get(key);

  return descriptor.state ? tostring(pickSectionFromCondList(registry.actor, object, descriptor.state)) : TRUE;
}
