import { alife_infos } from "@/mod/globals/alife_infos";
import { captions } from "@/mod/globals/captions";
import { levels } from "@/mod/globals/levels";
import { map_mark_type, npc_map_marks } from "@/mod/globals/npc_map_marks";
import { story_ids } from "@/mod/globals/story_ids";
import { AnyCallable, AnyObject, Maybe, Optional } from "@/mod/lib/types";
import { getActor, IStoredObject, storage } from "@/mod/scripts/core/db";
import { AbstractSingletonManager } from "@/mod/scripts/core/utils/AbstractSingletonManager";
import { hasAlifeInfo } from "@/mod/scripts/utils/actor";
import { getConfigString } from "@/mod/scripts/utils/configs";
import { getStoryObjectId } from "@/mod/scripts/utils/ids";
import { LuaLogger } from "@/mod/scripts/utils/logging";

const log: LuaLogger = new LuaLogger("MapDisplayManager");

const primaryMapObjects = [
  { target: story_ids.zat_b55_spot, hint: captions.st_zat_b55_name },
  { target: story_ids.zat_b100_spot, hint: captions.st_zat_b100_name },
  { target: story_ids.zat_b104_spot, hint: captions.st_zat_b104_name },
  { target: story_ids.zat_b38_spot, hint: captions.st_zat_b38_name },
  { target: story_ids.zat_b40_spot, hint: captions.st_zat_b40_name },
  { target: story_ids.zat_b56_spot, hint: captions.st_zat_b56_name },
  { target: story_ids.zat_b5_spot, hint: captions.st_zat_b5_name },
  { target: story_ids.zat_a2_spot, hint: captions.st_zat_a2_name },
  { target: story_ids.zat_b20_spot, hint: captions.st_zat_b20_name },
  { target: story_ids.zat_b53_spot, hint: captions.st_zat_b53_name },
  { target: story_ids.zat_b101_spot, hint: captions.st_zat_b101_name },
  { target: story_ids.zat_b106_spot, hint: captions.st_zat_b106_name },
  { target: story_ids.zat_b7_spot, hint: captions.st_zat_b7_name },
  { target: story_ids.zat_b14_spot, hint: captions.st_zat_b14_name },
  { target: story_ids.zat_b52_spot, hint: captions.st_zat_b52_name },
  { target: story_ids.zat_b39_spot, hint: captions.st_zat_b39_name },
  { target: story_ids.zat_b33_spot, hint: captions.st_zat_b33_name },
  { target: story_ids.zat_b18_spot, hint: captions.st_zat_b18_name },
  { target: story_ids.zat_b54_spot, hint: captions.st_zat_b54_name },
  { target: story_ids.zat_b12_spot, hint: captions.st_zat_b12_name },
  { target: story_ids.zat_b28_spot, hint: captions.st_zat_b28_name },
  { target: story_ids.zat_b103_spot, hint: captions.st_zat_b103_name },

  { target: story_ids.jup_b1_spot, hint: captions.st_jup_b1_name },
  { target: story_ids.jup_b46_spot, hint: captions.st_jup_b46_name },
  { target: story_ids.jup_b202_spot, hint: captions.st_jup_b202_name },
  { target: story_ids.jup_b211_spot, hint: captions.st_jup_b211_name },
  { target: story_ids.jup_b200_spot, hint: captions.st_jup_b200_name },
  { target: story_ids.jup_b19_spot, hint: captions.st_jup_b19_name },
  { target: story_ids.jup_a6_spot, hint: captions.st_jup_a6_name },
  { target: story_ids.jup_b25_spot, hint: captions.st_jup_b25_name },
  { target: story_ids.jup_b6_spot, hint: captions.st_jup_b6_name },
  { target: story_ids.jup_b205_spot, hint: captions.st_jup_b205_name },
  { target: story_ids.jup_b206_spot, hint: captions.st_jup_b206_name },
  { target: story_ids.jup_b32_spot, hint: captions.st_jup_b32_name },
  { target: story_ids.jup_a10_spot, hint: captions.st_jup_a10_name },
  { target: story_ids.jup_b209_spot, hint: captions.st_jup_b209_name },
  { target: story_ids.jup_b208_spot, hint: captions.st_jup_b208_name },
  { target: story_ids.jup_a12_spot, hint: captions.st_jup_a12_name },
  { target: story_ids.jup_b212_spot, hint: captions.st_jup_b212_name },
  { target: story_ids.jup_b9_spot, hint: captions.st_jup_b9_name },
  { target: story_ids.jup_b201_spot, hint: captions.st_jup_b201_name },
  { target: story_ids.jup_a9_spot, hint: captions.st_jup_a9_name },

  { target: story_ids.pri_a28_spot, hint: captions.st_pri_a28_name },
  { target: story_ids.pri_b36_spot, hint: captions.st_pri_b36_name },
  { target: story_ids.pri_b303_spot, hint: captions.st_pri_b303_name },
  { target: story_ids.pri_b301_spot, hint: captions.st_pri_b301_name },
  { target: story_ids.pri_a17_spot, hint: captions.st_pri_a17_name },
  { target: story_ids.pri_b306_spot, hint: captions.st_pri_b306_name },
  { target: story_ids.pri_a16_spot, hint: captions.st_pri_a16_name },
  { target: story_ids.pri_a25_spot, hint: captions.st_pri_a25_name },
  { target: story_ids.pri_b35_spot, hint: captions.st_pri_b35_name },
  { target: story_ids.pri_a21_spot, hint: captions.st_pri_a21_name },
  { target: story_ids.pri_b304_spot, hint: captions.st_pri_b304_name },
  { target: story_ids.pri_a18_spot, hint: captions.st_pri_a18_name }
];

