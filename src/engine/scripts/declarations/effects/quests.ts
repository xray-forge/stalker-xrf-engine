import {
  alife,
  particles_object,
  patrol,
  sound_object,
  vector,
  XR_cse_alife_object,
  XR_cse_alife_object_physic,
  XR_game_object,
  XR_particles_object,
  XR_sound_object,
  XR_vector,
} from "xray16";

import {
  getObjectByStoryId,
  getObjectIdByStoryId,
  portableStoreGet,
  portableStoreSet,
  registry,
} from "@/engine/core/database";
import { MapDisplayManager } from "@/engine/core/managers/map";
import { EStalkerState } from "@/engine/core/objects/state";
import { showFreeplayDialog } from "@/engine/core/ui/game/FreeplayDialog";
import { abort } from "@/engine/core/utils/assertion";
import { extern } from "@/engine/core/utils/binding";
import { isActorInZoneWithName } from "@/engine/core/utils/check/check";
import { createAutoSave } from "@/engine/core/utils/game_save";
import { disableInfo, giveInfo, hasAlifeInfo } from "@/engine/core/utils/info_portion";
import { captions } from "@/engine/lib/constants/captions/captions";
import { infoPortions, TInfoPortion } from "@/engine/lib/constants/info_portions";
import { ammo } from "@/engine/lib/constants/items/ammo";
import { artefacts } from "@/engine/lib/constants/items/artefacts";
import { drugs } from "@/engine/lib/constants/items/drugs";
import { food } from "@/engine/lib/constants/items/food";
import { helmets } from "@/engine/lib/constants/items/helmets";
import { quest_items } from "@/engine/lib/constants/items/quest_items";
import { weapons } from "@/engine/lib/constants/items/weapons";
import { MAX_U16 } from "@/engine/lib/constants/memory";
import { scriptSounds } from "@/engine/lib/constants/sound/script_sounds";
import { zones } from "@/engine/lib/constants/zones";
import { LuaArray, Optional, TCount, TDistance, TIndex, TName, TNumberId, TStringId } from "@/engine/lib/types";
import { zat_b29_af_table, zat_b29_infop_bring_table } from "@/engine/scripts/declarations/dialogs/dialogs_zaton";
import {
  create_squad,
  destroy_object,
  give_actor,
  pick_artefact_from_anomaly,
  play_sound,
  remove_item,
  spawn_object,
  spawn_object_in,
} from "@/engine/scripts/declarations/effects/effects_old";

/**
 * todo;
 */
extern(
  "xr_effects.show_freeplay_dialog",
  (actor: XR_game_object, npc: XR_game_object, p: [string, Optional<"true">]) => {
    if (p[0] && p[1] && p[1] === "true") {
      showFreeplayDialog("message_box_yes_no", p[0]);
    } else if (p[0]) {
      showFreeplayDialog("message_box_ok", p[0]);
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.jup_b32_place_scanner", (actor: XR_game_object, npc: XR_game_object): void => {
  for (const i of $range(1, 5)) {
    if (
      isActorInZoneWithName("jup_b32_sr_scanner_place_" + i, actor) &&
      !hasAlifeInfo(("jup_b32_scanner_" + i + "_placed") as TInfoPortion)
    ) {
      giveInfo(("jup_b32_scanner_" + i + "_placed") as TInfoPortion);
      giveInfo(infoPortions.jup_b32_tutorial_done);
      remove_item(actor, npc, ["jup_b32_scanner_device"]);
      spawn_object(actor, null, ["jup_b32_ph_scanner", "jup_b32_scanner_place_" + i, null, null]);
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b32_pda_check", (actor: XR_game_object, npc: XR_game_object): void => {
  MapDisplayManager.getInstance().updateAnomalyZonesDisplay();
});

/**
 * todo;
 */
extern("xr_effects.pri_b306_generator_start", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.pri_b306_sr_generator, actor)) {
    giveInfo(infoPortions.pri_b306_lift_generator_used);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b206_get_plant", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.jup_b206_sr_quest_line, actor)) {
    giveInfo(infoPortions.jup_b206_anomalous_grove_has_plant);
    give_actor(actor, npc, ["jup_b206_plant"]);
    destroy_object(actor, npc, ["story", "jup_b206_plant_ph", null]);
  }
});

