import { TAnimation } from "@/mod/globals/animations";

export enum EEffectorState {
  START = "start",
  RELEASE = "release",
  FINISH = "finish",
  IDLE = "idle"
}

export interface ICamEffectorSetDescriptorItem {
  anim: TAnimation;
  looped: "true" | "false" | boolean;
  global_cameffect: boolean;
  enabled?: string;
}

export type TCamEffectorSetDescriptor = Record<EEffectorState, LuaTable<number, ICamEffectorSetDescriptorItem>>;

export const pri_a15_cameffector: TCamEffectorSetDescriptor = {
  start: new LuaTable(),
  idle: [
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_01", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_02", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_03", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_04", looped: "false", global_cameffect: true },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_05",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_zulus_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_06",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_vano_out +pri_a15_wanderer_out +pri_a15_zulus_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_07",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_vano_out +pri_a15_wanderer_out +pri_a15_zulus_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_08",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_vano_out +pri_a15_sokolov_out} false, true"
    },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_09", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_10", looped: "false", global_cameffect: true },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_11",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_sokolov_out} false, true"
    },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_12", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_13", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_14", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_15", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_16", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_17", looped: "false", global_cameffect: true },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_17_1",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_all_dead} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_18",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_all_dead} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_19",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_zulus_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_20",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_sokolov_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_21",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_sokolov_out +pri_a15_zulus_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_22",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_vano_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_23",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_vano_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_24",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_vano_out} false, true"
    },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_25", looped: "false", global_cameffect: true },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_25_1",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_zulus_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_26",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_zulus_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_27",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_zulus_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_28",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_zulus_out} false, true"
    },
    {
      anim: "scenario_cam\\pripyat\\pri_a15_cam_29",
      looped: "false",
      global_cameffect: true,
      enabled: "{+pri_a15_zulus_out} false, true"
    },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_30", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_31", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\pripyat\\pri_a15_cam_32", looped: "false", global_cameffect: true }
  ] as any,
  finish: new LuaTable(),
  release: new LuaTable()
};

export const jup_b219_descent_camera: TCamEffectorSetDescriptor = {
  start: new LuaTable(),
  idle: [
    { anim: "scenario_cam\\Jupiter\\jup_b219_cam_1", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\Jupiter\\jup_b219_cam_2", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\Jupiter\\jup_b219_cam_3", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\Jupiter\\jup_b219_cam_4", looped: "false", global_cameffect: true },
    {
      anim: "scenario_cam\\Jupiter\\jup_b219_cam_5",
      looped: "false",
      global_cameffect: true,
      enabled: "{+jup_a10_vano_agree_go_und} true, false"
    },
    {
      anim: "scenario_cam\\Jupiter\\jup_b219_cam_6",
      looped: "false",
      global_cameffect: true,
      enabled: "{+jup_b218_monolith_hired} true, false"
    },
    {
      anim: "scenario_cam\\Jupiter\\jup_b219_cam_7",
      looped: "false",
      global_cameffect: true,
      enabled: "{+jup_b218_soldier_hired} true, false"
    },
    { anim: "scenario_cam\\Jupiter\\jup_b219_cam_8", looped: "false", global_cameffect: true },
    { anim: "scenario_cam\\Jupiter\\jup_b219_cam_9", looped: "false", global_cameffect: true },
    {
      anim: "scenario_cam\\Jupiter\\jup_b219_cam_10",
      looped: "false",
      global_cameffect: true,
      enabled: "true %+jup_b219_entering_underpass%"
    }
  ] as any,
  finish: new LuaTable(),
  release: new LuaTable()
};

export const pri_b305_camera_2: TCamEffectorSetDescriptor = {
  start: new LuaTable(),
  idle: [
    {
      anim: "scenario_cam\\pripyat\\pri_b305_catscene_2_dialog_with_kovalsky_01",
      looped: "false",
      global_cameffect: true
    },
    {
      anim: "scenario_cam\\pripyat\\pri_b305_catscene_2_dialog_with_kovalsky_02",
      looped: "false",
      global_cameffect: true
    }
  ] as any,
  finish: new LuaTable(),
  release: new LuaTable()
};

export const pri_b305_camera_5: TCamEffectorSetDescriptor = {
  start: new LuaTable(),
  idle: [
    {
      anim: "scenario_cam\\pripyat\\pri_b305_catscene_5_dialog_with_strelok_1",
      looped: "false",
      global_cameffect: true
    },
    {
      anim: "scenario_cam\\pripyat\\pri_b305_catscene_5_dialog_with_strelok_2",
      looped: "false",
      global_cameffect: true
    }
  ] as any,
  finish: new LuaTable(),
  release: new LuaTable()
};

export const effector_sets: Record<string, TCamEffectorSetDescriptor> = {
  pri_a15_cameffector,
  jup_b219_descent_camera,
  pri_b305_camera_2,
  pri_b305_camera_5
} as const;
