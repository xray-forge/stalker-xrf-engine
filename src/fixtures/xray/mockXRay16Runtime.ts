import { jest } from "@jest/globals";
import { MockCGameFont, MockDevice } from "xray16/mocks";

/**
 * Runtime resolution target for the bare `xray16` module under jest (wired via `moduleNameMapper`).
 */
export {
  MockAnim as anim,
  MockCGameFont as CGameFont,
  MockCSightParams as CSightParams,
  MockCTime as CTime,
  MockColor as color,
  MockCond as cond,
  MockEffector as effector,
  MockEntityAction as entity_action,
  MockFbox as Fbox,
  MockFrect as Frect,
  MockHit as hit,
  MockLook as look,
  MockNoise as noise,
  MockObject as object,
  MockPropertiesHelper as properties_helper,
  MockSound as sound,
  MockVector as vector,
  MockVector2D as vector2,
  mockActorStatsInterface as actor_stats,
  mockCommandLine as command_line,
  mockGetARGB as GetARGB,
} from "xray16/mocks";

export { mockGameInterface as game, mockLevelInterface as level } from "xray16/mocks";

export const GetFontLetterica16Russian = jest.fn(() => new MockCGameFont());
export const device = jest.fn(() => MockDevice.getInstance());
export const time_global = jest.fn(() => Date.now());
export const verify_if_thread_is_running = jest.fn((): void => {});
