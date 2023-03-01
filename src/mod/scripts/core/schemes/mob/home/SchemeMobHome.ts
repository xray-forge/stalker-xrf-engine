import { alife, patrol, XR_cse_alife_creature_abstract, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base/AbstractScheme";
import { getMobState, setMobState } from "@/mod/scripts/core/schemes/mob/MobStateManager";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import {
  cfg_get_switch_conditions,
  getConfigBoolean,
  getConfigNumber,
  getConfigString,
  IWaypointData,
  parse_waypoint_data,
} from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const def_min_radius: number = 10;
const def_mid_radius: number = 20;
const def_max_radius: number = 70;

const logger: LuaLogger = new LuaLogger("SchemeMobHome");

/**
 * todo;
 */
export class SchemeMobHome extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.MOB_HOME;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.MONSTER;

  public static override add_to_binder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    subscribeActionForEvents(object, storage, new SchemeMobHome(object, storage));
  }

  public static override set_scheme(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    gulag_name: string
  ): void {
    logger.info("Set scheme:", object.name(), scheme, section);

    const storage = assignStorageAndBind(object, ini, scheme, section);

    storage.logic = cfg_get_switch_conditions(ini, section, object);
    storage.state = getMobState(ini, section, object);
    storage.home = getConfigString(ini, section, "path_home", object, false, gulag_name, null);
    storage.gulag_point = getConfigBoolean(ini, section, "gulag_point", object, false, false);
    storage.home_min_radius = getConfigNumber(ini, section, "home_min_radius", object, false); // --, 20)
    storage.home_mid_radius = getConfigNumber(ini, section, "home_mid_radius", object, false); // --, 0)
    storage.home_max_radius = getConfigNumber(ini, section, "home_max_radius", object, false); // --, 40)
    storage.aggressive = getConfigBoolean(ini, section, "aggressive", object, false, false);
  }

  public override reset_scheme(): void {
    setMobState(this.object, registry.actor, this.state.state);

    let minr = def_min_radius;
    let maxr = def_max_radius;
    let midr = def_mid_radius;

    let ptr;
    let path_info: Partial<IWaypointData> = {};
    let r = 0;

    if (this.state.home !== null) {
      ptr = new patrol(this.state.home);
      path_info = parse_waypoint_data(this.state.home, ptr.flags(0), ptr.name(0));
    }

    if (this.state.home_min_radius !== null) {
      minr = this.state.home_min_radius;
    } else {
      r = path_info.minr;
      if (r !== null) {
        r = tonumber(r)!;
        if (r !== null) {
          minr = r;
        }
      }
    }

    if (this.state.home_max_radius !== null) {
      maxr = this.state.home_max_radius;
    } else {
      r = path_info.maxr;
      if (r !== null) {
        r = tonumber(r)!;
        if (r !== null) {
          maxr = r;
        }
      }
    }

    // -- check min and max radius
    if (minr > maxr) {
      abort("Mob_Home : Home Min Radius MUST be < Max Radius. Got: min radius = %d, max radius = %d.", minr, maxr);
    }

    if (this.state.home_mid_radius !== null) {
      midr = this.state.home_mid_radius;
      if (midr <= minr || midr >= maxr) {
        midr = minr + (maxr - minr) / 2;
      }
    } else {
      midr = minr + (maxr - minr) / 2;
    }

    if (this.state.gulag_point !== null) {
      const smrttrn = alife().object(
        alife().object<XR_cse_alife_creature_abstract>(this.object.id())!.m_smart_terrain_id
      );
      const lvid = smrttrn ? smrttrn.m_level_vertex_id : null;

      this.object.set_home(lvid, minr, maxr, this.state.aggressive, midr);
    } else {
      this.object.set_home(this.state.home, minr, maxr, this.state.aggressive, midr);
    }

    // --this.object.set_home(this.state.home, minr, maxr, this.state.aggressive)
  }

  public override deactivate(): void {
    this.object.remove_home();
  }
}
