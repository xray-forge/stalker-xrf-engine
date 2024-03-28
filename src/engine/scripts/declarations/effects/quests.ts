import { particles_object, patrol, sound_object } from "xray16";

import { StalkerStateManager } from "@/engine/core/ai/state";
import { EStalkerState } from "@/engine/core/animation/types";
import {
  getManager,
  getObjectByStoryId,
  getObjectIdByStoryId,
  getPortableStoreValue,
  registry,
  setPortableStoreValue,
} from "@/engine/core/database";
import { MapDisplayManager } from "@/engine/core/managers/map";
import { showFreeplayDialog } from "@/engine/core/ui/game/freeplay";
import { abort, assert } from "@/engine/core/utils/assertion";
import { extern, getExtern } from "@/engine/core/utils/binding";
import { createGameAutoSave } from "@/engine/core/utils/game_save";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";
import { LuaLogger } from "@/engine/core/utils/logging";
import { isObjectInZone } from "@/engine/core/utils/position";
import { giveItemsToActor, takeItemFromActor } from "@/engine/core/utils/reward";
import { spawnObject, spawnObjectInObject, spawnSquadInSmart } from "@/engine/core/utils/spawn";
import { copyVector, createEmptyVector, createVector } from "@/engine/core/utils/vector";
import { ACTOR_ID } from "@/engine/lib/constants/ids";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { TInventoryItem } from "@/engine/lib/constants/items";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { artefacts } from "@/engine/lib/constants/items/artefacts";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { questItems } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { TRUE } from "@/engine/lib/constants/words";
import {
  AnyCallable,
  GameObject,
  LuaArray,
  Optional,
  ParticlesObject,
  ServerObject,
  ServerPhysicObject,
  SoundObject,
  TCount,
  TDistance,
  TIndex,
  TLabel,
  TName,
  TNumberId,
  TRate,
  TSection,
  TStringId,
  TStringifiedBoolean,
  Vector,
} from "@/engine/lib/types";
import { zatB29AfTable, zatB29InfopBringTable } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";

const logger: LuaLogger = new LuaLogger($filename);

/**
 * Show freeplay dialog in the end of game.
 *
 * Where:
 * - text - string to show in dialog
 * - canStay - whether actor can leave zone
 */
extern(
  "xr_effects.show_freeplay_dialog",
  (_: GameObject, __: GameObject, [text, canLeave]: [Optional<TLabel>, Optional<TStringifiedBoolean>]) => {
    assert(text, "Expected text message to be provided for 'show_freeplay_dialog' effect.");
    showFreeplayDialog(canLeave === TRUE ? "message_box_yes_no" : "message_box_ok", text);
  }
);

/**
 * Handle placing scanner in dedicated b32 zones.
 */
extern("xr_effects.jup_b32_place_scanner", (): void => {
  for (const index of $range(1, 5)) {
    const infoPortion: TStringId = "jup_b32_scanner_" + index + "_placed";

    if (
      isObjectInZone(registry.actor, registry.zones.get("jup_b32_sr_scanner_place_" + index)) &&
      !hasInfoPortion(infoPortion)
    ) {
      giveInfoPortion(infoPortion);
      giveInfoPortion(infoPortions.jup_b32_tutorial_done);

      takeItemFromActor(questItems.jup_b32_scanner_device);
      spawnObject("jup_b32_ph_scanner", "jup_b32_scanner_place_" + index);
    }
  }
});

/**
 * Force update of pda zones display.
 */
extern("xr_effects.jup_b32_pda_check", (): void => {
  getManager(MapDisplayManager).updateAnomalyZonesDisplay();
});

/**
 * Check if actor is in zone and force generators start.
 */
extern("xr_effects.pri_b306_generator_start", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("pri_b306_sr_generator"))) {
    giveInfoPortion(infoPortions.pri_b306_lift_generator_used);
  }
});

/**
 * todo: Simplify with utils for object destruction
 */
