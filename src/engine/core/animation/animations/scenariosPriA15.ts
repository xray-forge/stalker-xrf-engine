import { IAnimationDescriptor, TAnimationSequenceElements } from "@/engine/core/animation/types";
import { registry } from "@/engine/core/database";
import { createSequence } from "@/engine/core/utils/animation";
import { abort } from "@/engine/core/utils/assertion";
import { parseStringsList } from "@/engine/core/utils/ini";
import { infoPortions } from "@/engine/lib/constants/info_portions";
import { storyNames } from "@/engine/lib/constants/story_names";
import { GameObject, LuaArray, Optional, TIndex, TName } from "@/engine/lib/types";

const WEAPONS_TABLE_STRAPPED: LuaArray<TName> = $fromArray([
  "pri_a15_wpn_svu",
  "pri_a15_wpn_wincheaster1300",
  "pri_a15_wpn_ak74u",
  "pri_a15_wpn_ak74",
]);

const WEAPONS_TABLE_UNSTRAPPED: LuaArray<TName> = $fromArray([
  "pri_a15_wpn_svu_unstrapped",
  "pri_a15_wpn_wincheaster1300_unstrapped",
  "pri_a15_wpn_ak74u_unstrapped",
  "pri_a15_wpn_ak74_unstrapped",
]);

/**
 * todo;
 */
function unstrapWeapon(object: GameObject): void {
  let item: Optional<GameObject> = null;
  let index: TIndex = 0;

  for (const [k, v] of WEAPONS_TABLE_STRAPPED) {
    item = object.object(v);
    if (item !== null) {
      index = k;
      break;
    }
  }

  if (item === null) {
    abort("Can not find item in %s", object.name());
  }

  item.attachable_item_load_attach(WEAPONS_TABLE_UNSTRAPPED.get(index as TIndex));
}

/**
 * todo;
 */
function strapWeapon(object: GameObject): void {
  let item: Optional<GameObject> = null;
  let index: TIndex = 0;

  for (const [k, v] of pairs(WEAPONS_TABLE_STRAPPED)) {
    item = object.object(v);
    if (item !== null) {
      index = k;
      break;
    }
  }

  if (item === null) {
    abort("cant find item in %s", object.name());
  }

  item.attachable_item_load_attach(WEAPONS_TABLE_STRAPPED.get(index));
}

const cutscene: Record<
  number,
  {
    precondition: Array<string>;
    animation: Record<
      string,
      {
        a?: string;
        a2?: string;
        att?: string;
        s?: string;
        s1?: string;
        det?: string;
        f?: (object: GameObject) => void;
        f1?: (object: GameObject) => void;
      }
    >;
  }
