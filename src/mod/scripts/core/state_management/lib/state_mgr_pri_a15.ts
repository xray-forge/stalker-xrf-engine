import { anim, CSightParams, move, XR_game_object } from "xray16";

import { AnyObject, Optional } from "@/mod/lib/types";
import { animObjByName, getActor } from "@/mod/scripts/core/db";
import { IStateDescriptor } from "@/mod/scripts/core/state_management/lib/state_lib";
import { parseNames } from "@/mod/scripts/utils/configs";
import { abort } from "@/mod/scripts/utils/debug";

const weap_table: LuaTable<number, string> = [
  "pri_a15_wpn_svu",
  "pri_a15_wpn_wincheaster1300",
  "pri_a15_wpn_ak74u",
  "pri_a15_wpn_ak74"
] as any;

const weap_table_unstrapped: LuaTable<number, string> = [
  "pri_a15_wpn_svu_unstrapped",
  "pri_a15_wpn_wincheaster1300_unstrapped",
  "pri_a15_wpn_ak74u_unstrapped",
  "pri_a15_wpn_ak74_unstrapped"
] as any;

function unstrap_weapon(npc: XR_game_object): void {
  let item: Optional<XR_game_object> = null;
  let index: number = 0;

  for (const [k, v] of weap_table) {
    item = npc.object(v);
    if (item !== null) {
      index = k;
      break;
    }
  }

  if (item === null) {
    abort("Can not find item in %s", npc.name());
  }

  item.attachable_item_load_attach(weap_table_unstrapped.get(index as number));
}

function strap_weapon(npc: XR_game_object): void {
  let item: Optional<XR_game_object> = null;
  let index: number = 0;

  for (const [k, v] of pairs(weap_table)) {
    item = npc.object(v);
    if (item !== null) {
      index = k;
      break;
    }
  }

  if (item == null) {
    abort("cant find item in %s", npc.name());
  }

  item.attachable_item_load_attach(weap_table.get(index));
}

function break_fence(): void {
  animObjByName.get("pri_a15_door").anim_forward();
}

function lights_off(): void {
  getActor()!.give_info_portion("pri_a15_lights_off");
}

function lights_on(): void {
  getActor()!.disable_info_portion("pri_a15_lights_off");
}

function end_scene(): void {
  getActor()!.give_info_portion("pri_a15_cutscene_end");
}

