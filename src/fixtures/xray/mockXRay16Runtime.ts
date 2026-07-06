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
// `game`/`level` are NOT migrated to the package yet — source them from the SAME engine mocks the
// `mockXRay16()` factory uses, so a test spying on `level.get_time_hours` affects the instance the built
// `xray16/lib` reads via `require("xray16")`. Sourcing them from `xray16/mocks` (a different instance)
// silently breaks time-of-day logic in the lib.
export { mockGameInterface as game, mockLevelInterface as level } from "@/fixtures/xray/mocks/interface";

export const GetFontLetterica16Russian = jest.fn(() => new MockCGameFont());
export const device = jest.fn(() => MockDevice.getInstance());
export const time_global = jest.fn(() => Date.now());
export const verify_if_thread_is_running = jest.fn((): void => {});
