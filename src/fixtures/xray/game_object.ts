import { jest } from "@jest/globals";
import { XR_game_object } from "xray16";

/**
 * todo;
 */
export function mockClientGameObject({
  give_info_portion = jest.fn(() => false),
  disable_info_portion = jest.fn(() => false),
  has_info = jest.fn(() => false),
}: Partial<XR_game_object> = {}): XR_game_object {
  return {
    give_info_portion,
    disable_info_portion,
    has_info,
  } as unknown as XR_game_object;
}