extern("xr_effects.jup_b206_get_plant", (_: GameObject, object: GameObject): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("jup_b206_sr_quest_line"))) {
    giveInfoPortion(infoPortions.jup_b206_anomalous_grove_has_plant);
    giveItemsToActor(questItems.jup_b206_plant);

    getExtern<AnyCallable>("destroy_object", getExtern("xr_effects"))(registry.actor, object, [
      "story",
      "jup_b206_plant_ph",
      null,
    ]);
  }
});

/**
 * Handle usage of b400 passage switcher.
 */
extern("xr_effects.pas_b400_switcher", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("pas_b400_sr_switcher"))) {
    giveInfoPortion(infoPortions.pas_b400_switcher_use);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b209_place_scanner", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("jup_b209_hypotheses"))) {
    createGameAutoSave("st_save_jup_b209_placed_mutant_scanner");
    giveInfoPortion(infoPortions.jup_b209_scanner_placed);
    takeItemFromActor(questItems.jup_b209_monster_scanner);
    spawnObject("jup_b209_ph_scanner", "jup_b209_scanner_place_point");
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b9_heli_1_searching", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("jup_b9_heli_1"))) {
    giveInfoPortion(infoPortions.jup_b9_heli_1_searching);
  }
});

/**
 * todo;
 */
extern("xr_effects.pri_a18_use_idol", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("pri_a18_use_idol_restrictor"))) {
    giveInfoPortion(infoPortions.pri_a18_run_cam);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b8_heli_4_searching", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("jup_b8_heli_4"))) {
    giveInfoPortion(infoPortions.jup_b8_heli_4_searching);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b10_ufo_searching", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("jup_b10_ufo_restrictor"))) {
    giveInfoPortion(infoPortions.jup_b10_ufo_memory_started);
    giveItemsToActor(questItems.jup_b10_ufo_memory);
  }
});

/**
 * todo;
 */
extern("xr_effects.zat_b101_heli_5_searching", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("zat_b101_heli_5"))) {
    giveInfoPortion(infoPortions.zat_b101_heli_5_searching);
  }
});

/**
 * todo;
 */
extern("xr_effects.zat_b28_heli_3_searching", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("zat_b28_heli_3"))) {
    giveInfoPortion(infoPortions.zat_b28_heli_3_searching);
  }
});

/**
 * todo;
 */
