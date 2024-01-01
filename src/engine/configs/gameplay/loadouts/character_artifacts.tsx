import { JSXNode } from "jsx-xml";

import { createLoadout } from "@/engine/configs/gameplay/utils/create_loadaout";
import { artefacts } from "@/engine/lib/constants/items/artefacts";

export const comment: string = "";

export function create(): JSXNode {
  return createLoadout([
    { section: artefacts.af_cristall, probability: 0.003 },
    { section: artefacts.af_fireball, probability: 0.003 },
    { section: artefacts.af_dummy_glassbeads, probability: 0.003 },
    { section: artefacts.af_eye, probability: 0.001 },
    { section: artefacts.af_fire, probability: 0.001 },
    { section: artefacts.af_medusa, probability: 0.003 },
    { section: artefacts.af_cristall_flower, probability: 0.003 },
    { section: artefacts.af_night_star, probability: 0.003 },
    { section: artefacts.af_vyvert, probability: 0.003 },
    { section: artefacts.af_gravi, probability: 0.001 },
    { section: artefacts.af_gold_fish, probability: 0.001 },
    { section: artefacts.af_blood, probability: 0.003 },
    { section: artefacts.af_mincer_meat, probability: 0.003 },
    { section: artefacts.af_soul, probability: 0.003 },
    { section: artefacts.af_fuzz_kolobok, probability: 0.003 },
    { section: artefacts.af_baloon, probability: 0.001 },
    { section: artefacts.af_glass, probability: 0.001 },
    { section: artefacts.af_electra_sparkler, probability: 0.003 },
    { section: artefacts.af_electra_flash, probability: 0.003 },
    { section: artefacts.af_electra_moonlight, probability: 0.003 },
    { section: artefacts.af_dummy_battery, probability: 0.003 },
    { section: artefacts.af_dummy_dummy, probability: 0.001 },
    { section: artefacts.af_ice, probability: 0.001 },
  ]);
}