/**
 * todo;
 */
extern("xr_effects.pas_b400_switcher", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.pas_b400_sr_switcher, actor)) {
    giveInfo(infoPortions.pas_b400_switcher_use);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b209_place_scanner", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.jup_b209_hypotheses)) {
    createAutoSave(captions.st_save_jup_b209_placed_mutant_scanner);
    giveInfo(infoPortions.jup_b209_scanner_placed);
    remove_item(actor, npc, ["jup_b209_monster_scanner"]);
    spawn_object(actor, null, ["jup_b209_ph_scanner", "jup_b209_scanner_place_point", null, null]);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b9_heli_1_searching", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.jup_b9_heli_1, actor)) {
    giveInfo(infoPortions.jup_b9_heli_1_searching);
  }
});

/**
 * todo;
 */
extern("xr_effects.pri_a18_use_idol", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.pri_a18_use_idol_restrictor, actor)) {
    giveInfo(infoPortions.pri_a18_run_cam);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b8_heli_4_searching", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.jup_b8_heli_4)) {
    giveInfo(infoPortions.jup_b8_heli_4_searching);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b10_ufo_searching", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.jup_b10_ufo_restrictor)) {
    giveInfo(infoPortions.jup_b10_ufo_memory_started);
    give_actor(actor, null, ["jup_b10_ufo_memory"]);
  }
});

/**
 * todo;
 */
extern("xr_effects.zat_b101_heli_5_searching", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.zat_b101_heli_5)) {
    giveInfo(infoPortions.zat_b101_heli_5_searching);
  }
});

/**
 * todo;
 */
extern("xr_effects.zat_b28_heli_3_searching", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.zat_b28_heli_3)) {
    giveInfo(infoPortions.zat_b28_heli_3_searching);
  }
});

/**
 * todo;
 */
extern("xr_effects.zat_b100_heli_2_searching", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.zat_b100_heli_2)) {
    giveInfo("zat_b100_heli_2_searching");
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_teleport_actor", (actor: XR_game_object, npc: XR_game_object): void => {
  const point_in = new patrol("jup_b16_teleport_in").point(0);
  const point_out = new patrol("jup_b16_teleport_out").point(0);
  const actor_position = actor.position();
  const out_position = new vector().set(
    actor_position.x - point_in.x + point_out.x,
    actor_position.y - point_in.y + point_out.y,
    actor_position.z - point_in.z + point_out.z
  );

  actor.set_actor_position(out_position);
});

let jup_b219_position: Optional<XR_vector> = null;
let jup_b219_lvid: Optional<number> = null;
let jup_b219_gvid: Optional<number> = null;

/**
 * todo;
 */