> = {
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
      military_4: { a: "pri_a15_soldier_3_cam1" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam2" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam3" },
    },
  },
  [4]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam4" },
      sokolov: { a: "pri_a15_cokolov_cam4" },
      zulus: { a: "pri_a15_zulus_cam4" },
      wanderer: { a: "pri_a15_monolit_cam4" },
      actor: {
        a: "pri_a15_igrok_cam4",
        f1: () => {
          registry.doors.get(storyNames.pri_a15_door).startAnimation(true);
        },
        f: () => {
          registry.actor.give_info_portion(infoPortions.pri_a15_lights_off);
        },
      },
      military_tarasov: { a: "pri_a15_soldier_kam_cam4" },
      military_2: { a: "pri_a15_soldier_1_cam4" },
      military_3: { a: "pri_a15_soldier_2_cam4" },
      military_4: { a: "pri_a15_soldier_3_cam4" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam5" },
    },
  },
  [6]: {
    precondition: ["vano", "wanderer", "zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam6" },
      sokolov: { a: "pri_a15_cokolov_cam6" },
      zulus: { a: "pri_a15_zulus_cam6" },
      wanderer: { a: "pri_a15_monolit_cam6_1", f: unstrapWeapon, a2: "pri_a15_monolit_cam6_2" },
      actor: { a: "pri_a15_igrok_cam6" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam6" },
      military_2: { a: "pri_a15_soldier_1_cam6" },
      military_3: { a: "pri_a15_soldier_2_cam6" },
      military_4: { a: "pri_a15_soldier_3_cam6" },
    },
  },
  [7]: {
    precondition: ["vano", "wanderer", "zulus"],
    animation: {
      vano: { a: "pri_a15_vano_cam7_1", f: unstrapWeapon, a2: "pri_a15_vano_cam7_2" },
      sokolov: { a: "pri_a15_cokolov_cam7" },
      zulus: { a: "pri_a15_zulus_cam7" },
      wanderer: { a: "pri_a15_monolit_cam7" },
      actor: { a: "pri_a15_igrok_cam7" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam7" },
      military_2: { a: "pri_a15_soldier_1_cam7" },
      military_3: { a: "pri_a15_soldier_2_cam7" },
      military_4: { a: "pri_a15_soldier_3_cam7" },
    },
  },
  [8]: {
    precondition: ["vano", "sokolov"],
    animation: {
      vano: { a: "pri_a15_vano_cam8" },
      sokolov: { a: "pri_a15_cokolov_cam8_1", f: unstrapWeapon, a2: "pri_a15_cokolov_cam8_2" },
      zulus: { a: "pri_a15_zulus_cam8" },
      wanderer: { a: "pri_a15_monolit_cam8" },
      actor: { a: "pri_a15_igrok_cam8" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam8" },
      military_2: { a: "pri_a15_soldier_1_cam8" },
      military_3: { a: "pri_a15_soldier_2_cam8" },
      military_4: { a: "pri_a15_soldier_3_cam8" },
    },
  },
  [9]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam9" },
      sokolov: { a: "pri_a15_cokolov_cam9" },
      zulus: { a: "pri_a15_zulus_cam9" },
      wanderer: { a: "pri_a15_monolit_cam9" },
      actor: { a: "pri_a15_igrok_cam9_1", f: unstrapWeapon, a2: "pri_a15_igrok_cam9_2" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam9", s: "pri_a15_army_hide_weapon" },
      military_2: { a: "pri_a15_soldier_1_cam9" },
      military_3: { a: "pri_a15_soldier_2_cam9" },
      military_4: { a: "pri_a15_soldier_3_cam9" },
    },
  },
  [10]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "pri_a15_vano_cam10" },
      sokolov: { a: "pri_a15_cokolov_cam10" },
      zulus: { a: "pri_a15_zulus_cam10" },
      wanderer: { a: "pri_a15_monolit_cam10" },
      actor: { a: "pri_a15_igrok_cam10" },
      military_tarasov: {
        a: "pri_a15_soldier_kam_cam10",
        f1: () => {
          registry.actor.disable_info_portion(infoPortions.pri_a15_lights_off);
        },
      },
      military_2: { a: "pri_a15_soldier_1_cam10" },
      military_3: { a: "pri_a15_soldier_2_cam10" },
      military_4: { a: "pri_a15_soldier_3_cam10" },
    },
  },
  [11]: {
    precondition: ["sokolov"],
    animation: {
      vano: { a: "pri_a15_vano_cam11" },
      sokolov: {
        a: "pri_a15_cokolov_cam11_1",
        s: "pri_a15_sokolov_introduce",
        f: strapWeapon,
        a2: "pri_a15_cokolov_cam11_2",
      },
      zulus: { a: "pri_a15_zulus_cam11" },
      wanderer: { a: "pri_a15_monolit_cam11" },
      actor: { a: "pri_a15_igrok_cam11" },
      military_tarasov: { a: "pri_a15_soldier_kam_cam11" },
      military_2: { a: "pri_a15_soldier_1_cam11" },
      military_3: { a: "pri_a15_soldier_2_cam11" },
      military_4: { a: "pri_a15_soldier_3_cam11" },
    },
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
        f: strapWeapon,
        s: "pri_a15_actor_need_talk_with_commander",
      },
      military_tarasov: { a: "pri_a15_soldier_kam_cam12" },
      military_2: { a: "pri_a15_soldier_1_cam12" },
      military_3: { a: "pri_a15_soldier_2_cam12" },
      military_4: { a: "pri_a15_soldier_3_cam12" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam13" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam14" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam15" },
    },
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
        a2: "pri_a15_igrok_cam16_2",
      },
      military_tarasov: { a: "pri_a15_soldier_kam_cam16" },
      military_2: { a: "pri_a15_soldier_1_cam16" },
      military_3: { a: "pri_a15_soldier_2_cam16" },
      military_4: { a: "pri_a15_soldier_3_cam16" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam17" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam17_1" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam18" },
    },
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
      military_4: { a: "" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam19" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam20" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam21" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam22" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam23" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam24" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam25" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam25_1" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam26" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam27" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam28" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam29" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam30" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam31" },
    },
  },
  [35]: {
    precondition: ["vano", "sokolov", "zulus", "wanderer", "actor"],
    animation: {
      vano: { a: "" },
      sokolov: { a: "" },
      zulus: { a: "" },
      wanderer: { a: "" },
      actor: {
        a: "",
        f: () => {
          registry.actor.give_info_portion(infoPortions.pri_a15_cutscene_end);
        },
      },
      military_tarasov: { a: "" },
      military_2: { a: "" },
      military_3: { a: "" },
      military_4: { a: "" },
    },
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
      military_4: { a: "pri_a15_soldier_3_cam32" },
    },
  },
};

