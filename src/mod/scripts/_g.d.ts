import { Definable } from "@/mod/lib/types";

/** ********************************************************************************************************************
 * _g namespace:
 * ********************************************************************************************************************/

declare global {
  const _G: Record<string, any>;

  /**
   * Registration logic.
   */
  let register: (factory: XR_object_factory) => void;
  let get_game_clsid: (game_type_option: any, is_server: boolean) => string;
  let get_ui_clsid: (game_type_option: string) => Definable<string>;
}