extern("xr_effects.zat_b100_heli_2_searching", (): void => {
  logger.info("Searching helicopter #2");

  if (isObjectInZone(registry.actor, registry.zones.get("zat_b100_heli_2"))) {
    giveInfoPortion(infoPortions.zat_b100_heli_2_searching);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_teleport_actor", (actor: GameObject, object: GameObject): void => {
  const pointIn: Vector = new patrol("jup_b16_teleport_in").point(0);
  const pointOut: Vector = new patrol("jup_b16_teleport_out").point(0);
  const actorPosition: Vector = actor.position();
  const outPosition: Vector = createVector(
    actorPosition.x - pointIn.x + pointOut.x,
    actorPosition.y - pointIn.y + pointOut.y,
    actorPosition.z - pointIn.z + pointOut.z
  );

  actor.set_actor_position(outPosition);
});

let jupB219Position: Optional<Vector> = null;
let jupB219LVId: Optional<number> = null;
let jupB219GVId: Optional<number> = null;

/**
 * todo;
 */
extern("xr_effects.jup_b219_save_pos", (): void => {
  const object: Optional<GameObject> = getObjectByStoryId("jup_b219_gate_id");

  if (object && object.position()) {
    jupB219Position = object.position();
    jupB219LVId = object.level_vertex_id();
    jupB219GVId = object.game_vertex_id();
  } else {
    return;
  }

  const serverObject: Optional<ServerObject> = registry.simulator.object(object.id());

  if (serverObject) {
    registry.simulator.release(serverObject, true);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b219_restore_gate", () => {
  const yaw: TRate = 0;
  const spawnSection: TSection = "jup_b219_gate";

  if (jupB219Position) {
    const serverObject: ServerPhysicObject = registry.simulator.create(
      spawnSection,
      copyVector(jupB219Position),
      jupB219LVId!,
      jupB219GVId!
    );

    serverObject.set_yaw((yaw * math.pi) / 180);
  }
});

let particlesList: Optional<LuaArray<{ particle: ParticlesObject; sound: SoundObject }>> = null;

/**
 * todo;
 */
extern("xr_effects.jup_b16_play_particle_and_sound", (actor: GameObject, object: GameObject, p: [number]) => {
  if (particlesList === null) {
    particlesList = [
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
      {
        particle: new particles_object("anomaly2\\teleport_out_00"),
        sound: new sound_object("anomaly\\teleport_incoming"),
      },
    ] as unknown as LuaArray<any>;
  }

  particlesList.get(p[0]).particle.play_at_pos(new patrol(object.name() + "_particle").point(0));
});

/**
 * todo;
 */
extern(
  "xr_effects.zat_b29_create_random_infop",
  (actor: GameObject, object: GameObject, parameters: LuaArray<TInfoPortion>): void => {
    if (parameters.get(2) === null) {
      abort("Not enough parameters for zat_b29_create_random_infop!");
    }

    let amountNeeded: TCount = parameters.get(1) as unknown as number;
    let currentInfop: TIndex = 0;
    let totalInfop: TCount = 0;

    if (!amountNeeded || amountNeeded === null) {
      amountNeeded = 1;
    }

    for (const [index, infoPortion] of parameters) {
      if (index > 1) {
        totalInfop = totalInfop + 1;
        disableInfoPortion(infoPortion);
      }
    }

    if (amountNeeded > totalInfop) {
      amountNeeded = totalInfop;
    }

    for (const it of $range(1, amountNeeded)) {
      currentInfop = math.random(1, totalInfop);
      for (const [k, v] of parameters) {
        if (k > 1) {
          if (k === currentInfop + 1 && !hasInfoPortion(v)) {
            giveInfoPortion(v);
            break;
          }
        }
      }
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.give_item_b29", (actor: GameObject, object: GameObject, p: [string]) => {
  // --	const story_object = p && getStoryObject(p[1])
  const anomalyZonesList = [
    "zat_b55_anomal_zone",
    "zat_b54_anomal_zone",
    "zat_b53_anomal_zone",
    "zat_b39_anomal_zone",
    "zaton_b56_anomal_zone",
  ] as unknown as LuaArray<TName>;

  for (const it of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(it))) {
      let anomalyZoneName: Optional<TName> = null;

      for (const [index, name] of anomalyZonesList) {
        if (hasInfoPortion(name as TInfoPortion)) {
          anomalyZoneName = name;
          disableInfoPortion(anomalyZoneName as TInfoPortion);
          break;
        }
      }

      getExtern<AnyCallable>("pick_artefact_from_anomaly", getExtern("xr_effects"))(actor, null, [
        p[0],
        anomalyZoneName,
        zatB29AfTable.get(it),
      ]);
      break;
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.relocate_item_b29", (actor: GameObject, object: GameObject, p: [string, string]) => {
  let item: Optional<string> = null;

  for (const it of $range(16, 23)) {
    if (hasInfoPortion(zatB29InfopBringTable.get(it))) {
      item = zatB29AfTable.get(it);
      break;
    }
  }

  const fromObject: Optional<GameObject> = p && getObjectByStoryId(p[0]);
  const toObject: Optional<GameObject> = p && getObjectByStoryId(p[1]);

  if (toObject !== null) {
    if (fromObject !== null && fromObject.object(item!) !== null) {
      fromObject.transfer_item(fromObject.object(item!)!, toObject);
    } else {
      registry.simulator.create(
        item!,
        toObject.position(),
        toObject.level_vertex_id(),
        toObject.game_vertex_id(),
        toObject.id()
      );
    }
  } else {
    abort("Couldn't relocate item to NULL");
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b202_inventory_box_relocate", (actor: GameObject, object: GameObject): void => {
  const inventoryBoxOut: Optional<GameObject> = getObjectByStoryId("jup_b202_actor_treasure");
  const inventoryBoxIn: Optional<GameObject> = getObjectByStoryId("jup_b202_snag_treasure");
  const itemsToRelocate: LuaArray<GameObject> = new LuaTable();

  if (!inventoryBoxIn || !inventoryBoxOut) {
    abort("No inventory boxes detected to relocate items.");
  }

  inventoryBoxOut.iterate_inventory_box((invBoxOut: GameObject, item: GameObject) => {
    table.insert(itemsToRelocate, item);
  }, inventoryBoxOut);

  for (const [k, v] of itemsToRelocate) {
    inventoryBoxOut.transfer_item(v, inventoryBoxIn);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b10_spawn_drunk_dead_items", (actor: GameObject, object: GameObject, params: [string]): void => {
  const itemsAll = {
    [weapons.wpn_ak74]: 1,
    [weapons.wpn_fort]: 1,
    [ammo["ammo_5.45x39_fmj"]]: 5,
    [ammo["ammo_5.45x39_ap"]]: 3,
    [ammo.ammo_9x18_fmj]: 3,
    [ammo.ammo_12x70_buck]: 5,
    [ammo["ammo_11.43x23_hydro"]]: 2,
    [weapons.grenade_rgd5]: 3,
    [weapons.grenade_f1]: 2,
    [drugs.medkit_army]: 2,
    [drugs.medkit]: 4,
    [drugs.bandage]: 4,
    [drugs.antirad]: 2,
    [food.vodka]: 3,
    [food.energy_drink]: 2,
    [food.conserva]: 1,
    [questItems.jup_b10_ufo_memory_2]: 1,
  } as unknown as LuaTable<string, number>;

  const items = {
    [2]: {
      [weapons.wpn_sig550_luckygun]: 1,
    },
    [1]: {
      [ammo["ammo_5.45x39_fmj"]]: 5,
      [ammo["ammo_5.45x39_ap"]]: 3,
      [weapons.wpn_fort]: 1,
      [ammo.ammo_9x18_fmj]: 3,
      [ammo.ammo_12x70_buck]: 5,
      [ammo["ammo_11.43x23_hydro"]]: 2,
      [weapons.grenade_rgd5]: 3,
      [weapons.grenade_f1]: 2,
    },
    [0]: {
      [drugs.medkit_army]: 2,
      [drugs.medkit]: 4,
      [drugs.bandage]: 4,
      [drugs.antirad]: 2,
      [food.vodka]: 3,
      [food.energy_drink]: 2,
      [food.conserva]: 1,
    },
  } as unknown as LuaArray<LuaTable<string, number>>;

  if (params && params[0] !== null) {
    const cnt: TCount = getPortableStoreValue(ACTOR_ID, "jup_b10_ufo_counter", 0);

    if (cnt > 2) {
      return;
    }

    for (const [k, v] of items.get(cnt)) {
      const targetObjectId: Optional<TNumberId> = getObjectIdByStoryId(params[0]);

      if (targetObjectId !== null) {
        const box: Optional<ServerObject> = registry.simulator.object(targetObjectId);

        if (box === null) {
          abort("There is no such object %s", params[0]);
        }

        for (const i of $range(1, v)) {
          registry.simulator.create(k, createEmptyVector(), 0, 0, targetObjectId);
        }
      } else {
        abort("object is null %s", tostring(params[0]));
      }
    }
  } else {
    for (const [k, v] of itemsAll) {
      for (const i of $range(1, v)) {
        registry.simulator.create(k, object.position(), object.level_vertex_id(), object.game_vertex_id(), object.id());
      }
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.zat_b202_spawn_random_loot", (actor: GameObject, object: GameObject, p: []) => {
  const spawnItemsList = [
    [
      {
        item: [
          "bandage",
          "bandage",
          "bandage",
          "bandage",
          "bandage",
          "medkit",
          "medkit",
          "medkit",
          "conserva",
          "conserva",
        ],
      },
      { item: ["medkit", "medkit", "medkit", "medkit", "medkit", "vodka", "vodka", "vodka", "kolbasa", "kolbasa"] },
      { item: ["antirad", "antirad", "antirad", "medkit", "medkit", "bandage", "kolbasa", "kolbasa", "conserva"] },
    ],
    [
      { item: ["grenade_f1", "grenade_f1", "grenade_f1"] },
      { item: ["grenade_rgd5", "grenade_rgd5", "grenade_rgd5", "grenade_rgd5", "grenade_rgd5"] },
    ],
    [{ item: ["detector_elite"] }, { item: ["detector_advanced"] }],
    [{ item: ["helm_hardhat"] }, { item: ["helm_respirator"] }],
    [
      { item: ["wpn_val", "ammo_9x39_ap", "ammo_9x39_ap", "ammo_9x39_ap"] },
      { item: ["wpn_spas12", "ammo_12x70_buck", "ammo_12x70_buck", "ammo_12x70_buck", "ammo_12x70_buck"] },
      {
        item: [
          "wpn_desert_eagle",
          "ammo_11.43x23_fmj",
          "ammo_11.43x23_fmj",
          "ammo_11.43x23_hydro",
          "ammo_11.43x23_hydro",
        ],
      },
      { item: ["wpn_abakan", "ammo_5.45x39_ap", "ammo_5.45x39_ap"] },
      { item: ["wpn_sig550", "ammo_5.56x45_ap", "ammo_5.56x45_ap"] },
      { item: ["wpn_ak74", "ammo_5.45x39_fmj", "ammo_5.45x39_fmj"] },
      { item: ["wpn_l85", "ammo_5.56x45_ss190", "ammo_5.56x45_ss190"] },
    ],
    [{ item: ["specops_outfit"] }, { item: ["stalker_outfit"] }],
  ] as unknown as LuaArray<LuaArray<{ item: LuaArray<string> }>>;

  const weightList: LuaArray<TRate> = $fromArray<TRate>([2, 2, 2, 2, 4, 4]);

  const spawnedItems = new LuaTable();
  let maxWeight: TCount = 12;

  // todo: Simplify, seems like too complex...
  while (maxWeight > 0) {
    let n: number = 0;
    let prap: boolean = true;

    do {
      prap = true;
      n = math.random(1, weightList.length());

      for (const [k, v] of spawnedItems) {
        if (v === n) {
          prap = false;
          break;
        }
      }
    } while (!(prap && maxWeight - weightList.get(n) >= 0));

    maxWeight = maxWeight - weightList.get(n);
    table.insert(spawnedItems, n);

    const item = math.random(1, spawnItemsList.get(n).length());

    for (const [k, v] of spawnItemsList.get(n).get(item).item) {
      spawnObjectInObject(tostring(v), getObjectIdByStoryId("jup_b202_snag_treasure"));
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b221_play_main", (actor: GameObject, object: GameObject, p: [string]) => {
  let infoPortionsList: LuaArray<TInfoPortion> = new LuaTable();
  let mainTheme: string;
  let replyTheme: string;
  let infoNeedReply: TInfoPortion;
  const reachableTheme: LuaTable = new LuaTable();

  if ((p && p[0]) === null) {
    abort("No such parameters in function 'jup_b221_play_main'");
  }

  if (tostring(p[0]) === "duty") {
    infoPortionsList = $fromArray<TInfoPortion>([
      infoPortions.jup_b25_freedom_flint_gone,
      infoPortions.jup_b25_flint_blame_done_to_duty,
      infoPortions.jup_b4_monolith_squad_in_duty,
      infoPortions.jup_a6_duty_leader_bunker_guards_work,
      infoPortions.jup_a6_duty_leader_employ_work,
      infoPortions.jup_b207_duty_wins,
    ]);
    mainTheme = "jup_b221_duty_main_";
    replyTheme = "jup_b221_duty_reply_";
    infoNeedReply = infoPortions.jup_b221_duty_reply;
  } else if (tostring(p[0]) === "freedom") {
    infoPortionsList = $fromArray<TInfoPortion>([
      infoPortions.jup_b207_freedom_know_about_depot,
      infoPortions.jup_b46_duty_founder_pda_to_freedom,
      infoPortions.jup_b4_monolith_squad_in_freedom,
      infoPortions.jup_a6_freedom_leader_bunker_guards_work,
      infoPortions.jup_a6_freedom_leader_employ_work,
      infoPortions.jup_b207_freedom_wins,
    ]);
    mainTheme = "jup_b221_freedom_main_";
    replyTheme = "jup_b221_freedom_reply_";
    infoNeedReply = infoPortions.jup_b221_freedom_reply;
  } else {
    abort("Wrong parameters in function 'jup_b221_play_main'");
  }

  for (const [k, v] of infoPortionsList) {
    if (hasInfoPortion(v) && !hasInfoPortion((mainTheme + tostring(k) + "_played") as TInfoPortion)) {
      table.insert(reachableTheme, k);
    }
  }

  if (reachableTheme.length() !== 0) {
    const themeToPlay = table.random(reachableTheme)[1];

    disableInfoPortion(infoNeedReply);
    setPortableStoreValue(ACTOR_ID, "jup_b221_played_main_theme", tostring(themeToPlay));
    giveInfoPortion((mainTheme + tostring(themeToPlay) + "_played") as TInfoPortion);

    if (themeToPlay !== 0) {
      getExtern<AnyCallable>("play_sound", getExtern("xr_effects"))(actor, object, [
        mainTheme + tostring(themeToPlay),
        null,
        null,
      ]);
    } else {
      abort("No such theme_to_play in function 'jup_b221_play_main'");
    }
  } else {
    const themeToPlay: TIndex = tonumber(getPortableStoreValue(ACTOR_ID, "jup_b221_played_main_theme", 0)) as TIndex;

    giveInfoPortion(infoNeedReply);

    if (themeToPlay !== 0) {
      getExtern<AnyCallable>("play_sound", getExtern("xr_effects"))(actor, object, [
        replyTheme + tostring(themeToPlay),
        null,
        null,
      ]);
    } else {
      abort("No such theme_to_play in function 'jup_b221_play_main'");
    }

    setPortableStoreValue(ACTOR_ID, "jup_b221_played_main_theme", "0");
  }
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.zat_a1_tutorial_end_give", (_: GameObject, __: GameObject): void => {
  // --	level.add_pp_effector("black.ppe", 1313, true)
  giveInfoPortion(infoPortions.zat_a1_tutorial_end);
});

// todo: Fix if used, should increment values probably with +=.
extern("xr_effects.oasis_heal", (): void => {
  const actor: GameObject = registry.actor;

  const newHealth: TRate = 0.005;
  const newPower: TRate = 0.01;
  const newBleeding: TRate = 0.05;
  const newRadiation: TRate = -0.05;

  // todo: Maybe increment?
  if (actor.health < 1) {
    actor.health = newHealth;
  }

  if (actor.power < 1) {
    actor.power = newPower;
  }

  if (actor.radiation > 0) {
    actor.radiation = newRadiation;
  }

  if (actor.bleeding > 0) {
    actor.bleeding = newBleeding;
  }

  actor.satiety = 0.01;
});

/**
 * todo
 */
extern("xr_effects.pas_b400_play_particle", (actor: GameObject, object: GameObject): void => {
  registry.actor.start_particles("zones\\zone_acidic_idle", "bip01_head");
});

/**
 * todo
 */
extern("xr_effects.pas_b400_stop_particle", (actor: GameObject, object: GameObject): void => {
  registry.actor.stop_particles("zones\\zone_acidic_idle", "bip01_head");
});

/**
 * todo
 */
extern("xr_effects.damage_pri_a17_gauss", (): void => {
  const object: Optional<GameObject> = getObjectByStoryId(questItems.pri_a17_gauss_rifle);

  if (object !== null) {
    object.set_condition(0.0);
  }
});

/**
 * todo;
 */
extern("xr_effects.pri_a17_hard_animation_reset", (actor: GameObject, object: GameObject): void => {
  const stateManager: StalkerStateManager = registry.objects.get(object.id()).stateManager!;

  stateManager.setState("pri_a17_fall_down" as EStalkerState, null, null, null, null);
  stateManager.animation.setState(null, true);
  stateManager.animation.setState("pri_a17_fall_down" as EStalkerState, null);
  stateManager.animation.setControl();
});

/**
 * todo;
 */
extern("xr_effects.jup_b217_hard_animation_reset", (actor: GameObject, object: GameObject): void => {
  const stateManager: StalkerStateManager = registry.objects.get(object.id()).stateManager!;

  stateManager.setState("jup_b217_nitro_straight" as EStalkerState, null, null, null, null);
  stateManager.animation.setState(null, true);
  stateManager.animation.setState("jup_b217_nitro_straight" as EStalkerState, null);
  stateManager.animation.setControl();
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.pri_a18_radio_start", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.pri_a18_radio_start);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.pri_a17_ice_climb_end", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.pri_a17_ice_climb_end);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.jup_b219_opening", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.jup_b219_opening);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.jup_b219_entering_underpass", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.jup_b219_entering_underpass);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.pri_a17_pray_start", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.pri_a17_pray_start);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.zat_b38_open_info", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.zat_b38_open_info);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.zat_b38_switch_info", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.zat_b38_switch_info);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.zat_b38_cop_dead", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.zat_b38_cop_dead);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.jup_b15_zulus_drink_anim_info", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.jup_b15_zulus_drink_anim_info);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.pri_a17_preacher_death", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.pri_a17_preacher_death);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.zat_b3_tech_surprise_anim_end", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.zat_b3_tech_surprise_anim_end);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.zat_b3_tech_waked_up", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.zat_b3_tech_waked_up);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.zat_b3_tech_drinked_out", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.zat_b3_tech_drinked_out);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.pri_a28_kirillov_hq_online", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.pri_a28_kirillov_hq_online);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.pri_a20_radio_start", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.pri_a20_radio_start);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.pri_a22_kovalski_speak", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.pri_a22_kovalski_speak);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.zat_b38_underground_door_open", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.zat_b38_underground_door_open);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.zat_b38_jump_tonnel_info", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.zat_b38_jump_tonnel_info);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.jup_a9_cam1_actor_anim_end", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.jup_a9_cam1_actor_anim_end);
});

