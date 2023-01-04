import {
  XR_CArtefact,
  XR_cse_alife_object,
  XR_game_object,
  XR_ini_file,
  XR_object_binder,
  XR_physics_element,
  XR_physics_shell,
  object_binder,
  vector
} from "xray16";

import { Optional } from "@/mod/lib/types";
import {
  ARTEFACT_POINTS_BY_ARTEFACT_ID,
  ARTEFACT_WAYS_BY_ARTEFACT_ID,
  IAnomalyZoneBinder,
  PARENT_ZONES_BY_ARTEFACT_ID
} from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { addObject, deleteObject, storage } from "@/mod/scripts/core/db";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("core/binders/ArtefactBinder");
const UPDATE_THROTTLE: number = 1_000;

export interface IArtefactBinder extends XR_object_binder {
  isInitializing: boolean;
  delta: number;
}

export const ArtefactBinder: IArtefactBinder = declare_xr_class("ArtefactBinder", object_binder, {
  delta: UPDATE_THROTTLE,
  __init(object: XR_game_object): void {
    log.info("Init:", object.name());

    xr_class_super(object);
    storage.set(object.id(), {});
  },
  net_spawn(object: XR_cse_alife_object): boolean {
    if (!object_binder.net_spawn(this, object)) {
      return false;
    }

    log.info("Spawn artefact to network");

    addObject(this.object);

    const artefact: XR_CArtefact = this.object.get_artefact();
    const id: number = this.object.id();

    if (ARTEFACT_WAYS_BY_ARTEFACT_ID.get(id) !== null) {
      const anomalyZone: IAnomalyZoneBinder = PARENT_ZONES_BY_ARTEFACT_ID.get(id);
      const forceXZ: number = anomalyZone.applyingForceXZ;
      const forceY: number = anomalyZone.applyingForceY;

      artefact.FollowByPath(
        ARTEFACT_WAYS_BY_ARTEFACT_ID.get(id),
        ARTEFACT_POINTS_BY_ARTEFACT_ID.get(id),
        new vector().set(forceXZ, forceY, forceXZ)
      );
    }

    this.isInitializing = true;

    return true;
  },
  net_destroy(): void {
    deleteObject(this.object);
    object_binder.net_destroy(this);
  },
  update(delta: number): void {
    this.delta += delta;

    if (this.delta >= UPDATE_THROTTLE) {
      object_binder.update(this, this.delta);

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

      const physicsShell: XR_physics_shell = this.object.get_physics_shell();

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
} as IArtefactBinder);