extern("xr_effects.jup_b219_save_pos", (): void => {
  const object: Optional<XR_game_object> = getObjectByStoryId("jup_b219_gate_id");

  if (object && object.position()) {
    jup_b219_position = object.position();
    jup_b219_lvid = object.level_vertex_id();
    jup_b219_gvid = object.game_vertex_id();
  } else {
    return;
  }

  const serverObject: Optional<XR_cse_alife_object> = alife().object(object.id());

  if (serverObject) {
    alife().release(serverObject, true);
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b219_restore_gate", () => {
  const yaw = 0;
  const spawn_sect = "jup_b219_gate";

  if (jup_b219_position) {
    const se_obj = alife().create<XR_cse_alife_object_physic>(
      spawn_sect,
      new vector().set(jup_b219_position),
      jup_b219_lvid!,
      jup_b219_gvid!
    );

    se_obj.set_yaw((yaw * math.pi) / 180);
  }
});

let particles_table: Optional<LuaArray<{ particle: XR_particles_object; sound: XR_sound_object }>> = null;

/**
 * todo;
 */
extern("xr_effects.jup_b16_play_particle_and_sound", (actor: XR_game_object, npc: XR_game_object, p: [number]) => {
  if (particles_table === null) {
    particles_table = [
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

  particles_table.get(p[0]).particle.play_at_pos(new patrol(npc.name() + "_particle").point(0));
});

/**
 * todo;
 */
extern(
  "xr_effects.zat_b29_create_random_infop",
  (actor: XR_game_object, npc: XR_game_object, parameters: LuaArray<TInfoPortion>): void => {
    if (parameters.get(2) === null) {
      abort("Not enough parameters for zat_b29_create_random_infop!");
    }

    let amountNeeded: number = parameters.get(1) as unknown as number;
    let current_infop: number = 0;
    let total_infop: number = 0;

    if (!amountNeeded || amountNeeded === null) {
      amountNeeded = 1;
    }

    for (const [index, infoPortion] of parameters) {
      if (index > 1) {
        total_infop = total_infop + 1;
        disableInfo(infoPortion);
      }
    }

    if (amountNeeded > total_infop) {
      amountNeeded = total_infop;
    }

    for (const it of $range(1, amountNeeded)) {
      current_infop = math.random(1, total_infop);
      for (const [k, v] of parameters) {
        if (k > 1) {
          if (k === current_infop + 1 && !hasAlifeInfo(v)) {
            giveInfo(v);
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
extern("xr_effects.give_item_b29", (actor: XR_game_object, npc: XR_game_object, p: [string]) => {
  // --	const story_object = p && getStoryObject(p[1])
  const anomalyZonesList = [
    "zat_b55_anomal_zone",
    "zat_b54_anomal_zone",
    "zat_b53_anomal_zone",
    "zat_b39_anomal_zone",
    "zaton_b56_anomal_zone",
  ] as unknown as LuaArray<TName>;

  for (const it of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(it))) {
      let anomalyZoneName: Optional<TName> = null;

      for (const [index, name] of anomalyZonesList) {
        if (hasAlifeInfo(name as TInfoPortion)) {
          anomalyZoneName = name;
          disableInfo(anomalyZoneName as TInfoPortion);
          break;
        }
      }

      pick_artefact_from_anomaly(actor, null, [p[0], anomalyZoneName, zat_b29_af_table.get(it)]);
      break;
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.relocate_item_b29", (actor: XR_game_object, npc: XR_game_object, p: [string, string]) => {
  let item: Optional<string> = null;

  for (const it of $range(16, 23)) {
    if (hasAlifeInfo(zat_b29_infop_bring_table.get(it))) {
      item = zat_b29_af_table.get(it);
      break;
    }
  }

  const fromObject: Optional<XR_game_object> = p && getObjectByStoryId(p[0]);
  const toObject: Optional<XR_game_object> = p && getObjectByStoryId(p[1]);

  if (toObject !== null) {
    if (fromObject !== null && fromObject.object(item!) !== null) {
      fromObject.transfer_item(fromObject.object(item!)!, toObject);
    } else {
      alife().create(item!, toObject.position(), toObject.level_vertex_id(), toObject.game_vertex_id(), toObject.id());
    }
  } else {
    abort("Couldn't relocate item to NULL");
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b202_inventory_box_relocate", (actor: XR_game_object, npc: XR_game_object): void => {
  const inventoryBoxOut: Optional<XR_game_object> = getObjectByStoryId("jup_b202_actor_treasure");
  const inventoryBoxIn: Optional<XR_game_object> = getObjectByStoryId("jup_b202_snag_treasure");
  const itemsToRelocate: LuaArray<XR_game_object> = new LuaTable();

  if (!inventoryBoxIn || !inventoryBoxOut) {
    abort("No inventory boxes detected to relocate items.");
  }

  inventoryBoxOut.iterate_inventory_box((inv_box_out: XR_game_object, item: XR_game_object) => {
    table.insert(itemsToRelocate, item);
  }, inventoryBoxOut);

  for (const [k, v] of itemsToRelocate) {
    inventoryBoxOut.transfer_item(v, inventoryBoxIn);
  }
});

/**
 * todo;
 */
extern(
  "xr_effects.jup_b10_spawn_drunk_dead_items",
  (actor: XR_game_object, npc: XR_game_object, params: [string]): void => {
    const items_all = {
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
      [quest_items.jup_b10_ufo_memory_2]: 1,
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
      const cnt = portableStoreGet(actor, "jup_b10_ufo_counter", 0);

      if (cnt > 2) {
        return;
      }

      for (const [k, v] of items.get(cnt)) {
        const targetObjectId: Optional<TNumberId> = getObjectIdByStoryId(params[0]);

        if (targetObjectId !== null) {
          const box = alife().object(targetObjectId);

          if (box === null) {
            abort("There is no such object %s", params[0]);
          }

          for (const i of $range(1, v)) {
            alife().create(k, new vector(), 0, 0, targetObjectId);
          }
        } else {
          abort("object is null %s", tostring(params[0]));
        }
      }
    } else {
      for (const [k, v] of items_all) {
        for (const i of $range(1, v)) {
          alife().create(k, npc.position(), npc.level_vertex_id(), npc.game_vertex_id(), npc.id());
        }
      }
    }
  }
);

/**
 * todo;
 */
extern("xr_effects.zat_b202_spawn_random_loot", (actor: XR_game_object, npc: XR_game_object, p: []) => {
  const si_table = [
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

  const weight_table = [2, 2, 2, 2, 4, 4] as unknown as LuaArray<number>;

  const spawned_item = new LuaTable();
  let max_weight = 12;

  // todo: Simplify, seems like too complex...
  while (max_weight > 0) {
    let n: number = 0;
    let prap: boolean = true;

    do {
      prap = true;
      n = math.random(1, weight_table.length());

      for (const [k, v] of spawned_item) {
        if (v === n) {
          prap = false;
          break;
        }
      }
    } while (!(prap && max_weight - weight_table.get(n) >= 0));

    max_weight = max_weight - weight_table.get(n);
    table.insert(spawned_item, n);

    const item = math.random(1, si_table.get(n).length());

    for (const [k, v] of si_table.get(n).get(item).item) {
      spawn_object_in(actor, npc, [tostring(v), "jup_b202_snag_treasure"]);
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.jup_b221_play_main", (actor: XR_game_object, npc: XR_game_object, p: [string]) => {
  let infoPortionsList: LuaArray<TInfoPortion> = new LuaTable();
  let main_theme: string;
  let reply_theme: string;
  let info_need_reply: TInfoPortion;
  const reachable_theme: LuaTable = new LuaTable();

  if ((p && p[0]) === null) {
    abort("No such parameters in function 'jup_b221_play_main'");
  }

  if (tostring(p[0]) === "duty") {
    infoPortionsList = [
      infoPortions.jup_b25_freedom_flint_gone,
      infoPortions.jup_b25_flint_blame_done_to_duty,
      infoPortions.jup_b4_monolith_squad_in_duty,
      infoPortions.jup_a6_duty_leader_bunker_guards_work,
      infoPortions.jup_a6_duty_leader_employ_work,
      infoPortions.jup_b207_duty_wins,
    ] as unknown as LuaArray<TInfoPortion>;
    main_theme = "jup_b221_duty_main_";
    reply_theme = "jup_b221_duty_reply_";
    info_need_reply = infoPortions.jup_b221_duty_reply;
  } else if (tostring(p[0]) === "freedom") {
    infoPortionsList = [
      infoPortions.jup_b207_freedom_know_about_depot,
      infoPortions.jup_b46_duty_founder_pda_to_freedom,
      infoPortions.jup_b4_monolith_squad_in_freedom,
      infoPortions.jup_a6_freedom_leader_bunker_guards_work,
      infoPortions.jup_a6_freedom_leader_employ_work,
      infoPortions.jup_b207_freedom_wins,
    ] as unknown as LuaArray<TInfoPortion>;
    main_theme = "jup_b221_freedom_main_";
    reply_theme = "jup_b221_freedom_reply_";
    info_need_reply = infoPortions.jup_b221_freedom_reply;
  } else {
    abort("Wrong parameters in function 'jup_b221_play_main'");
  }

  for (const [k, v] of infoPortionsList) {
    if (hasAlifeInfo(v) && !hasAlifeInfo((main_theme + tostring(k) + "_played") as TInfoPortion)) {
      table.insert(reachable_theme, k);
    }
  }

  if (reachable_theme.length() !== 0) {
    const theme_to_play = reachable_theme.get(math.random(1, reachable_theme.length()));

    disableInfo(info_need_reply);
    portableStoreSet(actor, "jup_b221_played_main_theme", tostring(theme_to_play));
    giveInfo((main_theme + tostring(theme_to_play) + "_played") as TInfoPortion);

    if (theme_to_play !== 0) {
      play_sound(actor, npc, [main_theme + tostring(theme_to_play), null, null]);
    } else {
      abort("No such theme_to_play in function 'jup_b221_play_main'");
    }
  } else {
    const themeToPlay: TIndex = tonumber(portableStoreGet(actor, "jup_b221_played_main_theme", 0)) as TIndex;

    giveInfo(info_need_reply);

    if (themeToPlay !== 0) {
      play_sound(actor, npc, [reply_theme + tostring(themeToPlay), null, null]);
    } else {
      abort("No such theme_to_play in function 'jup_b221_play_main'");
    }

    portableStoreSet(actor, "jup_b221_played_main_theme", "0");
  }
});

/**
 * todo
 */
extern("xr_effects.zat_a1_tutorial_end_give", (actor: XR_game_object, npc: XR_game_object): void => {
  // --	level.add_pp_effector("black.ppe", 1313, true) //---{ ! stop on r1 !
  giveInfo(infoPortions.zat_a1_tutorial_end);
});

// todo: Fix if used, should increment values probably with +=.
extern("xr_effects.oasis_heal", (): void => {
  const actor: XR_game_object = registry.actor;

  const d_health = 0.005;
  const d_power = 0.01;
  const d_bleeding = 0.05;
  const d_radiation = -0.05;

  // todo: Maybe increment?
  if (actor.health < 1) {
    actor.health = d_health;
  }

  if (actor.power < 1) {
    actor.power = d_power;
  }

  if (actor.radiation > 0) {
    actor.radiation = d_radiation;
  }

  if (actor.bleeding > 0) {
    actor.bleeding = d_bleeding;
  }

  actor.satiety = 0.01;
});

/**
 * todo
 */
extern("xr_effects.pas_b400_play_particle", (actor: XR_game_object, npc: XR_game_object): void => {
  registry.actor.start_particles("zones\\zone_acidic_idle", "bip01_head");
});

/**
 * todo
 */
extern("xr_effects.pas_b400_stop_particle", (actor: XR_game_object, npc: XR_game_object): void => {
  registry.actor.stop_particles("zones\\zone_acidic_idle", "bip01_head");
});

/**
 * todo
 */
extern("xr_effects.damage_pri_a17_gauss", (): void => {
  const object: Optional<XR_game_object> = getObjectByStoryId(quest_items.pri_a17_gauss_rifle);

  if (object !== null) {
    object.set_condition(0.0);
  }
});

/**
 * todo;
 */
extern("xr_effects.pri_a17_hard_animation_reset", (actor: XR_game_object, npc: XR_game_object): void => {
  const stateManager = registry.objects.get(npc.id()).stateManager!;

  stateManager.setState("pri_a17_fall_down" as EStalkerState, null, null, null, null);
  stateManager.animation.setState(null, true);
  stateManager.animation.setState("pri_a17_fall_down" as EStalkerState, null);
  stateManager.animation.setControl();
});

/**
 * todo;
 */
extern("xr_effects.jup_b217_hard_animation_reset", (actor: XR_game_object, npc: XR_game_object): void => {
  const stateManager = registry.objects.get(npc.id()).stateManager!;

  stateManager.setState("jup_b217_nitro_straight" as EStalkerState, null, null, null, null);
  stateManager.animation.setState(null, true);
  stateManager.animation.setState("jup_b217_nitro_straight" as EStalkerState, null);
  stateManager.animation.setControl();
});

/**
 * todo;
 */
extern("xr_effects.pri_a18_radio_start", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.pri_a18_radio_start);
});

/**
 * todo;
 */
extern("xr_effects.pri_a17_ice_climb_end", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.pri_a17_ice_climb_end);
});

/**
 * todo;
 */
extern("xr_effects.jup_b219_opening", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.jup_b219_opening);
});

/**
 * todo;
 */
extern("xr_effects.jup_b219_entering_underpass", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.jup_b219_entering_underpass);
});

/**
 * todo;
 */
extern("xr_effects.pri_a17_pray_start", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.pri_a17_pray_start);
});

/**
 * todo;
 */
extern("xr_effects.zat_b38_open_info", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.zat_b38_open_info);
});

/**
 * todo;
 */
extern("xr_effects.zat_b38_switch_info", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.zat_b38_switch_info);
});

