import { IAnimationDescriptor } from "@/engine/core/objects/animation/types/animation_types";
import { EStalkerState } from "@/engine/core/objects/animation/types/state_types";
import { finishCorpseLooting } from "@/engine/core/schemes/stalker/corpse_detection/utils";
import { finishObjectHelpWounded } from "@/engine/core/schemes/stalker/help_wounded/utils";
import { clearObjectAbuse } from "@/engine/core/schemes/stalker/meet/utils";
import { objectPunchActor } from "@/engine/core/utils/action";
import { createSequence } from "@/engine/core/utils/animation";
import { getExtern } from "@/engine/core/utils/binding";
import { startPlayingGuitar, startPlayingHarmonica } from "@/engine/core/utils/camp";
import { misc } from "@/engine/lib/constants/items/misc";
import { AnyCallablesModule, GameObject, TName } from "@/engine/lib/types";

/**
 * List of base animations for usage in stalkers logic.
 */
export const baseAnimations: LuaTable<TName, IAnimationDescriptor> = $fromObject<TName, IAnimationDescriptor>({
  [EStalkerState.IDLE]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: null,
    out: null,
    idle: createSequence(
      "idle_0_idle_1",
      "idle_1_idle_1",
      "idle_2_idle_1",
      "idle_3_idle_1",
      "idle_4_idle_1",
      null,
      null,
      null,
      "idle_8_idle_1",
      "idle_2_idle_1",
      "idle_10_idle_1"
    ),
    rnd: createSequence(
      ["idle_0_idle_0", "idle_0_idle_2", "idle_0_idle_3", "idle_0_idle_4"],
      ["idle_1_idle_0", "idle_1_idle_2", "idle_1_idle_3", "idle_1_idle_4"],
      ["idle_2_idle_0", "idle_2_idle_2", "idle_2_idle_3", "idle_2_idle_4"],
      ["idle_3_idle_0", "idle_3_idle_2", "idle_3_idle_3", "idle_3_idle_4"],
      ["idle_4_idle_0", "idle_4_idle_2", "idle_4_idle_3", "idle_4_idle_4"],
      null,
      null,
      null,
      ["idle_8_idle_0", "idle_8_idle_2", "idle_8_idle_3", "idle_8_idle_4"],
      ["idle_2_idle_0", "idle_2_idle_2", "idle_2_idle_3", "idle_2_idle_4"],
      ["idle_10_idle_0", "idle_10_idle_2", "idle_10_idle_3", "idle_10_idle_4"]
    ),
  },
  [EStalkerState.IDLE_CHASOVOY]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: null,
    out: null,
    idle: createSequence(
      "idle_0_idle_1",
      "idle_1_idle_1",
      "idle_2_idle_1",
      "idle_3_idle_1",
      "idle_4_idle_1",
      null,
      null,
      null,
      "idle_8_idle_1",
      "idle_2_idle_1",
      "idle_10_idle_1"
    ),
    rnd: createSequence(
      ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      null,
      null,
      null,
      ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"],
      ["chasovoy_0", "chasovoy_1", "chasovoy_2", "chasovoy_3", "chasovoy_4"]
    ),
  },
  [EStalkerState.CAUTION]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      ["prisluh_0_in"],
      ["prisluh_1_in"],
      ["prisluh_2_in"],
      ["prisluh_3_in"],
      ["prisluh_4_in"],
      null,
      null,
      null,
      ["prisluh_8_in"],
      ["prisluh_9_in"],
      ["prisluh_10_in"]
    ),
    out: createSequence(
      ["prisluh_0_out"],
      ["prisluh_1_out"],
      ["prisluh_2_out"],
      ["prisluh_3_out"],
      ["prisluh_4_out"],
      null,
      null,
      null,
      ["prisluh_8_out"],
      ["prisluh_9_out"],
      ["prisluh_10_out"]
    ),
    idle: createSequence(
      "prisluh_0_1",
      "prisluh_1_1",
      "prisluh_2_1",
      "prisluh_3_1",
      "prisluh_4_1",
      null,
      null,
      null,
      "prisluh_8_1",
      "prisluh_9_1",
      "prisluh_10_1"
    ),
    rnd: createSequence(
      ["prisluh_0_0", "prisluh_0_2"],
      ["prisluh_1_0", "prisluh_1_2"],
      ["prisluh_2_0", "prisluh_2_2"],
      ["prisluh_3_0", "prisluh_3_2"],
      ["prisluh_4_0", "prisluh_4_2"],
      null,
      null,
      null,
      ["prisluh_8_0", "prisluh_8_2"],
      ["prisluh_9_0", "prisluh_9_2"],
      ["prisluh_10_0", "prisluh_10_2"]
    ),
  },
  [EStalkerState.POISK]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: null,
    out: null,
    idle: createSequence(
      "poisk_0_idle_1",
      "poisk_1_idle_1",
      "poisk_2_idle_1",
      "poisk_3_idle_1",
      "poisk_4_idle_1",
      null,
      null,
      null,
      "poisk_8_idle_1",
      "poisk_9_idle_1",
      "poisk_10_idle_1"
    ),
    rnd: createSequence(
      ["poisk_0_idle_0", "poisk_0_idle_2"],
      ["poisk_1_idle_0", "poisk_1_idle_2"],
      ["poisk_2_idle_0", "poisk_2_idle_2"],
      ["poisk_3_idle_0", "poisk_3_idle_2"],
      ["poisk_4_idle_0", "poisk_4_idle_2"],
      null,
      null,
      null,
      ["poisk_8_idle_0", "poisk_8_idle_2"],
      ["poisk_9_idle_0", "poisk_9_idle_2"],
      ["poisk_10_idle_0", "poisk_10_idle_2"]
    ),
  },
  [EStalkerState.STOOP_NO_WEAP]: {
    prop: {
      maxidle: 2,
      sumidle: 1,
      rnd: 80,
      moving: null,
    },
    into: null,
    out: null,
    idle: createSequence("poisk_0_idle_0"),
    rnd: null,
  },
  [EStalkerState.HIDE]: {
    prop: {
      maxidle: 5,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence(
      ["cr_idle_0_in"],
      ["cr_idle_1_in"],
      ["cr_idle_2_in"],
      ["cr_idle_3_in"],
      ["cr_idle_4_in"],
      null,
      null,
      null,
      ["cr_idle_8_in"],
      ["cr_idle_9_in"],
      ["cr_idle_10_in"]
    ),
    out: createSequence(
      ["cr_idle_0_out"],
      ["cr_idle_1_out"],
      ["cr_idle_2_out"],
      ["cr_idle_3_out"],
      ["cr_idle_4_out"],
      null,
      null,
      null,
      ["cr_idle_8_out"],
      ["cr_idle_9_out"],
      ["cr_idle_10_out"]
    ),
    idle: createSequence(
      "cr_idle_0_1",
      "cr_idle_1_1",
      "cr_idle_2_1",
      "cr_idle_3_1",
      "cr_idle_4_1",
      null,
      null,
      null,
      "cr_idle_8_1",
      "cr_idle_9_1",
      "cr_idle_10_1"
    ),
    rnd: createSequence(
      ["cr_idle_0_0", "cr_idle_0_2"],
      ["cr_idle_1_0", "cr_idle_1_2"],
      ["cr_idle_2_0", "cr_idle_2_2"],
      ["cr_idle_3_0", "cr_idle_3_2"],
      ["cr_idle_4_0", "cr_idle_4_2"],
      null,
      null,
      null,
      ["cr_idle_8_0", "cr_idle_8_2"],
      ["cr_idle_9_0", "cr_idle_9_2"],
      ["cr_idle_10_0", "cr_idle_10_2"]
    ),
  },
  [EStalkerState.PLAY_GUITAR]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence([
      "sit_1_guitar_0_0",
      { a: "guitar_a" },
      {
        f: (object: GameObject) => {
          startPlayingGuitar(object);
        },
      },
      "sit_1_guitar_0_1",
    ]),
    out: createSequence(["guitar_0_sit_1_0", { d: "guitar_a" }, "guitar_0_sit_1_1"]),
    idle: createSequence("guitar_0"),
    rnd: null,
  },
  [EStalkerState.PLAY_HARMONICA]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 80,
      moving: null,
    },
    into: createSequence([
      "sit_2_harmonica_1_0",
      { a: "harmonica_a" },
      {
        f: (object: GameObject) => {
          startPlayingHarmonica(object);
        },
      },
      "sit_2_harmonica_1_1",
    ]),
    out: createSequence(["harmonica_1_sit_2_0", { d: "harmonica_a" }, "harmonica_1_sit_2_1"]),
    idle: createSequence("harmonica_0"),
    rnd: null,
  },
  [EStalkerState.HELLO]: {
    prop: {
      maxidle: 5,
      sumidle: 5,
      rnd: 100,
      moving: null,
    },
    into: null,
    out: null,
    idle: null,
    rnd: createSequence(
      ["hello_0_idle_0"],
      ["hello_1_idle_0"],
      ["hello_2_idle_0"],
      ["hello_3_idle_0"],
      ["hello_4_idle_0"],
      null,
      null,
      null,
      ["hello_8_idle_0"],
      ["hello_9_idle_0"],
      ["hello_10_idle_0"]
    ),
  },
  [EStalkerState.REFUSE]: {
    prop: {
      maxidle: 3,
      sumidle: 3,
      rnd: 100,
      moving: null,
    },
    into: null,
    out: null,
    idle: null,
    rnd: createSequence(
      ["net_0_0"],
      ["net_1_0"],
      ["net_2_0"],
      ["net_3_0"],
      ["net_4_0"],
      null,
      null,
      null,
      ["net_8_0"],
      ["net_9_0"],
      ["net_10_0"]
    ),
  },
  [EStalkerState.CLAIM]: {
    prop: {
      maxidle: 5,
      sumidle: 2,
      rnd: 100,
      moving: null,
    },
    into: null,
    out: null,
    idle: null,
    rnd: createSequence(
      null,
      ["gop_stop_1_0"],
      ["gop_stop_2_0"],
      ["gop_stop_3_0"],
      ["gop_stop_4_0"],
      null,
      null,
      null,
      ["gop_stop_8_0"],
      ["gop_stop_9_0"],
      ["gop_stop_10_0"]
    ),
  },
  [EStalkerState.BACKOFF]: {
    prop: {
      maxidle: 5,
      sumidle: 2,
      rnd: 100,
      moving: null,
    },
    into: null,
    out: null,
    idle: null,
    rnd: createSequence(
      ["uhodi_1_0", "uhodi_1_1"],
      ["uhodi_1_0", "uhodi_1_1"],
      ["uhodi_2_0", "uhodi_2_1"],
      ["uhodi_3_0", "uhodi_3_1"],
      ["uhodi_4_0", "uhodi_4_1"],
      null,
      null,
      null,
      ["uhodi_8_0", "uhodi_8_1"],
      ["uhodi_9_0", "uhodi_9_1"],
      ["uhodi_10_0", "uhodi_10_1"]
    ),
  },
  [EStalkerState.PUNCH]: {
    prop: {
      maxidle: 5,
      sumidle: 2,
      rnd: 100,
      moving: null,
    },
    into: createSequence(
      [
        "norm_facer_0_0",
        { f: (object: GameObject) => objectPunchActor(object) },
        "norm_facer_0_1",
        { f: (object: GameObject) => clearObjectAbuse(object) },
      ],
      [
        "norm_facer_1_0",
        { f: (object: GameObject) => objectPunchActor(object) },
        "norm_facer_1_1",
        { f: (object: GameObject) => clearObjectAbuse(object) },
      ],
      [
        "norm_facer_2_0",
        { f: (object: GameObject) => objectPunchActor(object) },
        "norm_facer_2_1",
        { f: (object: GameObject) => clearObjectAbuse(object) },
      ],
      [
        "norm_facer_3_0",
        { f: (object: GameObject) => objectPunchActor(object) },
        "norm_facer_3_1",
        { f: (object: GameObject) => clearObjectAbuse(object) },
      ],
      [
        "norm_facer_4_0",
        { f: (object: GameObject) => objectPunchActor(object) },
        "norm_facer_4_1",
        { f: (object: GameObject) => clearObjectAbuse(object) },
      ],
      null,
      null,
      null,
      [
        "norm_facer_8_0",
        { f: (object: GameObject) => objectPunchActor(object) },
        "norm_facer_8_1",
        { f: (object: GameObject) => clearObjectAbuse(object) },
      ],
      [
        "norm_facer_9_0",
        { f: (object: GameObject) => objectPunchActor(object) },
        "norm_facer_9_1",
        { f: (object: GameObject) => clearObjectAbuse(object) },
      ],
      [
        "norm_facer_10_0",
        { f: (object: GameObject) => objectPunchActor(object) },
        "norm_facer_10_1",
        { f: (object: GameObject) => clearObjectAbuse(object) },
      ]
    ),
    out: null,
    idle: null,
    rnd: null,
  },
  [EStalkerState.SLEEPING]: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["idle_0_to_sit_0", "sit_to_sleep_0"]),
    out: createSequence(["sleep_to_sit_0", "sit_0_to_idle_0"]),
    idle: createSequence("sleep_idle_0"),
    rnd: createSequence(["sleep_idle_1"]),
  },
  [EStalkerState.WOUNDED]: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 70,
      moving: null,
    },
    into: createSequence(["idle_to_wounded_0"]),
    out: createSequence(["wounded_to_idle_0"]),
    idle: createSequence("wounded_idle_0"),
    rnd: null,
  },
  [EStalkerState.WOUNDED_HEAVY_1]: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 70,
      moving: null,
    },
    into: createSequence(["idle_to_wounded_1"]),
    out: createSequence(["waunded_1_out"]),
    idle: createSequence("waunded_1_idle_0"),
    rnd: null,
  },
  [EStalkerState.WOUNDED_HEAVY_2]: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 70,
      moving: null,
    },
    into: createSequence(["idle_to_wounded_2"]),
    out: createSequence(["wounded_2_out"]),
    idle: createSequence("wounded_2_idle_0"),
    rnd: null,
  },
  [EStalkerState.WOUNDED_HEAVY_3]: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 70,
      moving: null,
    },
    into: createSequence(["idle_to_wounded_3"]),
    out: createSequence(["wounded_3_out"]),
    idle: createSequence("wounded_3_idle_0"),
    rnd: null,
  },
  [EStalkerState.WOUNDED_ZOMBIE]: {
    prop: {
      maxidle: 5,
      sumidle: 10,
      rnd: 70,
      moving: null,
    },
    into: createSequence(["idle_to_wounded_0"]),
    out: createSequence(["wounded_to_idle_0"]),
    idle: createSequence("wounded_idle_0"),
    rnd: createSequence(["wounded_idle_1"]),
  },
  [EStalkerState.CHOOSING]: {
    prop: {
      maxidle: 8,
      sumidle: 10,
      rnd: 80,
      moving: null,
    },
    into: null,
    out: null,
    idle: null,
    rnd: createSequence(["komandir_0", "komandir_1", "komandir_2"]),
  },
  [EStalkerState.PRESS]: {
    prop: {
      maxidle: 8,
      sumidle: 10,
      rnd: 80,
      moving: null,
    },
    into: createSequence(["knopka_0"]),
    out: createSequence(["knopka_1"]),
    idle: createSequence("knopka_2"),
    rnd: null,
  },
  [EStalkerState.WARDING]: {
    prop: {
      maxidle: 10,
      sumidle: 10,
      rnd: 0,
      moving: null,
    },
    into: createSequence(["ohrana_0"]),
    out: createSequence(["ohrana_2"]),
    idle: createSequence("ohrana_1"),
    rnd: null,
  },
  [EStalkerState.WARDING_SHORT]: {
    prop: {
      maxidle: 10,
      sumidle: 10,
      rnd: 0,
      moving: null,
    },
    into: createSequence(["ohrana_0"]),
    out: createSequence(["ohrana_2"]),
    idle: createSequence("ohrana_1_short"),
    rnd: null,
  },
  [EStalkerState.FOLD_ARMS]: {
    prop: {
      maxidle: 10,
      sumidle: 10,
      rnd: 0,
      moving: null,
    },
    into: null,
    out: null,
    idle: createSequence("cut_scene_idle_0"),
    rnd: null,
  },
  [EStalkerState.TALK_DEFAULT]: {
    prop: {
      maxidle: 5,
      sumidle: 5,
      rnd: 70,
      moving: null,
    },
    into: createSequence(null, null, ["norm_talk_2_in_0"]),
    out: createSequence(null, null, ["norm_talk_2_out_0"]),
    idle: createSequence("idle_0_idle_1", null, "norm_talk_2_idle_1"),
    rnd: createSequence(["idle_0_idle_0"], null, [
      "norm_talk_2_idle_0",
      "norm_talk_2_idle_2",
      "norm_talk_2_idle_3",
      "norm_talk_2_idle_4",
    ]),
  },
  [EStalkerState.BINOCULAR]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["binoculars_draw_0", { a: "wpn_binoc" }, "binoculars_draw_1", "binoculars_zoom_in_0"]),
    out: createSequence(["binoculars_zoom_out_0", "binoculars_hide_0", { d: "wpn_binoc" }, "binoculars_hide_1"]),
    idle: createSequence("binoculars_zoom_idle_0"),
    rnd: createSequence([
      "binoculars_zoom_idle_1",
      "binoculars_zoom_idle_2",
      "binoculars_zoom_idle_3",
      "binoculars_zoom_idle_4",
    ]),
  },
  [EStalkerState.SALUT]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["chest_0_idle_0", "chest_0_idle_2"]),
    out: createSequence(["chest_0_idle_3"]),
    idle: createSequence("chest_0_idle_1"),
    rnd: null,
  },
  [EStalkerState.SALUT_FREE]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["chest_1_idle_0"]),
    out: null,
    idle: null,
    rnd: null,
  },
  [EStalkerState.HANDS_UP]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: null,
    out: null,
    idle: createSequence("hand_up_0"),
    rnd: null,
  },
  [EStalkerState.TRANS_0]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["idle_0_to_trans_0"]),
    out: createSequence(["trans_0_to_idle_0"]),
    idle: createSequence("trans_0_idle_0"),
    rnd: null,
  },
  [EStalkerState.TRANS_1]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["idle_0_to_trans_1"]),
    out: createSequence(["trans_1_to_idle_0"]),
    idle: createSequence("trans_1_idle_0"),
    rnd: null,
  },
  [EStalkerState.TRANS_ZOMBIED]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: null,
    out: null,
    idle: createSequence("trans_0_idle_1"),
    rnd: createSequence([
      "trans_0_idle_0",
      "trans_0_idle_2",
      "trans_0_idle_3",
      "trans_0_idle_4",
      "trans_0_idle_5",
      "trans_0_idle_6",
    ]),
  },
  [EStalkerState.PROBE_STAND]: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: null,
    },
    into: createSequence([
      "metering_anomalys_0_draw_0",
      { f: (...args: Array<any>) => getExtern<AnyCallablesModule>("xr_effects").get_best_detector(...args) },
      "metering_anomalys_0_draw_1",
    ]),
    out: createSequence([
      "metering_anomalys_0_hide_0",
      { f: (...args: Array<any>) => getExtern<AnyCallablesModule>("xr_effects").hide_best_detector(...args) },
      "metering_anomalys_0_hide_1",
    ]),
    idle: createSequence("metering_anomalys_0_idle_0"),
    rnd: createSequence([
      "metering_anomalys_0_idle_1",
      "metering_anomalys_0_idle_2",
      "metering_anomalys_0_idle_3",
      "metering_anomalys_0_idle_4",
      "metering_anomalys_0_idle_5",
    ]),
  },
  [EStalkerState.PROBE_WAY]: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: null,
    },
    into: createSequence([
      "metering_anomalys_0_draw_0",
      { f: (...args: Array<any>) => getExtern<AnyCallablesModule>("xr_effects").get_best_detector(...args) },
      "metering_anomalys_0_draw_1",
      "metering_anomalys_0_idle_6",
    ]),
    out: createSequence([
      "metering_anomalys_0_hide_0",
      { f: (...args: Array<any>) => getExtern<AnyCallablesModule>("xr_effects").hide_best_detector(...args) },
      "metering_anomalys_0_hide_1",
    ]),
    idle: createSequence("metering_anomalys_0_idle_0"),
    rnd: null,
  },
  [EStalkerState.PROBE_CROUCH]: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: null,
    },
    into: createSequence([
      "metering_anomalys_1_draw_0",
      { f: (...args: Array<any>) => getExtern<AnyCallablesModule>("xr_effects").get_best_detector(...args) },
      "metering_anomalys_1_draw_1",
    ]),
    out: createSequence([
      "metering_anomalys_1_hide_0",
      { f: (...args: Array<any>) => getExtern<AnyCallablesModule>("xr_effects").hide_best_detector(...args) },
      "metering_anomalys_1_hide_1",
    ]),
    idle: createSequence("metering_anomalys_1_idle_0"),
    rnd: createSequence([
      "metering_anomalys_1_idle_1",
      "metering_anomalys_1_idle_2",
      "metering_anomalys_1_idle_3",
      "metering_anomalys_1_idle_4",
    ]),
  },
  [EStalkerState.SCANER_STAND]: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["metering_anomalys_0_draw_0", { a: "anomaly_scaner" }, "metering_anomalys_0_draw_1"]),
    out: createSequence(["metering_anomalys_0_hide_0", { d: "anomaly_scaner" }, "metering_anomalys_0_hide_1"]),
    idle: createSequence("metering_anomalys_0_idle_0"),
    rnd: createSequence([
      "metering_anomalys_0_idle_1",
      "metering_anomalys_0_idle_2",
      "metering_anomalys_0_idle_3",
      "metering_anomalys_0_idle_4",
      "metering_anomalys_0_idle_5",
    ]),
  },
  [EStalkerState.SCANER_WAY]: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      moving: null,
      rnd: 100,
    },
    into: createSequence([
      "metering_anomalys_0_draw_0",
      { a: "anomaly_scaner" },
      "metering_anomalys_0_draw_1",
      "metering_anomalys_0_idle_6",
    ]),
    out: createSequence(["metering_anomalys_0_hide_0", { d: "anomaly_scaner" }, "metering_anomalys_0_hide_1"]),
    idle: createSequence("metering_anomalys_0_idle_0"),
    rnd: null,
  },
  [EStalkerState.SCANER_CROUCH]: {
    prop: {
      maxidle: 0,
      sumidle: 0,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["metering_anomalys_1_draw_0", { a: "anomaly_scaner" }, "metering_anomalys_1_draw_1"]),
    out: createSequence(["metering_anomalys_1_hide_0", { d: "anomaly_scaner" }, "metering_anomalys_1_hide_1"]),
    idle: createSequence("metering_anomalys_1_idle_0"),
    rnd: createSequence([
      "metering_anomalys_1_idle_1",
      "metering_anomalys_1_idle_2",
      "metering_anomalys_1_idle_3",
      "metering_anomalys_1_idle_4",
    ]),
  },
  [EStalkerState.PRISONER]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["prisoner_0_sit_down_0"]),
    out: createSequence(["prisoner_0_stand_up_0"]),
    idle: createSequence("prisoner_0_sit_idle_0"),
    rnd: null,
  },
  [EStalkerState.RACIYA]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence(
      ["raciya_0_draw_0", { a: "hand_radio" }, "raciya_0_draw_1"],
      ["raciya_1_draw_0", { a: "hand_radio" }, "raciya_1_draw_1"],
      ["raciya_2_draw_0", { a: "hand_radio" }, "raciya_2_draw_1"],
      ["raciya_3_draw_0", { a: "hand_radio" }, "raciya_3_draw_1"],
      ["raciya_4_draw_0", { a: "hand_radio" }, "raciya_4_draw_1"],
      null,
      null,
      null,
      ["raciya_8_draw_0", { a: "hand_radio" }, "raciya_8_draw_1"],
      ["raciya_9_draw_0", { a: "hand_radio" }, "raciya_9_draw_1"],
      ["raciya_10_draw_0", { a: "hand_radio" }, "raciya_10_draw_1"]
    ),
    out: createSequence(
      ["raciya_0_hide_0", { d: "hand_radio" }, "raciya_0_hide_1"],
      ["raciya_1_hide_0", { d: "hand_radio" }, "raciya_1_hide_1"],
      ["raciya_2_hide_0", { d: "hand_radio" }, "raciya_2_hide_1"],
      ["raciya_3_hide_0", { d: "hand_radio" }, "raciya_3_hide_1"],
      ["raciya_4_hide_0", { d: "hand_radio" }, "raciya_4_hide_1"],
      null,
      null,
      null,
      ["raciya_8_hide_0", { d: "hand_radio" }, "raciya_8_hide_1"],
      ["raciya_9_hide_0", { d: "hand_radio" }, "raciya_9_hide_1"],
      ["raciya_10_hide_0", { d: "hand_radio" }, "raciya_10_hide_1"]
    ),
    idle: createSequence(
      "raciya_0_idle_0",
      "raciya_1_idle_0",
      "raciya_2_idle_0",
      "raciya_3_idle_0",
      "raciya_4_idle_0",
      null,
      null,
      null,
      "raciya_8_idle_0",
      "raciya_9_idle_0",
      "raciya_10_idle_0"
    ),
    rnd: createSequence(
      ["raciya_0_talk_0"],
      ["raciya_1_talk_0"],
      ["raciya_2_talk_0"],
      ["raciya_3_talk_0"],
      ["raciya_4_talk_0"],
      null,
      null,
      null,
      ["raciya_8_talk_0"],
      ["raciya_9_talk_0"],
      ["raciya_10_talk_0"]
    ),
  },
  [EStalkerState.CR_RACIYA]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence(
      ["cr_raciya_0_draw_0", { a: "hand_radio" }, "cr_raciya_0_draw_1"],
      ["cr_raciya_1_draw_0", { a: "hand_radio" }, "cr_raciya_1_draw_1"],
      ["cr_raciya_2_draw_0", { a: "hand_radio" }, "cr_raciya_2_draw_1"],
      ["cr_raciya_3_draw_0", { a: "hand_radio" }, "cr_raciya_3_draw_1"],
      ["cr_raciya_4_draw_0", { a: "hand_radio" }, "cr_raciya_4_draw_1"],
      null,
      null,
      null,
      ["cr_raciya_8_draw_0", { a: "hand_radio" }, "cr_raciya_8_draw_1"],
      ["cr_raciya_9_draw_0", { a: "hand_radio" }, "cr_raciya_9_draw_1"],
      ["cr_raciya_10_draw_0", { a: "hand_radio" }, "cr_raciya_10_draw_1"]
    ),
    out: createSequence(
      ["cr_raciya_0_hide_0", { d: "hand_radio" }, "cr_raciya_0_hide_1"],
      ["cr_raciya_1_hide_0", { d: "hand_radio" }, "cr_raciya_1_hide_1"],
      ["cr_raciya_2_hide_0", { d: "hand_radio" }, "cr_raciya_2_hide_1"],
      ["cr_raciya_3_hide_0", { d: "hand_radio" }, "cr_raciya_3_hide_1"],
      ["cr_raciya_4_hide_0", { d: "hand_radio" }, "cr_raciya_4_hide_1"],
      null,
      null,
      null,
      ["cr_raciya_8_hide_0", { d: "hand_radio" }, "cr_raciya_8_hide_1"],
      ["cr_raciya_9_hide_0", { d: "hand_radio" }, "cr_raciya_9_hide_1"],
      ["cr_raciya_10_hide_0", { d: "hand_radio" }, "cr_raciya_10_hide_1"]
    ),
    idle: createSequence(
      "cr_raciya_0_idle_0",
      "cr_raciya_1_idle_0",
      "cr_raciya_2_idle_0",
      "cr_raciya_3_idle_0",
      "cr_raciya_4_idle_0",
      "cr_raciya_8_idle_0",
      "cr_raciya_9_idle_0",
      "cr_raciya_10_idle_0"
    ),
    rnd: createSequence(
      ["cr_raciya_0_talk_0"],
      ["cr_raciya_1_talk_0"],
      ["cr_raciya_2_talk_0"],
      ["cr_raciya_3_talk_0"],
      ["cr_raciya_4_talk_0"],
      ["cr_raciya_8_talk_0"],
      ["cr_raciya_9_talk_0"],
      ["cr_raciya_10_talk_0"]
    ),
  },
  [EStalkerState.PSY_ARMED]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["idle_0_to_psy_0_idle_0"], ["idle_0_to_psy_1_idle_0"]),
    out: createSequence(["psy_0_idle_0_to_idle_0"], ["psy_1_idle_0_to_idle_0"]),
    idle: createSequence("psy_0_idle_0", "psy_1_idle_0"),
    rnd: createSequence(
      ["psy_0_idle_1", "psy_0_idle_2", "psy_0_idle_3"],
      ["psy_1_idle_1", "psy_1_idle_2", "psy_1_idle_3"]
    ),
  },
  [EStalkerState.PSY_SHOOT]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence(["psy_1_shot_0", { sh: 1000 }]),
    out: null,
    idle: createSequence("psy_1_death_0"),
    rnd: null,
  },
  [EStalkerState.LAY_ON_BED]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequence(["cut_scene_0_actor"]),
    out: null,
    idle: null,
    rnd: null,
  },
  [EStalkerState.SEARCH_CORPSE]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence([
      "dinamit_1",
      {
        // When animation ends, loot everything from an object.
        f: (object: GameObject) => finishCorpseLooting(object),
      },
    ]),
    out: null,
    rnd: null,
    idle: null,
  },
  [EStalkerState.HELP_WOUNDED]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence([
      "dinamit_1",
      {
        // When animation ends, finish help wounded and heal up.
        // todo: Probably just handle as callback in action object? Why setting globally?
        f: (object: GameObject) => {
          finishObjectHelpWounded(object);
        },
      },
    ]),
    out: null,
    rnd: null,
    idle: null,
  },
  [EStalkerState.HELP_WOUNDED_WITH_MEDKIT]: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: null,
    },
    into: createSequence([
      "cr_raciya_0_draw_0",
      { a: misc.medkit_script },
      "dinamit_1",
      {
        // When animation ends, finish help wounded and heal up.
        // todo: Probably just handle as callback in action object? Why setting globally?
        f: (object: GameObject) => {
          finishObjectHelpWounded(object);
        },
      },
    ]),
    out: createSequence(["cr_raciya_0_hide_0", { d: misc.medkit_script }, "cr_raciya_0_hide_1"]),
    rnd: null,
    idle: null,
  },
});
