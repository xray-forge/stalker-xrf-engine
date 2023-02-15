import { patrol, time_global, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { getActor, IStoredObject } from "@/mod/scripts/core/db";
import { AbstractSchemeImplementation } from "@/mod/scripts/core/logic/AbstractSchemeImplementation";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { cfg_get_switch_conditions, getConfigNumber, getConfigString } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ActionApplyPhysicalForce");

export class ActionApplyPhysicalForce extends AbstractSchemeImplementation {
  public static readonly SCHEME_SECTION: EScheme = EScheme.PH_FORCE;
  public static readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static add_to_binder(
    npc: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", npc.name());

    subscribeActionForEvents(npc, storage, new ActionApplyPhysicalForce(npc, storage));
  }

  public static set_scheme(npc: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set scheme:", npc.name());

    const st = assignStorageAndBind(npc, ini, scheme, section);

    st.logic = cfg_get_switch_conditions(ini, section, npc);
    st.force = getConfigNumber(ini, section, "force", npc, true, 0);
    st.time = getConfigNumber(ini, section, "time", npc, true, 0);
    st.delay = getConfigNumber(ini, section, "delay", npc, false, 0);

    const path_name = getConfigString(ini, section, "point", npc, true, "");
    const index = getConfigNumber(ini, section, "point_index", npc, false, 0);

    if (st.force === null || st.force <= 0) {
      abort("PH_FORCE : invalid force !");
    }

    if (st.time === null || st.time <= 0) {
      abort("PH_FORCE : invalid time !");
    }

    if (path_name === null || path_name === "") {
      abort("PH_FORCE : invalid waypoint name !");
    }

    const path = new patrol(path_name);

    if (index >= path.count()) {
      abort("PH_FORCE : invalid waypoint index.ts !");
    }

    st.point = path.point(index);
  }

  public time: number;
  public process: boolean;

  public constructor(object: XR_game_object, storage: IStoredObject) {
    super(object, storage);
    this.time = 0;
    this.process = false;
  }

  public reset_scheme(): void {
    if (this.state.delay !== 0) {
      this.time = time_global() + this.state.delay;
    }

    this.process = false;
  }

  public update(delta: number): void {
    if (trySwitchToAnotherSection(this.object, this.state, getActor())) {
      return;
    }

    if (this.process === true) {
      return;
    }

    if (this.state.delay !== null) {
      if (time_global() - this.time < 0) {
        return;
      }
    }

    const dir = this.state.point.sub(this.object.position());

    dir.normalize();
    this.object.set_const_force(dir, this.state.force, this.state.time);
    this.process = true;
  }
}
