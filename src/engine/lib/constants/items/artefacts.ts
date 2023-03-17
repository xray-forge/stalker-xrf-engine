export const artefacts = {
  af_medusa: "af_medusa",
  af_cristall_flower: "af_cristall_flower",
  af_night_star: "af_night_star",
  af_vyvert: "af_vyvert",
  af_gravi: "af_gravi",
  af_gold_fish: "af_gold_fish",
  af_cristall: "af_cristall",
  af_fireball: "af_fireball",
  af_dummy_glassbeads: "af_dummy_glassbeads",
  af_eye: "af_eye",
  af_fire: "af_fire",
  af_blood: "af_blood",
  af_mincer_meat: "af_mincer_meat",
  af_soul: "af_soul",
  af_fuzz_kolobok: "af_fuzz_kolobok",
  af_baloon: "af_baloon",
  af_glass: "af_glass",
  af_electra_sparkler: "af_electra_sparkler",
  af_electra_flash: "af_electra_flash",
  af_electra_moonlight: "af_electra_moonlight",
  af_dummy_battery: "af_dummy_battery",
  af_dummy_dummy: "af_dummy_dummy",
  af_ice: "af_ice",

  af_compass: "af_compass",
  af_oasis_heart: "af_oasis_heart",
  jup_b1_half_artifact: "jup_b1_half_artifact",
  af_quest_b14_twisted: "af_quest_b14_twisted",
} as const;

export type TArtefacts = typeof artefacts;

export type TArtefact = TArtefacts[keyof TArtefacts];
