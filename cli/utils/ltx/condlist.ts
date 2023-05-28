import { IConditionListDescriptor } from "#/utils/ltx/types";

/**
 * todo;
 */
export function joinCondlists(...conditionLists: Array<string>): string {
  return conditionLists.join(", ");
}

/**
 * todo;
 */
export function createCondlist(descriptor?: IConditionListDescriptor | boolean): string {
  if (
    descriptor === true ||
    !descriptor ||
    (!descriptor.condition && !descriptor.action && descriptor.value === undefined)
  ) {
    return String(true);
  }

  const value: unknown = descriptor.value === null ? "nil" : descriptor.value;

  let condlist: string = "";

  condlist += descriptor.condition ? `{${descriptor.condition.join(" ")}}` : "";
  condlist += value !== undefined ? (condlist ? " " : "") + value : "";
  condlist += descriptor.action ? (condlist ? " " : "") + `%${descriptor.action.join(" ")}%` : "";

  return condlist;
}

/**
 * todo;
 */
export function checkCondition(functionName: string, ...params: Array<string | boolean | number>): string {
  return `=${functionName}` + (params.length ? `(${params.join(":")})` : "");
}

/**
 * todo;
 */
export function checkNoCondition(functionName: string, ...params: Array<string | boolean | number>): string {
  return `!${functionName}` + (params.length ? `(${params.join(":")})` : "");
}

/**
 * todo;
 */
export function checkChance(chance: number): string {
  if (chance <= 0 || chance >= 100) {
    throw new Error(`Expected chance to be in 0-100 range, got '${chance}'.`);
  }

  return `~${chance}`;
}

/**
 * todo;
 */
export function checkHasInfo(info: string): string {
  return `+${info}`;
}

/**
 * todo;
 */
export function checkNoInfo(info: string): string {
  return `-${info}`;
}

/**
 * todo;
 */
export function addInfo(info: string): string {
  return `+${info}`;
}

/**
 * todo;
 */
export function removeInfo(info: string): string {
  return `-${info}`;
}

/**
 * todo;
 */
export function callEffect(functionName: string, ...params: Array<string>): string {
  return `=${functionName}` + (params.length ? `(${params.join(":")})` : "");
}