const cutscene = {
  [1]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam1", att: "pri_a15_wpn_wincheaster1300" },
      sokolov: { a: "pri_a15_cokolov_cam1", att: "pri_a15_wpn_ak74u" },
      zulus: { a: "pri_a15_zulus_cam1" },
      wanderer: { a: "pri_a15_monolit_cam1", att: "pri_a15_wpn_svu" },
      actor: { a: "pri_a15_igrok_cam1", att: "pri_a15_wpn_ak74" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam1" },
      military_2: { a: "pri_a15_soldier_1_cam1" },
      military_3: { a: "pri_a15_soldier_2_cam1" },
      military_4: { a: "pri_a15_soldier_3_cam1" }
    }
  },
  [2]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam2" },
      sokolov: { a: "pri_a15_cokolov_cam2" },
      zulus: { a: "pri_a15_zulus_cam2" },
      wanderer: { a: "pri_a15_monolit_cam2" },
      actor: { a: "pri_a15_igrok_cam2" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam2" },
      military_2: { a: "pri_a15_soldier_1_cam2" },
      military_3: { a: "pri_a15_soldier_2_cam2" },
      military_4: { a: "pri_a15_soldier_3_cam2" }
    }
  },
  [3]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam3" },
      sokolov: { a: "pri_a15_cokolov_cam3" },
      zulus: { a: "pri_a15_zulus_cam3" },
      wanderer: { a: "pri_a15_monolit_cam3" },
      actor: { a: "pri_a15_igrok_cam3" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam3" },
      military_2: { a: "pri_a15_soldier_1_cam3" },
      military_3: { a: "pri_a15_soldier_2_cam3" },
      military_4: { a: "pri_a15_soldier_3_cam3" }
    }
  },
  [4]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam4" },
      sokolov: { a: "pri_a15_cokolov_cam4" },
      zulus: { a: "pri_a15_zulus_cam4" },
      wanderer: { a: "pri_a15_monolit_cam4" },
      actor: { a: "pri_a15_igrok_cam4", f1: break_fence, f: lights_off },
      military_tarasov: { a: "pri_a15_soldier_kam_cam4" },
      military_2: { a: "pri_a15_soldier_1_cam4" },
      military_3: { a: "pri_a15_soldier_2_cam4" },
      military_4: { a: "pri_a15_soldier_3_cam4" }
    }
  },
  [5]: {
    precondition: ["zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam5" },
      sokolov: { a: "pri_a15_cokolov_cam5" },
      zulus: { a: "pri_a15_zulus_cam5" },
      wanderer: { a: "pri_a15_monolit_cam5" },
      actor: { a: "pri_a15_igrok_cam5" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam5" },
      military_2: { a: "pri_a15_soldier_1_cam5" },
      military_3: { a: "pri_a15_soldier_2_cam5" },
      military_4: { a: "pri_a15_soldier_3_cam5" }
    }
  },
  [6]: {
    precondition: ["vano", "wanderer", "zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam6" },
      sokolov: { a: "pri_a15_cokolov_cam6" },
      zulus: { a: "pri_a15_zulus_cam6" },
      wanderer: { a: "pri_a15_monolit_cam6_1", f: unstrap_weapon, a2: "pri_a15_monolit_cam6_2" },
      actor: { a: "pri_a15_igrok_cam6" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam6" },
      military_2: { a: "pri_a15_soldier_1_cam6" },
      military_3: { a: "pri_a15_soldier_2_cam6" },
      military_4: { a: "pri_a15_soldier_3_cam6" }
    }
  },
  [7]: {
    precondition: ["vano", "wanderer", "zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam7_1", f: unstrap_weapon, a2: "pri_a15_vano_cam7_2" },
      sokolov: { a: "pri_a15_cokolov_cam7" },
      zulus: { a: "pri_a15_zulus_cam7" },
      wanderer: { a: "pri_a15_monolit_cam7" },
      actor: { a: "pri_a15_igrok_cam7" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam7" },
      military_2: { a: "pri_a15_soldier_1_cam7" },
      military_3: { a: "pri_a15_soldier_2_cam7" },
      military_4: { a: "pri_a15_soldier_3_cam7" }
    }
  },
  [8]: {
    precondition: ["vano", "sokolov"],
    animation: {
      vano: { a: "pri_a15_vano_cam8" },
      sokolov: { a: "pri_a15_cokolov_cam8_1", f: unstrap_weapon, a2: "pri_a15_cokolov_cam8_2" },
      zulus: { a: "pri_a15_zulus_cam8" },
      wanderer: { a: "pri_a15_monolit_cam8" },
      actor: { a: "pri_a15_igrok_cam8" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam8" },
      military_2: { a: "pri_a15_soldier_1_cam8" },
      military_3: { a: "pri_a15_soldier_2_cam8" },
      military_4: { a: "pri_a15_soldier_3_cam8" }
    }
  },
  [9]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam9" },
      sokolov: { a: "pri_a15_cokolov_cam9" },
      zulus: { a: "pri_a15_zulus_cam9" },
      wanderer: { a: "pri_a15_monolit_cam9" },
      actor: { a: "pri_a15_igrok_cam9_1", f: unstrap_weapon, a2: "pri_a15_igrok_cam9_2" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam9", s: "pri_a15_army_hide_weapon" },
      military_2: { a: "pri_a15_soldier_1_cam9" },
      military_3: { a: "pri_a15_soldier_2_cam9" },
      military_4: { a: "pri_a15_soldier_3_cam9" }
    }
  },
  [10]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam10" },
      sokolov: { a: "pri_a15_cokolov_cam10" },
      zulus: { a: "pri_a15_zulus_cam10" },
      wanderer: { a: "pri_a15_monolit_cam10" },
      actor: { a: "pri_a15_igrok_cam10" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam10", f1: lights_on },
      military_2: { a: "pri_a15_soldier_1_cam10" },
      military_3: { a: "pri_a15_soldier_2_cam10" },
      military_4: { a: "pri_a15_soldier_3_cam10" }
    }
  },
  [11]: {
    precondition: ["sokolov"],
    animation: {
      vano: { a: "pri_a15_vano_cam11" },
      sokolov: {
        a: "pri_a15_cokolov_cam11_1",
        s: "pri_a15_sokolov_introduce",
        f: strap_weapon,
        a2: "pri_a15_cokolov_cam11_2"
      },
      zulus: { a: "pri_a15_zulus_cam11" },
      wanderer: { a: "pri_a15_monolit_cam11" },
      actor: { a: "pri_a15_igrok_cam11" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam11" },
      military_2: { a: "pri_a15_soldier_1_cam11" },
      military_3: { a: "pri_a15_soldier_2_cam11" },
      military_4: { a: "pri_a15_soldier_3_cam11" }
    }
  },
  [12]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam12" },
      sokolov: { a: "pri_a15_cokolov_cam12" },
      zulus: { a: "pri_a15_zulus_cam12" },
      wanderer: { a: "pri_a15_monolit_cam12" },
      actor: {
        a: "pri_a15_igrok_cam12",
        f: strap_weapon,
        s: "pri_a15_actor_need_talk_with_commander"
      },
      military_tarasov: { a: "pri_a15_soldier_kam_cam12" },
      military_2: { a: "pri_a15_soldier_1_cam12" },
      military_3: { a: "pri_a15_soldier_2_cam12" },
      military_4: { a: "pri_a15_soldier_3_cam12" }
    }
  },
  [13]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam13" },
      sokolov: { a: "pri_a15_cokolov_cam13", s: "pri_a15_sokolov_wonder" },
      zulus: { a: "pri_a15_zulus_cam13" },
      wanderer: { a: "pri_a15_monolit_cam13" },
      actor: { a: "pri_a15_igrok_cam13" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam13" },
      military_2: { a: "pri_a15_soldier_1_cam13" },
      military_3: { a: "pri_a15_soldier_2_cam13" },
      military_4: { a: "pri_a15_soldier_3_cam13" }
    }
  },
  [14]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam14" },
      sokolov: { a: "pri_a15_cokolov_cam14" },
      zulus: { a: "pri_a15_zulus_cam14" },
      wanderer: { a: "pri_a15_monolit_cam14" },
      actor: { a: "pri_a15_igrok_cam14" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam14", s: "pri_a15_army_who_a_you" },
      military_2: { a: "pri_a15_soldier_1_cam14" },
      military_3: { a: "pri_a15_soldier_2_cam14" },
      military_4: { a: "pri_a15_soldier_3_cam14" }
    }
  },
  [15]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam15" },
      sokolov: { a: "pri_a15_cokolov_cam15" },
      zulus: { a: "pri_a15_zulus_cam15" },
      wanderer: { a: "pri_a15_monolit_cam15" },
      actor: { a: "pri_a15_igrok_cam15" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam15" },
      military_2: { a: "pri_a15_soldier_1_cam15" },
      military_3: { a: "pri_a15_soldier_2_cam15" },
      military_4: { a: "pri_a15_soldier_3_cam15" }
    }
  },
  [16]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam16" },
      sokolov: { a: "pri_a15_cokolov_cam16" },
      zulus: { a: "pri_a15_zulus_cam16" },
      wanderer: { a: "pri_a15_monolit_cam16" },
      actor: {
        a: "pri_a15_igrok_cam16_1",
        att: "pri_a15_documents",
        s: "pri_a15_actor_introduce",
        a2: "pri_a15_igrok_cam16_2"
      },
      military_tarasov: { a: "pri_a15_soldier_kam_cam16" },
      military_2: { a: "pri_a15_soldier_1_cam16" },
      military_3: { a: "pri_a15_soldier_2_cam16" },
      military_4: { a: "pri_a15_soldier_3_cam16" }
    }
  },
  [17]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam17" },
      sokolov: { a: "pri_a15_cokolov_cam17" },
      zulus: { a: "pri_a15_zulus_cam17" },
      wanderer: { a: "pri_a15_monolit_cam17" },
      actor: { a: "pri_a15_igrok_cam17" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam17" },
      military_2: { a: "pri_a15_soldier_1_cam17" },
      military_3: { a: "pri_a15_soldier_2_cam17" },
      military_4: { a: "pri_a15_soldier_3_cam17" }
    }
  },
  [18]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer"],
    animation: {
      vano: { a: "pri_a15_vano_cam17_1" },
      sokolov: { a: "pri_a15_cokolov_cam17_1" },
      zulus: { a: "pri_a15_zulus_cam17_1" },
      wanderer: { a: "pri_a15_monolit_cam17_1" },
      actor: { a2: "pri_a15_igrok_cam17_1", s: "pri_a15_actor_introduce_squad" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam17_1" },
      military_2: { a: "pri_a15_soldier_1_cam17_1" },
      military_3: { a: "pri_a15_soldier_2_cam17_1" },
      military_4: { a: "pri_a15_soldier_3_cam17_1" }
    }
  },
  [19]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer"],
    animation: {
      vano: { a: "pri_a15_vano_cam18" },
      sokolov: { a: "pri_a15_cokolov_cam18" },
      zulus: { a: "pri_a15_zulus_cam18", s: "pri_a15_zulus_wonder" },
      wanderer: { a: "pri_a15_monolit_cam18" },
      actor: { a: "pri_a15_igrok_cam18" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam18" },
      military_2: { a: "pri_a15_soldier_1_cam18" },
      military_3: { a: "pri_a15_soldier_2_cam18" },
      military_4: { a: "pri_a15_soldier_3_cam18" }
    }
  },
  [20]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "" },
      sokolov: { a: "" },
      zulus: { a: "" },
      wanderer: { a: "" },
      actor: { a: "", det: "pri_a15_documents" },
      military_tarasov: { a: "" },
      military_2: { a: "" },
      military_3: { a: "" },
      military_4: { a: "" }
    }
  },
  [21]: {
    precondition: ["zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam19" },
      sokolov: { a: "pri_a15_cokolov_cam19" },
      zulus: { a: "pri_a15_zulus_cam19" },
      wanderer: { a: "pri_a15_monolit_cam19" },
      actor: { a: "pri_a15_igrok_cam19" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam19" },
      military_2: { a: "pri_a15_soldier_1_cam19" },
      military_3: { a: "pri_a15_soldier_2_cam19" },
      military_4: { a: "pri_a15_soldier_3_cam19" }
    }
  },
  [22]: {
    precondition: ["sokolov"],
    animation: {
      vano: { a: "pri_a15_vano_cam20" },
      sokolov: { s1: "pri_a15_sokolov_conjecture", a: "pri_a15_cokolov_cam20" },
      zulus: { a: "pri_a15_zulus_cam20" },
      wanderer: { a: "pri_a15_monolit_cam20" },
      actor: { a: "pri_a15_igrok_cam20" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam20", s: "pri_a15_army_joke" },
      military_2: { a: "pri_a15_soldier_1_cam20" },
      military_3: { a: "pri_a15_soldier_2_cam20" },
      military_4: { a: "pri_a15_soldier_3_cam20" }
    }
  },
  [23]: {
    precondition: ["sokolov", "zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam21" },
      sokolov: { a: "pri_a15_cokolov_cam21" },
      zulus: { a: "pri_a15_zulus_cam21" },
      wanderer: { a: "pri_a15_monolit_cam21" },
      actor: { a: "pri_a15_igrok_cam21" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam21" },
      military_2: { a: "pri_a15_soldier_1_cam21" },
      military_3: { a: "pri_a15_soldier_2_cam21" },
      military_4: { a: "pri_a15_soldier_3_cam21" }
    }
  },
  [24]: {
    precondition: ["vano"],
    animation: {
      vano: { s1: "pri_a15_vano_speech_one", a: "pri_a15_vano_cam22" },
      sokolov: { a: "pri_a15_cokolov_cam22" },
      zulus: { a: "pri_a15_zulus_cam22" },
      wanderer: { a: "pri_a15_monolit_cam22" },
      actor: { a: "pri_a15_igrok_cam22" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam22" },
      military_2: { a: "pri_a15_soldier_1_cam22" },
      military_3: { a: "pri_a15_soldier_2_cam22" },
      military_4: { a: "pri_a15_soldier_3_cam22" }
    }
  },
  [25]: {
    precondition: ["vano"],
    animation: {
      vano: { a: "pri_a15_vano_cam23" },
      sokolov: { a: "pri_a15_cokolov_cam23" },
      zulus: { a: "pri_a15_zulus_cam23" },
      wanderer: { a: "pri_a15_monolit_cam23" },
      actor: { a: "pri_a15_igrok_cam23" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam23" },
      military_2: { a: "pri_a15_soldier_1_cam23" },
      military_3: { a: "pri_a15_soldier_2_cam23" },
      military_4: { a: "pri_a15_soldier_3_cam23" }
    }
  },
  [26]: {
    precondition: ["vano"],
    animation: {
      vano: { a: "pri_a15_vano_cam24" },
      sokolov: { a: "pri_a15_cokolov_cam24" },
      zulus: { a: "pri_a15_zulus_cam24" },
      wanderer: { a: "pri_a15_monolit_cam24" },
      actor: { a: "pri_a15_igrok_cam24" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam24" },
      military_2: { a: "pri_a15_soldier_1_cam24" },
      military_3: { a: "pri_a15_soldier_2_cam24" },
      military_4: { a: "pri_a15_soldier_3_cam24" }
    }
  },
  [27]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam25" },
      sokolov: { a: "pri_a15_cokolov_cam25" },
      zulus: { a: "pri_a15_zulus_cam25" },
      wanderer: { a: "pri_a15_monolit_cam25" },
      actor: { a: "pri_a15_igrok_cam25" },
      military_tarasov: { a2: "pri_a15_soldier_kam_cam25", s: "pri_a15_army_go_with_me" },
      military_2: { a: "pri_a15_soldier_1_cam25" },
      military_3: { a: "pri_a15_soldier_2_cam25" },
      military_4: { a: "pri_a15_soldier_3_cam25" }
    }
  },
  [28]: {
    precondition: ["zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam25_1" },
      sokolov: { a: "pri_a15_cokolov_cam25_1" },
      zulus: { a2: "pri_a15_zulus_cam25_1", s: "pri_a15_zulus_not_me" },
      wanderer: { a: "pri_a15_monolit_cam25_1" },
      actor: { a: "pri_a15_igrok_cam25_1" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam25_1" },
      military_2: { a: "pri_a15_soldier_1_cam25_1" },
      military_3: { a: "pri_a15_soldier_2_cam25_1" },
      military_4: { a: "pri_a15_soldier_3_cam25_1" }
    }
  },
  [29]: {
    precondition: ["zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam26" },
      sokolov: { a: "pri_a15_cokolov_cam26" },
      zulus: { s1: "pri_a15_zulus_no_business_with_army", a: "pri_a15_zulus_cam26", s: "pri_a15_zulus_go" },
      wanderer: { a: "pri_a15_monolit_cam26" },
      actor: { a: "pri_a15_igrok_cam26" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam26" },
      military_2: { a: "pri_a15_soldier_1_cam26" },
      military_3: { a: "pri_a15_soldier_2_cam26" },
      military_4: { a: "pri_a15_soldier_3_cam26" }
    }
  },
  [30]: {
    precondition: ["zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam27" },
      sokolov: { a: "pri_a15_cokolov_cam27" },
      zulus: { a: "pri_a15_zulus_cam27" },
      wanderer: { a: "pri_a15_monolit_cam27" },
      actor: { a: "pri_a15_igrok_cam27" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam27", s1: "pri_a15_army_stop" },
      military_2: { a: "pri_a15_soldier_1_cam27" },
      military_3: { a: "pri_a15_soldier_2_cam27" },
      military_4: { a: "pri_a15_soldier_3_cam27" }
    }
  },
  [31]: {
    precondition: ["zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam28" },
      sokolov: { a: "pri_a15_cokolov_cam28" },
      zulus: { a: "pri_a15_zulus_cam28" },
      wanderer: { a: "pri_a15_monolit_cam28" },
      actor: { a: "pri_a15_igrok_cam28", s: "pri_a15_actor_leave_him" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam28", s: "pri_a15_army_leave" },
      military_2: { a: "pri_a15_soldier_1_cam28" },
      military_3: { a: "pri_a15_soldier_2_cam28" },
      military_4: { a: "pri_a15_soldier_3_cam28" }
    }
  },
  [32]: {
    precondition: ["zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam29" },
      sokolov: { a: "pri_a15_cokolov_cam29" },
      zulus: { a: "pri_a15_zulus_cam29" },
      wanderer: { a: "pri_a15_monolit_cam29" },
      actor: { a: "pri_a15_igrok_cam29" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam29", s: "pri_a15_army_go" },
      military_2: { a: "pri_a15_soldier_1_cam29" },
      military_3: { a: "pri_a15_soldier_2_cam29" },
      military_4: { a: "pri_a15_soldier_3_cam29" }
    }
  },
  [33]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam30" },
      sokolov: { a: "pri_a15_cokolov_cam30" },
      zulus: { a: "" },
      wanderer: { a: "pri_a15_monolit_cam30", s: "pri_a15_wanderer_about_actor" },
      actor: { a: "pri_a15_igrok_cam30" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam30" },
      military_2: { a: "pri_a15_soldier_1_cam30" },
      military_3: { a: "pri_a15_soldier_2_cam30" },
      military_4: { a: "pri_a15_soldier_3_cam30" }
    }
  },
  [34]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam31" },
      sokolov: { a: "pri_a15_cokolov_cam31" },
      zulus: { a: "" },
      wanderer: { a: "pri_a15_monolit_cam31" },
      actor: { a: "pri_a15_igrok_cam31" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam31" },
      military_2: { a: "pri_a15_soldier_1_cam31" },
      military_3: { a: "pri_a15_soldier_2_cam31" },
      military_4: { a: "pri_a15_soldier_3_cam31" }
    }
  },
  [35]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "" },
      sokolov: { a: "" },
      zulus: { a: "" },
      wanderer: { a: "" },
      actor: { a: "", f: end_scene },
      military_tarasov: { a: "" },
      military_2: { a: "" },
      military_3: { a: "" },
      military_4: { a: "" }
    }
  },
  [36]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam32" },
      sokolov: { a: "pri_a15_cokolov_cam32" },
      zulus: { a: "" },
      wanderer: { a: "pri_a15_monolit_cam32" },
      actor: { a: "pri_a15_igrok_cam32" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam32" },
      military_2: { a: "pri_a15_soldier_1_cam32" },
      military_3: { a: "pri_a15_soldier_2_cam32" },
      military_4: { a: "pri_a15_soldier_3_cam32" }
    }
  }
};

