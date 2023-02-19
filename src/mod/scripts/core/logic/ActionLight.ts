import { level, XR_game_object, XR_ini_file } from "xray16";

import { misc } from "@/mod/globals/items/misc";
import { Optional } from "@/mod/lib/types";
import { EScheme, ESchemeType, TSection } from "@/mod/lib/types/scheme";
import { getActor, IStoredObject, light_zones, storage } from "@/mod/scripts/core/db";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { isUndergroundLevel } from "@/mod/scripts/utils/checkers/is";
import { cfg_get_switch_conditions, getConfigBoolean } from "@/mod/scripts/utils/configs";
import { LuaLogger } from "@/mod/scripts/utils/logging";
import { resetTable } from "@/mod/scripts/utils/table";

const logger: LuaLogger = new LuaLogger("ActionLight");

/**
 * todo;
 * Class managing torches used by stalkers during night hours / in underground levels.
 */
export class ActionLight extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.SR_LIGHT;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.RESTRICTOR;

  public static add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    state: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    subscribeActionForEvents(object, state, new ActionLight(object, state));
  }

  public static set_scheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    const state = assignStorageAndBind(object, ini, scheme, section);

    state.logic = cfg_get_switch_conditions(ini, section, object);
    state.light = getConfigBoolean(ini, section, "light_on", object, false, false);
  }

  public static resetScheme(): void {
    logger.info("Reset");
    resetTable(light_zones);
  }

  public static check_light(object: XR_game_object): void {
    if (object === null) {
      return;
    }

    const torch: Optional<XR_game_object> = object.object(misc.device_torch);
    const isCurrentlyIndoor: boolean = isUndergroundLevel(level.name());

    if (torch === null) {
      return;
    }

    let light = false;
    let forced = false;

    /*
      if (benchmark.light) {
        light = true;
        forced = true;
      }
     */

    if (!object.alive()) {
      light = false;
      forced = true;
    }

    if (!forced) {
      for (const [k, v] of light_zones) {
        [light, forced] = v.check_stalker(object);

        if (forced === true) {
          break;
        }
      }
    }

    if (!forced) {
      const htime = level.get_time_hours();

      if (htime <= 4 || htime >= 22) {
        light = true;
      }

      if (light === false) {
        if (isCurrentlyIndoor) {
          light = true;
        }
      }
    }

    if (!forced && light === true) {
      const scheme = storage.get(object.id()).active_scheme!;

      if (scheme === "kamp" || scheme === "camper" || scheme === "sleeper") {
        light = false;
        forced = true;
      }
    }

    if (!forced && light) {
      if (object.best_enemy() !== null && !isCurrentlyIndoor) {
        light = false;
      }
    }

    if (light !== null) {
      torch.enable_attachable_item(light);
    }
  }

  public active: boolean;

  public constructor(object: XR_game_object, state: IStoredObject) {
    super(object, state);

    this.active = false;
  }

  public reset_scheme(): void {
    logger.info("Reset scheme:", this.object.id());
    light_zones.set(this.object.id(), this);
  }

  public update(delta: number): void {
    if (trySwitchToAnotherSection(this.object, this.state, getActor())) {
      this.active = false;

      light_zones.delete(this.object.id());

      return;
    }

    this.active = true;
  }

  public check_stalker(object: XR_game_object): LuaMultiReturn<[boolean, boolean]> {
    if (this.active === false) {
      return $multi(false, false);
    }

    if (this.object.inside(object.position())) {
      return $multi(this.state.light!, true);
    }

    return $multi(false, false);
  }
}
