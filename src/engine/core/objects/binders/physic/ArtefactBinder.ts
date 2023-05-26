import {
  CArtefact,
  cse_alife_object,
  ini_file,
  LuabindClass,
  object_binder,
  physics_element,
  physics_shell,
  vector,
} from "xray16";

import { registerObject, registry, unregisterObject } from "@/engine/core/database";
import { AnomalyZoneBinder } from "@/engine/core/objects/binders/zones/AnomalyZoneBinder";
import { LuaLogger } from "@/engine/core/utils/logging";
import { Optional, TDuration, TNumberId, TRate } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * todo;
 */
@LuabindClass()
export class ArtefactBinder extends object_binder {
  public isInitializing: boolean = false;

  public override net_spawn(object: cse_alife_object): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Spawn artefact to network");

    registerObject(this.object);

    const artefact: CArtefact = this.object.get_artefact();
    const id: TNumberId = this.object.id();

    if (registry.artefacts.ways.get(id) !== null) {
      const anomalyZone: AnomalyZoneBinder = registry.artefacts.parentZones.get(id);
      const forceXZ: TRate = anomalyZone.applyingForceXZ;
      const forceY: TRate = anomalyZone.applyingForceY;

      artefact.FollowByPath(
        registry.artefacts.ways.get(id),
        registry.artefacts.points.get(id),
        new vector().set(forceXZ, forceY, forceXZ)
      );
    }

    this.isInitializing = true;

    return true;
  }

  public override net_destroy(): void {
    unregisterObject(this.object);
    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    if (this.isInitializing) {
      const ini: Optional<ini_file> = this.object.spawn_ini();

      if (!ini?.section_exist("fixed_bone")) {
        return;
      }

      const boneName: string = ini.r_string("fixed_bone", "name");

      const physicsShell: Optional<physics_shell> = this.object.get_physics_shell();

      if (!physicsShell) {
        return;
      }

      const physicsElement: physics_element = physicsShell.get_element_by_bone_name(boneName);

      if (!physicsElement.is_fixed()) {
        physicsElement.fix();
      }

      this.isInitializing = false;
    }
  }
}
