import { ActorBinder, CrowBinder, MonsterBinder, StalkerBinder } from "@/engine/core/binders/creature";
import { HelicopterBinder } from "@/engine/core/binders/helicopter";
import { HelmetBinder, OutfitBinder, WeaponBinder } from "@/engine/core/binders/item";
import {
  ArtefactBinder,
  CampfireBinder,
  DoorBinder,
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
import { isBoxObject } from "@/engine/core/managers/box/utils";
import { extern } from "@/engine/core/utils/binding";
import { GameObject, IniFile, Optional } from "@/engine/lib/types";

/**
 * Register binders of engine client side objects.
 */
extern("bind", {
  actor: (object: GameObject) => object.bind_object(new ActorBinder(object)),
  anomaly_field: (object: GameObject) => object.bind_object(new AnomalyFieldBinder(object)),
  anomaly_zone: (object: GameObject) => object.bind_object(new AnomalyZoneBinder(object)),
  arena_zone: (object: GameObject) => {
    if (object.spawn_ini()?.section_exist("arena_zone")) {
      object.bind_object(new ArenaZoneBinder(object));
    }
  },
  artefact: (object: GameObject) => object.bind_object(new ArtefactBinder(object)),
  camp: (object: GameObject) => object.bind_object(new CampZoneBinder(object)),
  campfire: (object: GameObject) => object.bind_object(new CampfireBinder(object)),
  crow: (object: GameObject) => object.bind_object(new CrowBinder(object)),
  door: (object: GameObject) => object.bind_object(new DoorBinder(object)),
  helicopter: (object: GameObject) => {
    const ini: Optional<IniFile> = object.spawn_ini();

    if (ini?.section_exist("logic")) {
      object.bind_object(new HelicopterBinder(object, ini));
    }
  },
  helmet: (object: GameObject) => object.bind_object(new HelmetBinder(object)),
  level_changer: (object: GameObject) => object.bind_object(new LevelChangerBinder(object)),
  monster: (object: GameObject) => object.bind_object(new MonsterBinder(object)),
  outfit: (object: GameObject) => object.bind_object(new OutfitBinder(object)),
  phantom: (object: GameObject) => object.bind_object(new PhantomBinder(object)),
  physic_object: (object: GameObject) => {
    if (object.spawn_ini()?.section_exist("logic") || isBoxObject(object)) {
      object.bind_object(new PhysicObjectBinder(object));
    }
  },
  restrictor: (object: GameObject) => object.bind_object(new RestrictorBinder(object)),
  signal_light: (object: GameObject) => object.bind_object(new SignalLightBinder(object)),
  smart_cover: (object: GameObject) => object.bind_object(new SmartCoverBinder(object)),
  smart_terrain: (object: GameObject) => {
    if (object.spawn_ini()?.section_exist("smart_terrain")) {
      object.bind_object(new SmartTerrainBinder(object));
    }
  },
  stalker: (object: GameObject) => object.bind_object(new StalkerBinder(object)),
  weapon: (object: GameObject) => object.bind_object(new WeaponBinder(object)),
});
