import { alife, clsid, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import { ActorBinder } from "@/mod/scripts/core/binders/ActorBinder";
import { AnomalyFieldBinder } from "@/mod/scripts/core/binders/AnomalyFieldBinder";
import { AnomalyZoneBinder } from "@/mod/scripts/core/binders/AnomalyZoneBinder";
import { ArenaZoneBinder } from "@/mod/scripts/core/binders/ArenaZoneBinder";
import { ArtefactBinder } from "@/mod/scripts/core/binders/ArtefactBinder";
import { CampBinder } from "@/mod/scripts/core/binders/CampBinder";
import { CampfireBinder } from "@/mod/scripts/core/binders/CampfireBinder";
import { CrowBinder } from "@/mod/scripts/core/binders/CrowBinder";
import { HeliBinder } from "@/mod/scripts/core/binders/HeliBinder";
import { LabX8DoorBinder } from "@/mod/scripts/core/binders/LabX8DoorBinder";
import { LevelChangerBinder } from "@/mod/scripts/core/binders/LevelChangerBinder";
import { MonsterBinder } from "@/mod/scripts/core/binders/MonsterBinder";
import { PhantomBinder } from "@/mod/scripts/core/binders/PhantomBinder";
import { PhysicObjectBinder } from "@/mod/scripts/core/binders/PhysicObjectBinder";
import { RestrictorBinder } from "@/mod/scripts/core/binders/RestrictorBinder";
import { SignalLightBinder } from "@/mod/scripts/core/binders/SignalLightBinder";
import { SmartCoverBinder } from "@/mod/scripts/core/binders/SmartCoverBinder";
import { SmartTerrainBinder } from "@/mod/scripts/core/binders/SmartTerrainBinder";
import { StalkerBinder } from "@/mod/scripts/core/binders/StalkerBinder";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger("_bindings");

// @ts-ignore, declare lua global
list = {
  bindActor: (object: XR_game_object) => object.bind_object(new ActorBinder(object)),
  bindAnomalyField: (object: XR_game_object) => object.bind_object(new AnomalyFieldBinder(object)),
  bindAnomalyZone: (object: XR_game_object) => object.bind_object(new AnomalyZoneBinder(object)),
  bindArenaZone: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (ini !== null && ini.section_exist("arena_zone") && alife() !== null) {
      object.bind_object(new ArenaZoneBinder(object));
    }
  },
  bindArtefact: (object: XR_game_object) => object.bind_object(new ArtefactBinder(object)),
  bindCamp: (object: XR_game_object) => object.bind_object(new CampBinder(object)),
  bindCampfire: (object: XR_game_object) => object.bind_object(new CampfireBinder(object)),
  bindCrow: (object: XR_game_object) => object.bind_object(new CrowBinder(object)),
  bindHeli: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (ini !== null && ini.section_exist("logic")) {
      object.bind_object(new HeliBinder(object, ini));
    }
  },
  bindLabX8Door: (object: XR_game_object) => object.bind_object(new LabX8DoorBinder(object)),
  bindLevelChanger: (object: XR_game_object) => object.bind_object(new LevelChangerBinder(object)),
  bindMonster: (object: XR_game_object) => object.bind_object(new MonsterBinder(object)),
  bindPhantom: (object: XR_game_object) => object.bind_object(new PhantomBinder(object)),
  bindPhysicObject: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (!ini?.section_exist("logic")) {
      if (object.clsid() !== clsid.inventory_box) {
        return;
      }
    }

    object.bind_object(new PhysicObjectBinder(object));
  },
  bindRestrictor: (object: XR_game_object) => object.bind_object(new RestrictorBinder(object)),
  bindSignalLight: (object: XR_game_object) => object.bind_object(new SignalLightBinder(object)),
  bindSmartCover: (object: XR_game_object) => object.bind_object(new SmartCoverBinder(object)),
  bindSmartTerrain: (object: XR_game_object) => {
    const ini: Optional<XR_ini_file> = object.spawn_ini();

    if (ini !== null && (ini.section_exist("gulag1") || ini.section_exist("smart_terrain"))) {
      if (object.clsid() === clsid.smart_terrain) {
        if (alife() !== null) {
          object.bind_object(new SmartTerrainBinder(object));
        } else {
          logger.info("No simulation, smart terrain will not be enabled:", object.name());
        }
      } else {
        abort("You must use SMART_TERRAIN instead of SCRIPT_ZONE %s", object.name());
      }
    }
  },
  bindStalker: (object: XR_game_object) => object.bind_object(new StalkerBinder(object)),
};