function check_availability(precondition: LuaTable<number, string>, existing_npc: string): boolean {
  const check_names = parseNames(existing_npc);

  for (const [k, v] of precondition) {
    for (const [kk, vv] of check_names) {
      if (v == vv) {
        return true;
      }
    }
  }

  return false;
}

// --get_sequence_for_npc("zulus", "zulus,vano")
// --get_sequence_for_npc("vano", "vano")
function get_sequence_for_npc(npc: string, existing_npc: string) {
  const return_table: LuaTable<number, AnyObject> = new LuaTable();

  for (const i of $range(1, (cutscene as any as LuaTable).length())) {
    if (check_availability((cutscene as any as LuaTable).get(i).precondition, existing_npc)) {
      const anm = (cutscene as any as LuaTable).get(i).animation[npc].a;
      const anm2 = (cutscene as any as LuaTable).get(i).animation[npc].a2;
      const snd1 = (cutscene as any as LuaTable).get(i).animation[npc].s1;
      const snd = (cutscene as any as LuaTable).get(i).animation[npc].s;
      const det = (cutscene as any as LuaTable).get(i).animation[npc].det;
      const att = (cutscene as any as LuaTable).get(i).animation[npc].att;
      const func = (cutscene as any as LuaTable).get(i).animation[npc].f;
      const func1 = (cutscene as any as LuaTable).get(i).animation[npc].f1;

      if (func1 !== null) {
        const func_tbl = { f: func1 };

        table.insert(return_table, func_tbl);
      }

      if (snd1 !== null && snd1 !== "") {
        const snd_tbl = { s: snd1 };

        table.insert(return_table, snd_tbl);
      }

      if (anm !== null && anm !== "") {
        table.insert(return_table, anm);
      }

      if (func !== null) {
        const func_tbl = { f: func };

        table.insert(return_table, func_tbl);
      }

      if (snd !== null && snd !== "") {
        const snd_tbl = { s: snd };

        table.insert(return_table, snd_tbl);
      }

      if (det !== null && det !== "") {
        const det_tbl = { d: det };

        table.insert(return_table, det_tbl);
      }

      if (att !== null && att !== "") {
        const att_tbl = { a: att };

        table.insert(return_table, att_tbl);
      }

      if (anm2 !== null && anm2 !== "") {
        table.insert(return_table, anm2);
      }
    }
  }

  return return_table;
}

