import { patrol, time_global, XR_game_object, XR_ini_file } from "xray16";

import { EScheme, ESchemeType, TSection } from "@/mod/lib/types";
import { IStoredObject, registry } from "@/mod/scripts/core/database";
import { assignStorageAndBind } from "@/mod/scripts/core/schemes/assignStorageAndBind";
import { AbstractScheme } from "@/mod/scripts/core/schemes/base";
import { subscribeActionForEvents } from "@/mod/scripts/core/schemes/subscribeActionForEvents";
import { trySwitchToAnotherSection } from "@/mod/scripts/core/schemes/trySwitchToAnotherSection";
import { getConfigNumber, getConfigString, getConfigSwitchConditions } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("SchemePhysicalForce");

/**
 * todo;
 */
export class SchemePhysicalForce extends AbstractScheme {
  public static override readonly SCHEME_SECTION: EScheme = EScheme.PH_FORCE;
  public static override readonly SCHEME_TYPE: ESchemeType = ESchemeType.ITEM;

  public static override addToBinder(
    object: XR_game_object,
    ini: XR_ini_file,
    scheme: EScheme,
    section: TSection,
    storage: IStoredObject
  ): void {
    logger.info("Add to binder:", object.name());

    subscribeActionForEvents(object, storage, new SchemePhysicalForce(object, storage));
  }

  public static override setScheme(object: XR_game_object, ini: XR_ini_file, scheme: EScheme, section: TSection): void {
    logger.info("Set scheme:", object.name());

    const st = assignStorageAndBind(object, ini, scheme, section);

    st.logic = getConfigSwitchConditions(ini, section, object);
    st.force = getConfigNumber(ini, section, "force", object, true, 0);
    st.time = getConfigNumber(ini, section, "time", object, true, 0);
    st.delay = getConfigNumber(ini, section, "delay", object, false, 0);

    const path_name = getConfigString(ini, section, "point", object, true, "");
    const index = getConfigNumber(ini, section, "point_index", object, false, 0);

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

  public override resetScheme(): void {
    if (this.state.delay !== 0) {
      this.time = time_global() + this.state.delay;
    }

    this.process = false;
  }

  public override update(delta: number): void {
    if (trySwitchToAnotherSection(this.object, this.state, registry.actor)) {
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
