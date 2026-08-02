import { TIndex, TName, TSection, TStringId } from "xray16/lib";
import { $fromObject } from "xray16/macros";

import { infoPortions } from "@/engine/constants/info_portions";
import { artefacts } from "@/engine/constants/items/artefacts";

/**
 * Mapping of zat_b29 advanced task indices to their artefact sections.
 */
export const zatB29AfTable: LuaTable<TIndex, string> = $fromObject<TIndex, TSection>({
  [16]: artefacts.af_gravi,
  [17]: artefacts.af_eye,
  [18]: artefacts.af_baloon,
  [19]: artefacts.af_dummy_dummy,
  [20]: artefacts.af_gold_fish,
  [21]: artefacts.af_fire,
  [22]: artefacts.af_glass,
  [23]: artefacts.af_ice,
});

/**
 * Mapping of zat_b29 advanced task indices to their localized artefact name keys.
 */
export const zatB29AfNamesTable: LuaTable<TIndex, TName> = $fromObject<TIndex, TName>({
  [16]: "st_af_gravi_name",
  [17]: "st_af_eye_name",
  [18]: "st_af_baloon_name",
  [19]: "st_af_dummy_dummy_name",
  [20]: "st_af_gold_fish_name",
  [21]: "st_af_fire_name",
  [22]: "st_af_glass_name",
  [23]: "st_af_ice_name",
});

/**
 * Mapping of zat_b29 advanced task indices to their requested-artefact info portions.
 */
export const zatB29InfopTable: LuaTable<TIndex, TName> = $fromObject<TIndex, TName>({
  [16]: infoPortions.zat_b29_af_16,
  [17]: infoPortions.zat_b29_af_17,
  [18]: infoPortions.zat_b29_af_18,
  [19]: infoPortions.zat_b29_af_19,
  [20]: infoPortions.zat_b29_af_20,
  [21]: infoPortions.zat_b29_af_21,
  [22]: infoPortions.zat_b29_af_22,
  [23]: infoPortions.zat_b29_af_23,
});

/**
 * Mapping of zat_b29 advanced task indices to their bring-artefact info portion ids.
 */
export const zatB29InfopBringTable: LuaTable<TIndex, TStringId> = $fromObject<TIndex, TStringId>({
  [16]: "zat_b29_bring_af_16",
  [17]: "zat_b29_bring_af_17",
  [18]: "zat_b29_bring_af_18",
  [19]: "zat_b29_bring_af_19",
  [20]: "zat_b29_bring_af_20",
  [21]: "zat_b29_bring_af_21",
  [22]: "zat_b29_bring_af_22",
  [23]: "zat_b29_bring_af_23",
});
