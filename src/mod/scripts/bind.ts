import { alife, clsid, XR_game_object, XR_ini_file } from "xray16";

import { Optional } from "@/mod/lib/types";
import {
  ActorBinder,
  AnomalyFieldBinder,
  AnomalyZoneBinder,
  ArenaZoneBinder,
  ArtefactBinder,
  CampBinder,
  CampfireBinder,
  CrowBinder,
  HelicopterBinder,
  LabX8DoorBinder,
  LevelChangerBinder,
  MonsterBinder,
  PhantomBinder,
  PhysicObjectBinder,
  RestrictorBinder,
  SignalLightBinder,
  SmartCoverBinder,
  SmartTerrainBinder,
  StalkerBinder,
} from "@/mod/scripts/core/objects/binders";
import { abort } from "@/mod/scripts/utils/debug";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const logger: LuaLogger = new LuaLogger($filename);

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
      object.bind_object(new HelicopterBinder(object, ini));
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
