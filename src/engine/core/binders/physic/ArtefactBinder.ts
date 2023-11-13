import { CArtefact, LuabindClass, object_binder } from "xray16";

import { AnomalyZoneBinder } from "@/engine/core/binders/zones/AnomalyZoneBinder";
import { registerObject, registry, unregisterObject } from "@/engine/core/database";
import { LuaLogger } from "@/engine/core/utils/logging";
import { createVector } from "@/engine/core/utils/vector";
import {
  IniFile,
  Optional,
  PhysicsElement,
  PhysicsShell,
  ServerObject,
  TDuration,
  TNumberId,
  TRate,
} from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Binder of artefact game objects logics.
 */
@LuabindClass()
export class ArtefactBinder extends object_binder {
  public isInitializing: boolean = false;

  public override net_spawn(object: ServerObject): boolean {
    if (!super.net_spawn(object)) {
      return false;
    }

    logger.info("Spawn artefact to network");

    registerObject(this.object);

    const artefact: CArtefact = this.object.get_artefact();
    const id: TNumberId = this.object.id();

    if (registry.artefacts.ways.has(id)) {
      const anomalyZone: AnomalyZoneBinder = registry.artefacts.parentZones.get(id);
      const forceXZ: TRate = anomalyZone.applyingForceXZ;
      const forceY: TRate = anomalyZone.applyingForceY;

      artefact.FollowByPath(
        registry.artefacts.ways.get(id),
        registry.artefacts.points.get(id),
        createVector(forceXZ, forceY, forceXZ)
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
      const ini: Optional<IniFile> = this.object.spawn_ini();

      if (!ini?.section_exist("fixed_bone")) {
        return;
      }

      const physicsShell: Optional<PhysicsShell> = this.object.get_physics_shell();

      if (!physicsShell) {
        return;
      }

      const physicsElement: PhysicsElement = physicsShell.get_element_by_bone_name(ini.r_string("fixed_bone", "name"));

      if (!physicsElement.is_fixed()) {
        physicsElement.fix();
      }

      this.isInitializing = false;
    }
  }
}