/**
 *
 */
function check_availability(precondition: LuaArray<string>, existing_npc: string): boolean {
  const check_names = parseStringsList(existing_npc);

  for (const [k, v] of precondition) {
    for (const [kk, vv] of check_names) {
      if (v === vv) {
        return true;
      }
    }
  }

  return false;
}

// --get_sequence_for_npc("zulus", "zulus,vano")
// --get_sequence_for_npc("vano", "vano")

/**
 * todo; Needs fix
 */
function createSequenceForNpc(objectName: TName, existingObject: string): LuaArray<TAnimationSequenceElements> {
  const result: TAnimationSequenceElements = new LuaTable();

  for (const it of $range(1, table.size(cutscene as unknown as LuaTable))) {
    if (check_availability(cutscene[it].precondition as unknown as LuaArray<string>, existingObject)) {
      const anm = cutscene[it].animation[objectName].a;
      const anm2 = cutscene[it].animation[objectName].a2;
      const snd1 = cutscene[it].animation[objectName].s1;
      const snd = cutscene[it].animation[objectName].s;
      const det = cutscene[it].animation[objectName].det;
      const att = cutscene[it].animation[objectName].att;
      const func = cutscene[it].animation[objectName].f;
      const func1 = cutscene[it].animation[objectName].f1;

      if (func1 !== null) {
        const func_tbl = { f: func1! };

        table.insert(result, func_tbl);
      }

      if (snd1 !== null && snd1 !== "") {
        const snd_tbl = { s: snd1! };

        table.insert(result, snd_tbl);
      }

      if (anm !== null && anm !== "") {
        table.insert(result, anm!);
      }

      if (func !== null) {
        const func_tbl = { f: func! };

        table.insert(result, func_tbl);
      }

      if (snd !== null && snd !== "") {
        const snd_tbl = { s: snd! };

        table.insert(result, snd_tbl);
      }

      if (det !== null && det !== "") {
        const det_tbl = { d: det! };

        table.insert(result, det_tbl);
      }

      if (att !== null && att !== "") {
        const att_tbl = { a: att! };

        table.insert(result, att_tbl);
      }

      if (anm2 !== null && anm2 !== "") {
        table.insert(result, anm2!);
      }
    }
  }

  return createSequence(result);
}

/**
 * todo;
 */
export const scenariosPriA15Animations: LuaTable<TName, IAnimationDescriptor> = $fromObject<
  TName,
  IAnimationDescriptor
