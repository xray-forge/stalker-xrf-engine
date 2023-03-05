import {
  LuabindClass,
  object_binder,
  vector,
  XR_CArtefact,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_physics_element,
  XR_physics_shell,
} from "xray16";

import { Optional, TDuration } from "@/mod/lib/types";
import { AnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { addObject, deleteObject, registry } from "@/mod/scripts/core/database";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("ArtefactBinder");
const UPDATE_THROTTLE: number = 1_000;

/**
 * todo;
 */
@LuabindClass()
export class ArtefactBinder extends object_binder {
  public delta: number = UPDATE_THROTTLE;
  public isInitializing: boolean = false;

  /**
   * todo;
   */
  public constructor(object: XR_game_object) {
    super(object);
  }

  /**
   * todo;
   */
  public override net_spawn(object: XR_cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Spawn artefact to network");

    addObject(this.object);

    const artefact: XR_CArtefact = this.object.get_artefact();
    const id: number = this.object.id();

    if (registry.artefacts.ways.get(id) !== null) {
      const anomalyZone: AnomalyZoneBinder = registry.artefacts.parentZones.get(id);
      const forceXZ: number = anomalyZone.applyingForceXZ;
      const forceY: number = anomalyZone.applyingForceY;

      artefact.FollowByPath(
        registry.artefacts.ways.get(id),
        registry.artefacts.points.get(id),
        new vector().set(forceXZ, forceY, forceXZ)
      );
    }

    this.isInitializing = true;

    return true;
  }

  /**
   * todo;
   */
  public override net_destroy(): void {
    deleteObject(this.object);
    super.net_destroy();
  }

  /**
   * todo;
   */
  public override update(delta: TDuration): void {
    this.delta += delta;

    if (this.delta >= UPDATE_THROTTLE) {
      super.update(this.delta);

      this.delta = 0;
    } else {
      return;
    }

    if (this.isInitializing) {
      const ini: Optional<XR_ini_file> = this.object.spawn_ini();

      if (!ini?.section_exist("fixed_bone")) {
        return;
      }

      const boneName: string = ini.r_string("fixed_bone", "name");

      const physicsShell: Optional<XR_physics_shell> = this.object.get_physics_shell();

      if (!physicsShell) {
        return;
      }

      const physicsElement: XR_physics_element = physicsShell.get_element_by_bone_name(boneName);

      if (!physicsElement.is_fixed()) {
        physicsElement.fix();
      }

      this.isInitializing = false;
    }
  }
}
