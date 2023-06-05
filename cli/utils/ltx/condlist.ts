import { IConditionListDescriptor } from "#/utils/ltx/types";

/**
 * Join array of condlists and render them to string.
 */
export function joinCondlists(...conditionLists: Array<string>): string {
  return conditionLists.join(", ");
}

/**
 * Create condlist string from provided descriptor.
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
 * Create condlist condition check string part.
 */
export function checkCondition(functionName: string, ...params: Array<string | boolean | number>): string {
  return `=${functionName}` + (params.length ? `(${params.join(":")})` : "");
}

/**
 * Create condlist no condition check string part.
 */
export function checkNoCondition(functionName: string, ...params: Array<string | boolean | number>): string {
  return `!${functionName}` + (params.length ? `(${params.join(":")})` : "");
}

/**
 * Create condlist chance check string part.
 */
export function checkChance(chance: number): string {
  if (chance <= 0 || chance >= 100) {
    throw new Error(`Expected chance to be in 0-100 range, got '${chance}'.`);
  }

  return `~${chance}`;
}

/**
 * Create condlist info check string part.
 */
export function checkHasInfo(info: string): string {
  return `+${info}`;
}

/**
 * Create condlist no info check string part.
 */
export function checkNoInfo(info: string): string {
  return `-${info}`;
}

/**
 * Create condlist info addition effect string part.
 */
export function addInfo(info: string): string {
  return `+${info}`;
}

/**
 * Create condlist info removal effect string part.
 */
export function removeInfo(info: string): string {
  return `-${info}`;
}

/**
 * Create condlist effect call string part.
 */
export function callEffect(functionName: string, ...params: Array<string>): string {
  return `=${functionName}` + (params.length ? `(${params.join(":")})` : "");
}