const sleepZones = [
  { target: story_ids.zat_a2_sr_sleep_id, hint: captions.st_ui_pda_sleep_place },
  { target: story_ids.jup_a6_sr_sleep_id, hint: captions.st_ui_pda_sleep_place },
  { target: story_ids.pri_a16_sr_sleep_id, hint: captions.st_ui_pda_sleep_place }
];

const npcMarks = {
  [map_mark_type.trader]: {
    map_location: npc_map_marks.ui_pda2_trader_location,
    hint: captions.st_ui_pda_legend_trader
  },
  [map_mark_type.mechanic]: {
    map_location: npc_map_marks.ui_pda2_mechanic_location,
    hint: captions.st_ui_pda_legend_mechanic
  },
  [map_mark_type.guider]: {
    map_location: npc_map_marks.ui_pda2_scout_location,
    hint: captions.st_ui_pda_legend_scout
  },
  [map_mark_type.quest_npc]: {
    map_location: npc_map_marks.ui_pda2_quest_npc_location,
    hint: captions.st_ui_pda_legend_vip
  },
  [map_mark_type.medic]: {
    map_location: npc_map_marks.ui_pda2_medic_location,
    hint: captions.st_ui_pda_legend_medic
  }
};

const changeObjects = [
  {
    target: story_ids.jup_b32_spot,
    hint: captions.st_jup_b32_name,
    zone: "jup_b32_anomal_zone",
    group: alife_infos.jup_b32_scanner_1_placed,
    enabled: false
  },
  {
    target: story_ids.jup_b201_spot,
    hint: captions.st_jup_b201_name,
    zone: "jup_b201_anomal_zone",
    group: alife_infos.jup_b32_scanner_2_placed,
    enabled: false
  },
  {
    target: story_ids.jup_b209_spot,
    hint: captions.st_jup_b209_name,
    zone: "jup_b209_anomal_zone",
    group: alife_infos.jup_b32_scanner_3_placed,
    enabled: false
  },
  {
    target: story_ids.jup_b211_spot,
    hint: captions.st_jup_b211_name,
    zone: "jup_b211_anomal_zone",
    group: alife_infos.jup_b32_scanner_4_placed,
    enabled: false
  },
  {
    target: story_ids.jup_b1_spot,
    hint: captions.st_jup_b1_name,
    zone: "jup_b10_anomal_zone",
    group: alife_infos.jup_b32_scanner_5_placed,
    enabled: false
  }
];

export class MapDisplayManager extends AbstractSingletonManager {
  public static readonly DISTANCE_TO_SHOW_MAP_MARKS: number = 75;
  public static readonly UPDATES_THROTTLE: number = 10_000;

  public isInitialized: boolean = false;
  public lastUpdateAt: number = 0;

  public updateNpcSpot(npc: XR_game_object, scheme: string, st: any, section: string): void {
    log.info("Update npc spot:", npc.name());

    const npcId: number = npc.id();
    const sim: XR_alife_simulator = alife();
    const xrLogic: AnyObject = get_global("xr_logic");

    if (!sim) {
      return;
    }

    let spot_section;

    if (scheme == null || scheme == "nil") {
      spot_section = getConfigString(st.ini, st.section_logic, "show_spot", npc, false, "");
    } else {
      spot_section = getConfigString(st.ini, section, "show_spot", npc, false, "");
    }

    if (spot_section === null) {
      spot_section = "true";
    }

    const actor: XR_game_object = getActor()!;
    let map_spot: Optional<string> = getConfigString(st.ini, st.section_logic, "level_spot", npc, false, "");

    if (map_spot == null) {
      map_spot = getConfigString(st.ini, section, "level_spot", npc, false, "");
    }

    if (map_spot !== null) {
      map_spot = (xrLogic.parse_condlist as AnyCallable)(npc, section, "level_spot", map_spot);
      map_spot = (xrLogic.pick_section_from_condlist as AnyCallable)(actor, npc, map_spot);
    }

    const spot_condlist = (xrLogic.parse_condlist as AnyCallable)(npc, section, "show_spot", spot_section);
    const spot: string = (xrLogic.pick_section_from_condlist as AnyCallable)(actor, npc, spot_condlist);
    const obj: Optional<IXR_cse_alife_object> = sim.object(npc.id());

    if (obj?.online) {
      obj.visible_for_map(spot !== "false");

      if (map_spot !== null) {
        const descriptor = npcMarks[map_spot];

        if (level.map_has_object_spot(npcId, descriptor.map_location) !== 0) {
          level.map_remove_object_spot(npcId, descriptor.map_location);
        }

        if (actor && npc && npc.general_goodwill(actor) > -1000) {
          level.map_add_object_spot(npcId, descriptor.map_location, descriptor.hint);
        }
      } else {
        Object.values(npc_map_marks).forEach((it) => {
          if (level.map_has_object_spot(npcId, it) !== 0) {
            level.map_remove_object_spot(npcId, it);
          }
        });
      }
    }
  }