export function add_state_lib_pri_a15(): LuaTable<string, IStateDescriptor> {
  return {
    pri_a15_idle_none: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_idle_none",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    pri_a15_idle_strap: {
      weapon: "strapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_idle_none",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    pri_a15_idle_unstrap: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_idle_unstrap",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    // --Vano
    pri_a15_vano_all: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_vano_all",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_vano_1_sokolov: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_vano_1_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_vano_1_zulus: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_vano_1_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_vano_1_wanderer: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_vano_1_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_vano_2_sokolov_zulus: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_vano_2_sokolov_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_vano_2_sokolov_wanderer: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_vano_2_sokolov_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_vano_2_zulus_wanderer: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_vano_2_zulus_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_vano_3_vano_alive: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_vano_3_vano_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    // --Sokolov
    pri_a15_sokolov_all: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_sokolov_all",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_sokolov_1_vano: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_sokolov_1_vano",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_sokolov_1_zulus: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_sokolov_1_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_sokolov_1_wanderer: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_sokolov_1_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_sokolov_2_vano_zulus: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_sokolov_2_vano_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_sokolov_2_vano_wanderer: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_sokolov_2_vano_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_sokolov_2_zulus_wanderer: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_sokolov_2_zulus_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_sokolov_3_sokolov_alive: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_sokolov_3_sokolov_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    // --Zulus
    pri_a15_zulus_all: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_zulus_all",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_zulus_1_vano: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_zulus_1_vano",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_zulus_1_sokolov: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_zulus_1_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_zulus_1_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_zulus_1_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_zulus_2_vano_sokolov: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_zulus_2_vano_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_zulus_2_vano_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_zulus_2_vano_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_zulus_2_sokolov_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_zulus_2_sokolov_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_zulus_3_zulus_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_zulus_3_zulus_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    // --Wanderer
    pri_a15_wanderer_all: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_wanderer_all",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_wanderer_1_vano: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_wanderer_1_vano",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_wanderer_1_sokolov: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_wanderer_1_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_wanderer_1_zulus: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_wanderer_1_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_wanderer_2_vano_sokolov: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_wanderer_2_vano_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_wanderer_2_vano_zulus: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_wanderer_2_vano_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_wanderer_2_sokolov_zulus: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_wanderer_2_sokolov_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_wanderer_3_wanderer_alive: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_wanderer_3_wanderer_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    // -- Actor
    pri_a15_actor_all: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_all",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_1_vano: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_1_vano",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_1_sokolov: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_1_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_1_zulus: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_1_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_1_wanderer: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_1_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_2_vano_sokolov: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_2_vano_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_2_vano_zulus: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_2_vano_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_2_vano_wanderer: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_2_vano_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    pri_a15_actor_2_sokolov_zulus: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_2_sokolov_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_2_sokolov_wanderer: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_2_sokolov_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_2_zulus_wanderer: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_2_zulus_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_3_vano_alive: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_3_vano_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_3_sokolov_alive: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_3_sokolov_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_3_zulus_alive: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_3_zulus_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_3_wanderer_alive: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_3_wanderer_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_actor_all_dead: {
      weapon: "none",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_actor_all_dead",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    // -- Military Tarasov
    pri_a15_military_tarasov_all: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_all",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_1_vano: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_1_vano",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_1_sokolov: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_1_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_1_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_1_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_1_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_1_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_2_vano_sokolov: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_2_vano_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_2_vano_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_2_vano_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_2_vano_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_2_vano_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    pri_a15_military_tarasov_2_sokolov_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_2_sokolov_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_2_sokolov_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_2_sokolov_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_2_zulus_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_2_zulus_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_3_vano_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_3_vano_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_3_sokolov_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_3_sokolov_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_3_zulus_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_3_zulus_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_3_wanderer_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_3_wanderer_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_tarasov_all_dead: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_tarasov_all_dead",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    // -- Military 2
    pri_a15_military_2_all: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_all",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_1_vano: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_1_vano",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_1_sokolov: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_1_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_1_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_1_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_1_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_1_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_2_vano_sokolov: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_2_vano_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_2_vano_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_2_vano_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_2_vano_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_2_vano_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    pri_a15_military_2_2_sokolov_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_2_sokolov_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_2_sokolov_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_2_sokolov_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_2_zulus_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_2_zulus_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_3_vano_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_3_vano_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_3_sokolov_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_3_sokolov_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_3_zulus_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_3_zulus_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_3_wanderer_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_3_wanderer_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_2_all_dead: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_2_all_dead",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    // -- Military 3
    pri_a15_military_3_all: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_all",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_1_vano: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_1_vano",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_1_sokolov: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_1_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_1_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_1_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_1_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_1_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_2_vano_sokolov: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_2_vano_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_2_vano_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_2_vano_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_2_vano_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_2_vano_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    pri_a15_military_3_2_sokolov_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_2_sokolov_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_2_sokolov_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_2_sokolov_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_2_zulus_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_2_zulus_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_3_vano_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_3_vano_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_3_sokolov_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_3_sokolov_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_3_zulus_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_3_zulus_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_3_wanderer_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_3_wanderer_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_3_all_dead: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_3_all_dead",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    // -- Military 4
    pri_a15_military_4_all: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_all",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_1_vano: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_1_vano",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_1_sokolov: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_1_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_1_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_1_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_1_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_1_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_2_vano_sokolov: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_2_vano_sokolov",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_2_vano_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_2_vano_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_2_vano_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_2_vano_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },
    pri_a15_military_4_2_sokolov_zulus: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_2_sokolov_zulus",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_2_sokolov_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_2_sokolov_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_2_zulus_wanderer: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_2_zulus_wanderer",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_3_vano_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_3_vano_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_3_sokolov_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_3_sokolov_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_3_zulus_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_3_zulus_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_3_wanderer_alive: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_3_wanderer_alive",
      direction: CSightParams.eSightTypeAnimationDirection
    },

    pri_a15_military_4_all_dead: {
      weapon: "unstrapped",
      movement: move.stand,
      mental: anim.free,
      bodystate: move.standing,
      animstate: null,
      animation: "pri_a15_military_4_all_dead",
      direction: CSightParams.eSightTypeAnimationDirection
    }
  } as any;
}

