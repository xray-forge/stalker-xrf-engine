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
  // Whether net spawn event was triggered recently and should be handled.
  public isNetSpawnToggled: boolean = false;

  public override net_spawn(serverObject: ServerObject): boolean {
    if (!super.net_spawn(serverObject)) {
      return false;
    }

    logger.info("Go online:", this.object.name());

    registerObject(this.object);

    const objectId: TNumberId = this.object.id();
    const artefact: CArtefact = this.object.get_artefact();

    if (registry.artefacts.ways.has(objectId)) {
      const anomalyZone: AnomalyZoneBinder = registry.artefacts.parentZones.get(objectId);
      const forceXZ: TRate = anomalyZone.applyingForceXZ;
      const forceY: TRate = anomalyZone.applyingForceY;

      artefact.FollowByPath(
        registry.artefacts.ways.get(objectId),
        registry.artefacts.points.get(objectId),
        createVector(forceXZ, forceY, forceXZ)
      );
    }

    this.isNetSpawnToggled = true;

    return true;
  }

  public override net_destroy(): void {
    logger.info("Go offline:", this.object.name());

    unregisterObject(this.object);
    super.net_destroy();
  }

  public override update(delta: TDuration): void {
    super.update(delta);

    // todo: Move to net spawn instead of overloading of update tick?
    // todo: Move to net spawn instead of overloading of update tick?
    // todo: Move to net spawn instead of overloading of update tick?
    if (this.isNetSpawnToggled) {
      this.isNetSpawnToggled = false;

      const ini: Optional<IniFile> = this.object.spawn_ini();
      const shell: Optional<PhysicsShell> =
        ini && ini.section_exist("fixed_bone") ? this.object.get_physics_shell() : null;

      if (shell) {
        const element: PhysicsElement = shell.get_element_by_bone_name(ini.r_string("fixed_bone", "name"));

        if (!element.is_fixed()) {
          element.fix();
        }
      }
    }
  }
}