  public removeNpcSpot(npc: XR_game_object, st: any): void {
    log.info("Remove npc spot:", npc.name());

    const sim: XR_alife_simulator = alife();

    if (!sim) {
      return;
    }

    const npcId: Maybe<number> = sim.object(npc.id())?.id;
    let map_spot: Optional<string> = getConfigString(st.ini, st.section_logic, "level_spot", npc, false, "");

    // todo: Retry, probably not needed at all.
    if (map_spot === null) {
      map_spot = getConfigString(st.ini, st.active_section, "level_spot", npc, false, "");
    }

    if (map_spot !== null) {
      const xrLogic = get_global("xr_logic");
      const actor: XR_game_object = getActor()!;

      map_spot = (xrLogic.parse_condlist as AnyCallable)(npc, st.active_section, "level_spot", map_spot);
      map_spot = (xrLogic.pick_section_from_condlist as AnyCallable)(actor, npc, map_spot);
    }

    if (npcId && map_spot !== "" && map_spot !== null) {
      const descriptor = npcMarks[map_spot];

      if (level.map_has_object_spot(npcId, descriptor.map_location) !== 0) {
        level.map_remove_object_spot(npcId, descriptor.map_location);
      }
    }
  }

  public fillPrimaryObjects(): void {
    log.info("Fill primary objects");

    primaryMapObjects.forEach((it) => {
      const objectId: Optional<number> = getStoryObjectId(it.target);

      if (objectId) {
        level.map_add_object_spot(objectId, "primary_object", it.hint);
      }
    });

    this.updateAnomaliesZones();
    this.fillSleepZones();
  }

  public fillSleepZones(): void {
    sleepZones.forEach((it) => {
      const objectId: Optional<number> = getStoryObjectId(it.target);
      const storedObject: Optional<IStoredObject> = objectId ? storage.get(objectId) : null;

      if (objectId && storedObject && storedObject.object) {
        const actorPosition: XR_vector = getActor()!.position();
        const distanceFromActor: number = storedObject.object.position().distance_to(actorPosition);
        const hasSleepSpot: boolean =
          level.map_has_object_spot(objectId, npc_map_marks.ui_pda2_actor_sleep_location) !== 0;

        if (distanceFromActor <= MapDisplayManager.DISTANCE_TO_SHOW_MAP_MARKS && !hasSleepSpot) {
          level.map_add_object_spot(objectId, npc_map_marks.ui_pda2_actor_sleep_location, it.hint);
        } else if (distanceFromActor > MapDisplayManager.DISTANCE_TO_SHOW_MAP_MARKS && hasSleepSpot) {
          level.map_remove_object_spot(objectId, npc_map_marks.ui_pda2_actor_sleep_location);
        }
      }
    });
  }

  public updateAnomaliesZones(): void {
    if (hasAlifeInfo(alife_infos.jup_b32_scanner_reward)) {
      changeObjects.forEach((it) => {
        if (hasAlifeInfo(it.group)) {
          it.enabled = true;
        }
      });
    }

    /**
     * Update artefacts loot display in zones with artefacts.
     * Works for jupiter only.
     */
    if (level.name() === levels.jupiter) {
      for (const [k, v] of pairs(changeObjects as LuaIterable<number, any>)) {
        if (v.enabled) {
          const objectId: Optional<number> = getStoryObjectId(v.target);

          let hint: string = game.translate_string(v.hint) + "\\n" + " \\n";
          const actor: XR_game_object = getActor()!;
          const [has_af, af_table] = get_global("xr_conditions").anomaly_has_artefact(actor, null, [v.zone]);

          if (has_af) {
            hint = hint + game.translate_string(captions.st_jup_b32_has_af);
            for (const [k, v] of pairs(af_table as LuaIterable<string, any>)) {
              hint = hint + "\\n" + game.translate_string("st_" + v + "_name");
            }
          } else {
            hint = hint + game.translate_string(captions.st_jup_b32_no_af);
          }

          /**
           * Add artifacts info in hotspots.
           */
          if (objectId && level.map_has_object_spot(objectId, "primary_object") !== 0) {
            level.map_remove_object_spot(objectId, "primary_object");
            level.map_add_object_spot(objectId, "primary_object", hint);
          }
        }
      }
    }
  }

  public update(): void {
    const now: number = time_global();

    if (!this.isInitialized) {
      this.fillPrimaryObjects();
      this.isInitialized = true;
    }

    if (now - this.lastUpdateAt >= MapDisplayManager.UPDATES_THROTTLE) {
      this.fillSleepZones();
      this.lastUpdateAt = now;
    }
  }
}

export const mapDisplayManager: MapDisplayManager = MapDisplayManager.getInstance() as MapDisplayManager;