export function add_animation_list_pri_a15(): LuaTable<number, LuaTable<number, string>> {
  return {
    pri_a15_idle_none: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: ["chest_0_idle_0"]
      },
      out: null,
      idle: {
        [0]: "chest_0_idle_0"
      },
      rnd: null
    },

    pri_a15_idle_unstrap: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: ["chest_0_idle_0"]
      },
      out: null,
      idle: {
        [0]: "chest_0_idle_0"
      },
      rnd: null
    },
    // -- Vano
    pri_a15_vano_all: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("vano", "vano, sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_vano_1_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("vano", "vano, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_vano_1_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("vano", "vano, sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_vano_1_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("vano", "vano, sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_vano_2_sokolov_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("vano", "vano, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_vano_2_sokolov_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("vano", "vano, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_vano_2_zulus_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("vano", "vano, sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_vano_3_vano_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("vano", "vano")
      },
      out: null,
      idle: null,
      rnd: null
    },
    // -- Sokolov
    pri_a15_sokolov_all: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("sokolov", "vano, sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_sokolov_1_vano: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("sokolov", "sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_sokolov_1_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("sokolov", "vano, sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_sokolov_1_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("sokolov", "vano, sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_sokolov_2_vano_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("sokolov", "sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_sokolov_2_vano_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("sokolov", "sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_sokolov_2_zulus_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("sokolov", "vano, sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_sokolov_3_sokolov_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("sokolov", "sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },
    // -- Zulus
    pri_a15_zulus_all: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("zulus", "vano, sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_zulus_1_vano: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("zulus", "sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_zulus_1_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("zulus", "vano, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_zulus_1_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("zulus", "vano, sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_zulus_2_vano_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("zulus", "zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_zulus_2_vano_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("zulus", "sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_zulus_2_sokolov_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("zulus", "vano, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_zulus_3_zulus_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("zulus", "zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },
    pri_a15_wanderer_all: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("wanderer", "vano, sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_wanderer_1_vano: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("wanderer", "sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_wanderer_1_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("wanderer", "vano, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_wanderer_1_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("wanderer", "vano, sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_wanderer_2_vano_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("wanderer", "zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_wanderer_2_vano_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("wanderer", "sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_wanderer_2_sokolov_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("wanderer", "vano, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_wanderer_3_wanderer_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("wanderer", "wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },
    // -- Actor
    pri_a15_actor_all: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "vano, sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_1_vano: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_1_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "vano, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_1_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "vano, sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_1_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "vano, sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_2_vano_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_2_vano_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_2_vano_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },
    pri_a15_actor_2_sokolov_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "vano, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_2_sokolov_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "vano, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_2_zulus_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "vano, sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_3_vano_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "vano")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_3_sokolov_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_3_zulus_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_3_wanderer_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_actor_all_dead: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("actor", "actor")
      },
      out: null,
      idle: null,
      rnd: null
    },
    // -- Military Tarasov
    pri_a15_military_tarasov_all: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "vano, sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_1_vano: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_1_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "vano, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_1_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "vano, sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_1_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "vano, sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_2_vano_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_2_vano_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_2_vano_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },
    pri_a15_military_tarasov_2_sokolov_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "vano, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_2_sokolov_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "vano, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_2_zulus_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "vano, sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_3_vano_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "vano")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_3_sokolov_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_3_zulus_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_3_wanderer_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_tarasov_all_dead: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_tarasov", "actor")
      },
      out: null,
      idle: null,
      rnd: null
    },
    // -- Military 2
    pri_a15_military_2_all: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "vano, sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_1_vano: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_1_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "vano, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_1_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "vano, sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_1_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "vano, sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_2_vano_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_2_vano_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_2_vano_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },
    pri_a15_military_2_2_sokolov_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "vano, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_2_sokolov_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "vano, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_2_zulus_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "vano, sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_3_vano_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "vano")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_3_sokolov_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_3_zulus_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_3_wanderer_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_2_all_dead: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_2", "actor")
      },
      out: null,
      idle: null,
      rnd: null
    },
    // -- Military 3
    pri_a15_military_3_all: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "vano, sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_1_vano: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_1_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "vano, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_1_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "vano, sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_1_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "vano, sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_2_vano_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_2_vano_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_2_vano_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },
    pri_a15_military_3_2_sokolov_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "vano, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_2_sokolov_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "vano, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_2_zulus_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "vano, sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_3_vano_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "vano")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_3_sokolov_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_3_zulus_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_3_wanderer_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_3_all_dead: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_3", "actor")
      },
      out: null,
      idle: null,
      rnd: null
    },
    // -- Military 4
    pri_a15_military_4_all: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "vano, sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_1_vano: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "sokolov, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_1_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "vano, zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_1_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "vano, sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_1_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "vano, sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_2_vano_sokolov: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "zulus, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_2_vano_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "sokolov, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_2_vano_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "sokolov, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },
    pri_a15_military_4_2_sokolov_zulus: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "vano, wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_2_sokolov_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "vano, zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_2_zulus_wanderer: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "vano, sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_3_vano_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "vano")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_3_sokolov_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "sokolov")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_3_zulus_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "zulus")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_3_wanderer_alive: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "wanderer")
      },
      out: null,
      idle: null,
      rnd: null
    },

    pri_a15_military_4_all_dead: {
      prop: {
        maxidle: 1,
        sumidle: 1,
        rnd: 100,
        moving: true
      },
      into: {
        [0]: get_sequence_for_npc("military_4", "actor")
      },
      out: null,
      idle: null,
      rnd: null
    }
  } as any;
}
