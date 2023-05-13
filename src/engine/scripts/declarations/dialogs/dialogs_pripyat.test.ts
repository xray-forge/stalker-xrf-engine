import { describe, it } from "@jest/globals";

import { AnyObject, TName } from "@/engine/lib/types";

describe("'dialogs_pripyat' external callbacks", () => {
  const checkBinding = (name: TName, container: AnyObject = global) => {
    if (!container["dialogs_pripyat"][name]) {
      throw new Error(`Expected '${name}' callback to be declared.`);
    }
  };

  it("should correctly inject dialog functors", () => {
    require("@/engine/scripts/declarations/dialogs/dialogs_pripyat");

    checkBinding("pri_b301_zulus_reward");
    checkBinding("pri_a17_reward");
    checkBinding("actor_has_pri_a17_gauss_rifle");
    checkBinding("actor_hasnt_pri_a17_gauss_rifle");
    checkBinding("transfer_artifact_af_baloon");
    checkBinding("pay_cost_to_guide_to_zaton");
    checkBinding("jup_b43_actor_has_10000_money");
    checkBinding("jup_b43_actor_do_not_has_10000_money");
    checkBinding("pay_cost_to_guide_to_jupiter");
    checkBinding("jup_b43_actor_has_7000_money");
    checkBinding("jup_b43_actor_do_not_has_7000_money");
    checkBinding("pri_b35_transfer_svd");
    checkBinding("pri_b35_give_actor_reward");
    checkBinding("pri_a25_medic_give_kit");
    checkBinding("pri_a22_army_signaller_supply");
    checkBinding("pri_a22_give_actor_outfit");
    checkBinding("pri_b305_actor_has_strelok_notes");
    checkBinding("pri_b305_actor_has_strelok_note_1");
    checkBinding("pri_b305_actor_has_strelok_note_2");
    checkBinding("pri_b305_actor_has_strelok_note_3");
    checkBinding("pri_b305_actor_has_strelok_note_12");
    checkBinding("pri_b305_actor_has_strelok_note_13");
    checkBinding("pri_b305_actor_has_strelok_note_23");
    checkBinding("pri_b305_actor_has_strelok_note_all");
    checkBinding("pri_b305_sell_strelok_notes");
    checkBinding("pri_a17_sokolov_is_not_at_base");
  });
});
