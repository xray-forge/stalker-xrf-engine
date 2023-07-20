import { beforeAll, describe, it } from "@jest/globals";

import { TName } from "@/engine/lib/types";
import { checkNestedBinding } from "@/fixtures/engine";

describe("'dialogs_pripyat' external callbacks", () => {
  const checkDialogsBinding = (name: TName) => checkNestedBinding("dialogs_pripyat", name);

  beforeAll(() => {
    require("@/engine/scripts/declarations/dialogs/dialogs_pripyat");
  });

  it("should correctly inject dialog functors", () => {
    checkDialogsBinding("pri_b301_zulus_reward");
    checkDialogsBinding("pri_a17_reward");
    checkDialogsBinding("actor_has_pri_a17_gauss_rifle");
    checkDialogsBinding("actor_hasnt_pri_a17_gauss_rifle");
    checkDialogsBinding("transfer_artifact_af_baloon");
    checkDialogsBinding("pay_cost_to_guide_to_zaton");
    checkDialogsBinding("jup_b43_actor_has_10000_money");
    checkDialogsBinding("jup_b43_actor_do_not_has_10000_money");
    checkDialogsBinding("pay_cost_to_guide_to_jupiter");
    checkDialogsBinding("jup_b43_actor_has_7000_money");
    checkDialogsBinding("jup_b43_actor_do_not_has_7000_money");
    checkDialogsBinding("pri_b35_transfer_svd");
    checkDialogsBinding("pri_b35_give_actor_reward");
    checkDialogsBinding("pri_a25_medic_give_kit");
    checkDialogsBinding("pri_a22_army_signaller_supply");
    checkDialogsBinding("pri_a22_give_actor_outfit");
    checkDialogsBinding("pri_b305_actor_has_strelok_notes");
    checkDialogsBinding("pri_b305_actor_has_strelok_note_1");
    checkDialogsBinding("pri_b305_actor_has_strelok_note_2");
    checkDialogsBinding("pri_b305_actor_has_strelok_note_3");
    checkDialogsBinding("pri_b305_actor_has_strelok_note_12");
    checkDialogsBinding("pri_b305_actor_has_strelok_note_13");
    checkDialogsBinding("pri_b305_actor_has_strelok_note_23");
    checkDialogsBinding("pri_b305_actor_has_strelok_note_all");
    checkDialogsBinding("pri_b305_sell_strelok_notes");
    checkDialogsBinding("pri_a17_sokolov_is_not_at_base");
  });
});
