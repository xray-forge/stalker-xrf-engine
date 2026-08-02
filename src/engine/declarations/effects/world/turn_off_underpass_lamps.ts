import { GameObject } from "xray16/alias";
import { extern, Nillable, TStringId } from "xray16/lib";
import { $filename } from "xray16/macros";

import { getObjectByStoryId } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";

export const logger: LuaLogger = new LuaLogger($filename);

/**
 * Turn off the hanging lamps of all predefined Pripyat underpass lamp objects.
 *
 * @param actor - Actor game object initiating the effect.
 * @param object - Game object owning the logics scheme.
 */
extern("xr_effects.turn_off_underpass_lamps", (_: GameObject, __: GameObject): void => {
  const lampsList: Array<TStringId> = [
    "pas_b400_lamp_start_flash",
    "pas_b400_lamp_start_red",
    "pas_b400_lamp_elevator_green",
    "pas_b400_lamp_elevator_flash",
    "pas_b400_lamp_elevator_green_1",
    "pas_b400_lamp_elevator_flash_1",
    "pas_b400_lamp_track_green",
    "pas_b400_lamp_track_flash",
    "pas_b400_lamp_downstairs_green",
    "pas_b400_lamp_downstairs_flash",
    "pas_b400_lamp_tunnel_green",
    "pas_b400_lamp_tunnel_flash",
    "pas_b400_lamp_tunnel_green_1",
    "pas_b400_lamp_tunnel_flash_1",
    "pas_b400_lamp_control_down_green",
    "pas_b400_lamp_control_down_flash",
    "pas_b400_lamp_control_up_green",
    "pas_b400_lamp_control_up_flash",
    "pas_b400_lamp_hall_green",
    "pas_b400_lamp_hall_flash",
    "pas_b400_lamp_way_green",
    "pas_b400_lamp_way_flash",
  ];

  for (const storyId of lampsList) {
    const object: Nillable<GameObject> = getObjectByStoryId(storyId);

    if (object) {
      object.get_hanging_lamp().turn_off();
    } else {
      logger.info("function 'turn_off_underpass_lamps' lamp [%s] does ! exist", storyId);
    }
  }
});
