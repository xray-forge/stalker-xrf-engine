import { GameObject } from "xray16/alias";
import { abort, ACTOR_ID, AnyCallable, extern, getExtern, LuaArray, TIndex } from "xray16/lib";
import { $fromArray, $isNil } from "xray16/macros";

import { infoPortions, TInfoPortion } from "@/engine/constants/info_portions";
import { getPortableStoreValue, setPortableStoreValue } from "@/engine/core/database";
import { disableInfoPortion, giveInfoPortion, hasInfoPortion } from "@/engine/core/utils/info_portion";

/**
 * Play the next available Jupiter b221 faction dialogue theme or its reply for the duty or freedom branch.
 *
 * @param actor - Actor game object that the played sound is bound to.
 * @param object - Game object that the played sound is bound to.
 * @param p - Tuple containing the faction branch, either duty or freedom.
 */
extern("xr_effects.jup_b221_play_main", (actor: GameObject, object: GameObject, p: [string]): void => {
  let infoPortionsList: LuaArray<TInfoPortion> = new LuaTable();
  let mainTheme: string;
  let replyTheme: string;
  let infoNeedReply: TInfoPortion;
  const reachableTheme: LuaTable = new LuaTable();

  if ($isNil(p && p[0])) {
    abort("No such parameters in function 'jup_b221_play_main'");
  }

  if (tostring(p[0]) === "duty") {
    infoPortionsList = $fromArray<TInfoPortion>([
      infoPortions.jup_b25_freedom_flint_gone,
      infoPortions.jup_b25_flint_blame_done_to_duty,
      infoPortions.jup_b4_monolith_squad_in_duty,
      infoPortions.jup_a6_duty_leader_bunker_guards_work,
      infoPortions.jup_a6_duty_leader_employ_work,
      infoPortions.jup_b207_duty_wins,
    ]);
    mainTheme = "jup_b221_duty_main_";
    replyTheme = "jup_b221_duty_reply_";
    infoNeedReply = infoPortions.jup_b221_duty_reply;
  } else if (tostring(p[0]) === "freedom") {
    infoPortionsList = $fromArray<TInfoPortion>([
      infoPortions.jup_b207_freedom_know_about_depot,
      infoPortions.jup_b46_duty_founder_pda_to_freedom,
      infoPortions.jup_b4_monolith_squad_in_freedom,
      infoPortions.jup_a6_freedom_leader_bunker_guards_work,
      infoPortions.jup_a6_freedom_leader_employ_work,
      infoPortions.jup_b207_freedom_wins,
    ]);
    mainTheme = "jup_b221_freedom_main_";
    replyTheme = "jup_b221_freedom_reply_";
    infoNeedReply = infoPortions.jup_b221_freedom_reply;
  } else {
    abort("Wrong parameters in function 'jup_b221_play_main'");
  }

  for (const [k, v] of infoPortionsList) {
    if (hasInfoPortion(v) && !hasInfoPortion((mainTheme + tostring(k) + "_played") as TInfoPortion)) {
      table.insert(reachableTheme, k);
    }
  }

  if (reachableTheme.length() !== 0) {
    const themeToPlay = table.random(reachableTheme)[1];

    disableInfoPortion(infoNeedReply);
    setPortableStoreValue(ACTOR_ID, "jup_b221_played_main_theme", tostring(themeToPlay));
    giveInfoPortion((mainTheme + tostring(themeToPlay) + "_played") as TInfoPortion);

    if (themeToPlay !== 0) {
      getExtern<AnyCallable>("play_sound", getExtern("xr_effects"))(actor, object, [
        mainTheme + tostring(themeToPlay),
        null,
        null,
      ]);
    } else {
      abort("No such theme_to_play in function 'jup_b221_play_main'");
    }
  } else {
    const themeToPlay: TIndex = tonumber(getPortableStoreValue(ACTOR_ID, "jup_b221_played_main_theme", 0)) as TIndex;

    giveInfoPortion(infoNeedReply);

    if (themeToPlay !== 0) {
      getExtern<AnyCallable>("play_sound", getExtern("xr_effects"))(actor, object, [
        replyTheme + tostring(themeToPlay),
        null,
        null,
      ]);
    } else {
      abort("No such theme_to_play in function 'jup_b221_play_main'");
    }

    setPortableStoreValue(ACTOR_ID, "jup_b221_played_main_theme", "0");
  }
});
