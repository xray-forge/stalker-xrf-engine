import { JSXNode, JSXXML } from "jsx-xml";

import { XrComponent, XrText } from "@/engine/forms/components/base";
import { XrTexture } from "@/engine/forms/components/base/XrTexture.component";
import { fonts } from "@/engine/lib/constants/fonts";

export function create(): JSXNode {
  return <BoosterParams />;
}

export function BoosterParams(): JSXNode {
  return (
    <XrComponent tag={"booster_params"} x={0} y={0} width={217} height={20}>
      <XrComponent tag={"prop_line"} x={0} y={0} width={208} height={9} stretch={true}>
        <XrTexture id={"ui_inGame2_hint_wnd_Properties"} />
      </XrComponent>

      <BoosterParam name={"boost_health_restore"} texture={"ui_am_propery_05"} magnitude={10000} />
      <BoosterParam name={"boost_radiation_restore"} texture={"ui_am_propery_09"} magnitude={1000} />
      <BoosterParam name={"boost_satiety"} texture={"ui_am_prop_satiety_restore_speed"} magnitude={10} />
      <BoosterParam name={"boost_anabiotic"} texture={"ui_am_prop_Vibros"} magnitude={100} />
      <BoosterParam name={"boost_power_restore"} texture={"ui_am_propery_07"} magnitude={2000} />
      <BoosterParam name={"boost_bleeding_restore"} texture={"ui_am_prop_restore_bleeding"} magnitude={1000} />
      <BoosterParam name={"boost_radiation_protection"} texture={"ui_am_propery_09"} magnitude={300} />
      <BoosterParam name={"boost_telepat_protection"} texture={"ui_am_propery_11"} magnitude={300} />
      <BoosterParam name={"boost_chemburn_protection"} texture={"ui_am_prop_chem"} magnitude={300} />
      <BoosterParam name={"boost_burn_immunity"} texture={"ui_am_prop_thermo"} magnitude={30} />
      <BoosterParam name={"boost_shock_immunity"} texture={"ui_am_prop_electro"} magnitude={48} />
      <BoosterParam name={"boost_radiation_immunity"} texture={"ui_am_propery_09"} magnitude={30} />
      <BoosterParam name={"boost_telepat_immunity"} texture={"ui_am_propery_11"} magnitude={30} />
      <BoosterParam name={"boost_chemburn_immunity"} texture={"ui_am_prop_chem"} magnitude={30} />
      <BoosterParam name={"boost_max_weight"} texture={"ui_am_propery_08"} magnitude={1} unitStr={"st_kg"} />
      <BoosterParam
        name={"boost_time"}
        texture={"ui_am_prop_time_period"}
        magnitude={1}
        showSign={0}
        unitStr={"ui_inv_seconds_short"}
      />
    </XrComponent>
  );
}

function BoosterParam({
  name,
  texture,
  magnitude,
  unitStr,
  showSign,
}: {
  name: string;
  texture: string;
  magnitude: number;
  unitStr?: string;
  showSign?: number;
}): JSXNode {
  return (
    <XrComponent tag={name} x={0} y={0} width={214} height={20}>
      <caption x={0} y={0} width={15} height={20} stretch={1}>
        <XrTexture id={texture} />
        <XrText color={"ui_3"} font={fonts.letterica16} vertAlign={"c"} x={18} y={0} />
      </caption>

      <value x={117} y={0} width={30} height={20} magnitude={magnitude} show_sign={showSign} unit_str={unitStr}>
        <XrText font={fonts.letterica16} vertAlign={"c"} />
      </value>
    </XrComponent>
  );
}