/**
 * todo;
 */
extern("xr_effects.zat_b38_cop_dead", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.zat_b38_cop_dead);
});

/**
 * todo;
 */
extern("xr_effects.jup_b15_zulus_drink_anim_info", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.jup_b15_zulus_drink_anim_info);
});

/**
 * todo;
 */
extern("xr_effects.pri_a17_preacher_death", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.pri_a17_preacher_death);
});

/**
 * todo;
 */
extern("xr_effects.zat_b3_tech_surprise_anim_end", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.zat_b3_tech_surprise_anim_end);
});

/**
 * todo;
 */
extern("xr_effects.zat_b3_tech_waked_up", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.zat_b3_tech_waked_up);
});

/**
 * todo;
 */
extern("xr_effects.zat_b3_tech_drinked_out", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.zat_b3_tech_drinked_out);
});

/**
 * todo;
 */
extern("xr_effects.pri_a28_kirillov_hq_online", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.pri_a28_kirillov_hq_online);
});

/**
 * todo;
 */
extern("xr_effects.pri_a20_radio_start", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.pri_a20_radio_start);
});

/**
 * todo;
 */
extern("xr_effects.pri_a22_kovalski_speak", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.pri_a22_kovalski_speak);
});

/**
 * todo;
 */
extern("xr_effects.zat_b38_underground_door_open", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.zat_b38_underground_door_open);
});