>({
  pri_a15_idle_none: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequence(["chest_0_idle_0"]),
    out: null,
    idle: createSequence("chest_0_idle_0"),
    rnd: null,
  },
  pri_a15_idle_unstrap: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequence(["chest_0_idle_0"]),
    out: null,
    idle: createSequence("chest_0_idle_0"),
    rnd: null,
  },
  // -- Vano
  pri_a15_vano_all: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("vano", "vano, sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_vano_1_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("vano", "vano, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_vano_1_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("vano", "vano, sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_vano_1_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("vano", "vano, sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_vano_2_sokolov_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("vano", "vano, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_vano_2_sokolov_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("vano", "vano, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_vano_2_zulus_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("vano", "vano, sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_vano_3_vano_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("vano", "vano"),
    out: null,
    idle: null,
    rnd: null,
  },
  // -- Sokolov
  pri_a15_sokolov_all: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("sokolov", "vano, sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_sokolov_1_vano: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("sokolov", "sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_sokolov_1_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("sokolov", "vano, sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_sokolov_1_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("sokolov", "vano, sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_sokolov_2_vano_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("sokolov", "sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_sokolov_2_vano_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("sokolov", "sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_sokolov_2_zulus_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("sokolov", "vano, sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_sokolov_3_sokolov_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("sokolov", "sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  // -- Zulus
  pri_a15_zulus_all: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("zulus", "vano, sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_zulus_1_vano: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("zulus", "sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_zulus_1_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("zulus", "vano, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_zulus_1_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("zulus", "vano, sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_zulus_2_vano_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("zulus", "zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_zulus_2_vano_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("zulus", "sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_zulus_2_sokolov_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("zulus", "vano, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_zulus_3_zulus_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("zulus", "zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_wanderer_all: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("wanderer", "vano, sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_wanderer_1_vano: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("wanderer", "sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_wanderer_1_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("wanderer", "vano, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_wanderer_1_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("wanderer", "vano, sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_wanderer_2_vano_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("wanderer", "zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_wanderer_2_vano_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("wanderer", "sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_wanderer_2_sokolov_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("wanderer", "vano, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_wanderer_3_wanderer_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("wanderer", "wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  // -- Actor
  pri_a15_actor_all: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "vano, sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_1_vano: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_1_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "vano, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_1_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "vano, sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_1_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "vano, sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_2_vano_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_2_vano_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_2_vano_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_2_sokolov_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "vano, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_2_sokolov_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "vano, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_2_zulus_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "vano, sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_3_vano_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "vano"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_3_sokolov_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_3_zulus_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_3_wanderer_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_actor_all_dead: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("actor", "actor"),
    out: null,
    idle: null,
    rnd: null,
  },
  // -- Military Tarasov
  pri_a15_military_tarasov_all: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "vano, sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_1_vano: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_1_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "vano, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_1_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "vano, sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_1_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "vano, sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_2_vano_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_2_vano_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_2_vano_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_2_sokolov_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "vano, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_2_sokolov_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "vano, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_2_zulus_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "vano, sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_3_vano_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "vano"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_3_sokolov_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_3_zulus_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_3_wanderer_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_tarasov_all_dead: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_tarasov", "actor"),
    out: null,
    idle: null,
    rnd: null,
  },
  // -- Military 2
  pri_a15_military_2_all: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "vano, sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_1_vano: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_1_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "vano, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_1_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "vano, sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_1_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "vano, sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_2_vano_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_2_vano_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_2_vano_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_2_sokolov_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "vano, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_2_sokolov_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "vano, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_2_zulus_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "vano, sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_3_vano_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "vano"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_3_sokolov_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_3_zulus_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_3_wanderer_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_2_all_dead: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_2", "actor"),
    out: null,
    idle: null,
    rnd: null,
  },
  // -- Military 3
  pri_a15_military_3_all: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "vano, sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_1_vano: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_1_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "vano, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_1_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "vano, sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_1_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "vano, sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_2_vano_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_2_vano_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_2_vano_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_2_sokolov_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "vano, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_2_sokolov_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "vano, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_2_zulus_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "vano, sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_3_vano_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "vano"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_3_sokolov_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_3_zulus_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_3_wanderer_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_3_all_dead: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_3", "actor"),
    out: null,
    idle: null,
    rnd: null,
  },
  // -- Military 4
  pri_a15_military_4_all: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "vano, sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_1_vano: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "sokolov, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_1_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "vano, zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_1_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "vano, sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_1_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "vano, sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_2_vano_sokolov: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "zulus, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_2_vano_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "sokolov, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_2_vano_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "sokolov, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_2_sokolov_zulus: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "vano, wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_2_sokolov_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "vano, zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_2_zulus_wanderer: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "vano, sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_3_vano_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "vano"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_3_sokolov_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "sokolov"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_3_zulus_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "zulus"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_3_wanderer_alive: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "wanderer"),
    out: null,
    idle: null,
    rnd: null,
  },
  pri_a15_military_4_all_dead: {
    prop: {
      maxidle: 1,
      sumidle: 1,
      rnd: 100,
      moving: true,
    },
    into: createSequenceForNpc("military_4", "actor"),
    out: null,
    idle: null,
    rnd: null,
  },
});
