import { environmentConfig } from "../lib";

export const a: number = 1 + 4;
export const b: string = String(environmentConfig.IS_DEBUG) + "s";