/**
 * Give quest related info portions for actor object.
 */
extern("xr_effects.pri_a28_talk_ssu_video_end", (_: GameObject, __: GameObject): void => {
  giveInfoPortion(infoPortions.pri_a28_talk_ssu_video_end);
});

/**
 * todo;
 */
extern("xr_effects.zat_b33_pic_snag_container", (): void => {
  if (isObjectInZone(registry.actor, registry.zones.get("zat_b33_tutor"))) {
    giveItemsToActor(questItems.zat_b33_safe_container);
    giveInfoPortion(infoPortions.zat_b33_find_package);

    // todo: use shared util instead of effect
    if (!hasInfoPortion(infoPortions.zat_b33_safe_container)) {
      getExtern<AnyCallable>("play_sound", getExtern("xr_effects"))(
        registry.actor,
        registry.zones.get("zat_b33_tutor"),
        ["pda_news", null, null]
      );
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.zat_b202_spawn_b33_loot", (actor: GameObject, object: GameObject, p: []) => {
  const infoPortionsList: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
    infoPortions.zat_b33_first_item_gived,
    infoPortions.zat_b33_second_item_gived,
    infoPortions.zat_b33_third_item_gived,
    infoPortions.zat_b33_fourth_item_gived,
    infoPortions.zat_b33_fifth_item_gived,
  ]);

  const rewardItems: LuaArray<LuaArray<TInventoryItem>> = $fromArray<LuaArray<TInventoryItem>>([
    $fromArray<TInventoryItem>([weapons.wpn_fort_snag]),
    $fromArray<TInventoryItem>([
      drugs.medkit_scientic,
      drugs.medkit_scientic,
      drugs.medkit_scientic,
      drugs.antirad,
      drugs.antirad,
      drugs.antirad,
      drugs.bandage,
      drugs.bandage,
      drugs.bandage,
      drugs.bandage,
      drugs.bandage,
    ]),
    $fromArray<TInventoryItem>([weapons.wpn_ak74u_snag]),
    $fromArray<TInventoryItem>([artefacts.af_soul]),
    $fromArray<TInventoryItem>([helmets.helm_hardhat_snag]),
  ]);

  for (const [index, infoPortion] of infoPortionsList) {
    const objectId: TStringId = index === 1 || index === 3 ? "jup_b202_stalker_snag" : "jup_b202_snag_treasure";

    if (!hasInfoPortion(infoPortion)) {
      for (const [it, itemSection] of rewardItems.get(index)) {
        spawnObjectInObject(tostring(itemSection), getObjectIdByStoryId(tostring(objectId)));
      }
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.pri_a28_check_zones", (): void => {
  const actor: GameObject = registry.actor;
  let dist: TDistance = 0;
  let index: TIndex = 0;

  const zonesList: LuaArray<TStringId> = $fromArray([
    "pri_a28_sr_mono_add_1",
    "pri_a28_sr_mono_add_2",
    "pri_a28_sr_mono_add_3",
  ]);

  const infoList: LuaArray<TInfoPortion> = $fromArray<TInfoPortion>([
    infoPortions.pri_a28_wave_1_spawned,
    infoPortions.pri_a28_wave_2_spawned,
    infoPortions.pri_a28_wave_3_spawned,
  ]);

  const squadsList: LuaArray<TStringId> = $fromArray([
    "pri_a28_heli_mono_add_1",
    "pri_a28_heli_mono_add_2",
    "pri_a28_heli_mono_add_3",
  ]);

  for (const [itIndex, it] of zonesList) {
    const storyObjectId: Optional<TNumberId> = getObjectIdByStoryId(it);

    if (storyObjectId) {
      const serverObject: Optional<ServerObject> = registry.simulator.object(storyObjectId)!;
      const distance: TDistance = serverObject.position.distance_to(actor.position());

      if (index === 0) {
        dist = distance;
        index = itIndex;
      } else if (dist < distance) {
        dist = distance;
        index = itIndex;
      }
    }
  }

  if (index === 0) {
    abort("Found no distance || zones in func 'pri_a28_check_zones'");
  }

  if (hasInfoPortion(infoList.get(index))) {
    for (const [k, v] of infoList) {
      if (!hasInfoPortion(infoList.get(k))) {
        giveInfoPortion(infoList.get(k));
      }
    }
  } else {
    giveInfoPortion(infoList.get(index));
  }

  spawnSquadInSmart(squadsList.get(index), "pri_a28_heli");
});

/**
 * Handle consuming vodka by script scenario.
 */
extern("xr_effects.eat_vodka_script", (actor: GameObject): void => {
  const item: Optional<GameObject> = actor.object("vodka_script");

  if (item) {
    actor.eat(item);
  }
});

const materialsTable: LuaArray<TStringId> = $fromArray([
  "jup_b200_material_1",
  "jup_b200_material_2",
  "jup_b200_material_3",
  "jup_b200_material_4",
  "jup_b200_material_5",
  "jup_b200_material_6",
  "jup_b200_material_7",
  "jup_b200_material_8",
  "jup_b200_material_9",
]);

/**
 * todo;
 */
extern("xr_effects.jup_b200_count_found", (actor: GameObject): void => {
  let count: TCount = 0;

  for (const [index, materialId] of materialsTable) {
    const materialObject: Optional<GameObject> = getObjectByStoryId(materialId);

    if (materialObject !== null) {
      const parent: GameObject = materialObject.parent();

      if (parent !== null) {
        const parentId: TNumberId = parent.id();

        if (parentId !== MAX_U16 && parentId === actor.id()) {
          count = count + 1;
        }
      }
    }
  }

  count += getPortableStoreValue(ACTOR_ID, "jup_b200_tech_materials_brought_counter", 0);
  setPortableStoreValue(ACTOR_ID, "jup_b200_tech_materials_found_counter", count);
});