/**
 * todo;
 */
extern("xr_effects.zat_b38_jump_tonnel_info", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.zat_b38_jump_tonnel_info);
});

/**
 * todo;
 */
extern("xr_effects.jup_a9_cam1_actor_anim_end", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.jup_a9_cam1_actor_anim_end);
});

/**
 * todo;
 */
extern("xr_effects.pri_a28_talk_ssu_video_end", (actor: XR_game_object, npc: XR_game_object): void => {
  giveInfo(infoPortions.pri_a28_talk_ssu_video_end);
});

/**
 * todo;
 */
extern("xr_effects.zat_b33_pic_snag_container", (actor: XR_game_object, npc: XR_game_object): void => {
  if (isActorInZoneWithName(zones.zat_b33_tutor)) {
    give_actor(actor, npc, [quest_items.zat_b33_safe_container]);
    giveInfo(infoPortions.zat_b33_find_package);
    if (!hasAlifeInfo(infoPortions.zat_b33_safe_container)) {
      play_sound(actor, registry.zones.get(zones.zat_b33_tutor), [scriptSounds.pda_news, null, null]);
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.zat_b202_spawn_b33_loot", (actor: XR_game_object, npc: XR_game_object, p: []) => {
  const infoPortionsList = [
    infoPortions.zat_b33_first_item_gived,
    infoPortions.zat_b33_second_item_gived,
    infoPortions.zat_b33_third_item_gived,
    infoPortions.zat_b33_fourth_item_gived,
    infoPortions.zat_b33_fifth_item_gived,
  ] as unknown as LuaArray<TInfoPortion>;

  const item_table = [
    [weapons.wpn_fort_snag],
    [
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
    ],
    [weapons.wpn_ak74u_snag],
    [artefacts.af_soul],
    [helmets.helm_hardhat_snag],
  ] as unknown as LuaArray<LuaArray<string>>;

  for (const [index, infoPortion] of infoPortionsList) {
    const objectId: TStringId = index === 1 || index === 3 ? "jup_b202_stalker_snag" : "jup_b202_snag_treasure";

    if (!hasAlifeInfo(infoPortion)) {
      for (const [l, m] of item_table.get(index)) {
        spawn_object_in(actor, npc, [tostring(m), tostring(objectId)]);
      }
    }
  }
});

/**
 * todo;
 */
extern("xr_effects.pri_a28_check_zones", (): void => {
  const actor: XR_game_object = registry.actor;
  let dist: TDistance = 0;
  let index: TIndex = 0;

  const zonesList: LuaArray<TStringId> = [
    "pri_a28_sr_mono_add_1",
    "pri_a28_sr_mono_add_2",
    "pri_a28_sr_mono_add_3",
  ] as unknown as LuaArray<TStringId>;

  const infoList: LuaArray<TInfoPortion> = [
    infoPortions.pri_a28_wave_1_spawned,
    infoPortions.pri_a28_wave_2_spawned,
    infoPortions.pri_a28_wave_3_spawned,
  ] as unknown as LuaArray<TInfoPortion>;

  const squadsList: LuaArray<TStringId> = [
    "pri_a28_heli_mono_add_1",
    "pri_a28_heli_mono_add_2",
    "pri_a28_heli_mono_add_3",
  ] as unknown as LuaArray<TStringId>;

  for (const [itIndex, it] of zonesList) {
    const storyObjectId: Optional<TNumberId> = getObjectIdByStoryId(it);

    if (storyObjectId) {
      const serverObject: Optional<XR_cse_alife_object> = alife().object(storyObjectId)!;
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

  if (hasAlifeInfo(infoList.get(index))) {
    for (const [k, v] of infoList) {
      if (!hasAlifeInfo(infoList.get(k))) {
        giveInfo(infoList.get(k));
      }
    }
  } else {
    giveInfo(infoList.get(index));
  }

  create_squad(actor, null, [squadsList.get(index), "pri_a28_heli"]);
});

/**
 * todo;
 */
extern("xr_effects.eat_vodka_script", (): void => {
  const actor: XR_game_object = registry.actor;

  if (actor.object("vodka_script") !== null) {
    actor.eat(actor.object("vodka_script")!);
  }
});

const materialsTable: LuaArray<TStringId> = [
  "jup_b200_material_1",
  "jup_b200_material_2",
  "jup_b200_material_3",
  "jup_b200_material_4",
  "jup_b200_material_5",
  "jup_b200_material_6",
  "jup_b200_material_7",
  "jup_b200_material_8",
  "jup_b200_material_9",
] as unknown as LuaArray<TStringId>;

/**
 * todo;
 */
extern("xr_effects.jup_b200_count_found", (actor: XR_game_object): void => {
  let count: TCount = 0;

  for (const [index, materialId] of materialsTable) {
    const materialObject: Optional<XR_game_object> = getObjectByStoryId(materialId);

    if (materialObject !== null) {
      const parent = materialObject.parent();

      if (parent !== null) {
        const parentId: TNumberId = parent.id();

        if (parentId !== MAX_U16 && parentId === actor.id()) {
          count = count + 1;
        }
      }
    }
  }

  count = count + portableStoreGet(actor, "jup_b200_tech_materials_brought_counter", 0);
  portableStoreSet(actor, "jup_b200_tech_materials_found_counter", count);
});
