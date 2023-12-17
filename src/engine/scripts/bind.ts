import { clsid } from "xray16";

import { ActorBinder, CrowBinder, MonsterBinder, StalkerBinder } from "@/engine/core/binders/creature";
import { HelicopterBinder } from "@/engine/core/binders/helicopter";
import { HelmetBinder, OutfitBinder, WeaponBinder } from "@/engine/core/binders/item";
import {
  ArtefactBinder,
  CampfireBinder,
  LabX8DoorBinder,
  PhantomBinder,
  PhysicObjectBinder,
  SignalLightBinder,
} from "@/engine/core/binders/physic";
import { SmartCoverBinder } from "@/engine/core/binders/smart_cover";
import { SmartTerrainBinder } from "@/engine/core/binders/smart_terrain";
import {
  AnomalyFieldBinder,
  AnomalyZoneBinder,
  ArenaZoneBinder,
  CampZoneBinder,
  LevelChangerBinder,
  RestrictorBinder,
} from "@/engine/core/binders/zones";
import { extern } from "@/engine/core/utils/binding";
import { LuaLogger } from "@/engine/core/utils/logging";
import { GameObject, IniFile, Optional } from "@/engine/lib/types";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Register binders of engine client side objects.
 */
extern("bind", {
  actor: (object: GameObject) => object.bind_object(new ActorBinder(object)),
  anomalyField: (object: GameObject) => object.bind_object(new AnomalyFieldBinder(object)),
  anomalyZone: (object: GameObject) => object.bind_object(new AnomalyZoneBinder(object)),
  arenaZone: (object: GameObject) => {
    if (object.spawn_ini()?.section_exist("arena_zone")) {
      object.bind_object(new ArenaZoneBinder(object));
    }
  },
  artefact: (object: GameObject) => object.bind_object(new ArtefactBinder(object)),
  camp: (object: GameObject) => object.bind_object(new CampZoneBinder(object)),
  campfire: (object: GameObject) => object.bind_object(new CampfireBinder(object)),
  crow: (object: GameObject) => object.bind_object(new CrowBinder(object)),
  // todo: Rename to full name 'helicopter'.
  heli: (object: GameObject) => {
    const ini: Optional<IniFile> = object.spawn_ini();

    if (ini?.section_exist("logic")) {
      object.bind_object(new HelicopterBinder(object, ini));
    }
  },
  // todo: Rename to full name 'doorBinder' / 'door'.
  labX8Door: (object: GameObject) => object.bind_object(new LabX8DoorBinder(object)),
  levelChanger: (object: GameObject) => object.bind_object(new LevelChangerBinder(object)),
  monster: (object: GameObject) => object.bind_object(new MonsterBinder(object)),
  phantom: (object: GameObject) => object.bind_object(new PhantomBinder(object)),
  physicObject: (object: GameObject) => {
    if (object.spawn_ini()?.section_exist("logic") || object.clsid() === clsid.inventory_box) {
      object.bind_object(new PhysicObjectBinder(object));
    }
  },
  weapon: (object: GameObject) => object.bind_object(new WeaponBinder(object)),
  outfit: (object: GameObject) => object.bind_object(new OutfitBinder(object)),
  helmet: (object: GameObject) => object.bind_object(new HelmetBinder(object)),
  restrictor: (object: GameObject) => object.bind_object(new RestrictorBinder(object)),
  signalLight: (object: GameObject) => object.bind_object(new SignalLightBinder(object)),
  smartCover: (object: GameObject) => object.bind_object(new SmartCoverBinder(object)),
  smartTerrain: (object: GameObject) => {
    if (object.spawn_ini()?.section_exist("smart_terrain")) {
      object.bind_object(new SmartTerrainBinder(object));
    }
  },
  stalker: (object: GameObject) => object.bind_object(new StalkerBinder(object)),
});
