/* eslint sort-keys-fix/sort-keys-fix: "error" */

/**
 * List of available artefact sections.
 */
export const artefacts = {
  af_baloon: "af_baloon",
  af_blood: "af_blood",
  af_compass: "af_compass",
  af_cristall: "af_cristall",
  af_cristall_flower: "af_cristall_flower",
  af_dummy_battery: "af_dummy_battery",
  af_dummy_dummy: "af_dummy_dummy",
  af_dummy_glassbeads: "af_dummy_glassbeads",
  af_electra_flash: "af_electra_flash",
  af_electra_moonlight: "af_electra_moonlight",
  af_electra_sparkler: "af_electra_sparkler",
  af_eye: "af_eye",
  af_fire: "af_fire",
  af_fireball: "af_fireball",
  af_fuzz_kolobok: "af_fuzz_kolobok",
  af_glass: "af_glass",
  af_gold_fish: "af_gold_fish",
  af_gravi: "af_gravi",
  af_ice: "af_ice",
  af_medusa: "af_medusa",
  af_mincer_meat: "af_mincer_meat",
  af_night_star: "af_night_star",
  af_oasis_heart: "af_oasis_heart",
  af_quest_b14_twisted: "af_quest_b14_twisted",
  af_soul: "af_soul",
  af_vyvert: "af_vyvert",
  jup_b1_half_artifact: "jup_b1_half_artifact",
} as const;

/**
 * Type definition of available artefact sections.
 */
export type TArtefacts = typeof artefacts;

/**
 * Type definition of single artefact section available in game.
 */
export type TArtefact = TArtefacts[keyof TArtefacts];
