import { jest } from "@jest/globals";
import { TXR_class_id, XR_game_object } from "xray16";

/**
 * todo;
 */
export function mockClientGameObject({
  clsid = jest.fn(() => -1 as TXR_class_id),
  give_info_portion = jest.fn(() => false),
  disable_info_portion = jest.fn(() => false),
  has_info = jest.fn(() => false),
}: Partial<XR_game_object> = {}): XR_game_object {
  return {
    clsid,
    give_info_portion,
    disable_info_portion,
    has_info,
  } as unknown as XR_game_object;
}
