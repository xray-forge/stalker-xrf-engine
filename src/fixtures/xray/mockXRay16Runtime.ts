import { jest } from "@jest/globals";

/**
 * Runtime resolution target for the bare `xray16` module under jest (wired via `moduleNameMapper`).
 */
export { MockVector as vector, MockVector2D as vector2 } from "xray16/mocks";
export { mockGameInterface as game, mockLevelInterface as level } from "@/fixtures/xray/mocks/interface";

export const time_global = jest.fn(() => Date.now());
export const verify_if_thread_is_running = jest.fn((): void => {});
