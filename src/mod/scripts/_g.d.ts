import { XR_object_factory } from "xray16";

import { Definable } from "@/mod/lib/types";

/** ********************************************************************************************************************
 * _g namespace:
 * ********************************************************************************************************************/

declare global {
  let register: (factory: XR_object_factory) => void;
  let get_game_clsid: (game_type_option: any, is_server: boolean) => string;
  let get_ui_clsid: (game_type_option: string) => Definable<string>;
}
