import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { Xr3tButton, XrCheckBox, XrRoot, XrStatic, XrText } from "@/engine/forms/components/base";
import { WHITE } from "@/engine/lib/constants/colors";
import { fonts } from "@/engine/lib/constants/fonts";

/**
 * todo;
 */
export function create(): JSXNode {
  return (
    <XrRoot>
      <XrText tag={"nearest_stalker_label"} x={12} y={12} label={"none"} />
      <XrText tag={"target_stalker_label"} x={12} y={32} label={"none"} />
      <XrText tag={"target_stalker_relation_label"} x={140} y={32} label={"none"} />
      <XrText tag={"target_stalker_squad_relation_label"} x={240} y={32} label={"none"} />
      <XrText tag={"target_stalker_health_label"} x={340} y={32} label={"none"} />

      <XrCheckBox tag={"use_target_object_check"} x={12} y={50} width={24} height={20} />
      <XrStatic tag={"use_target_object_label"} x={40} y={50} width={60} height={16}>
        <XrText label={"Use target object"} color={WHITE} />
      </XrStatic>

      {renderLoggingButtons()}

      {renderRelationButtons()}
    </XrRoot>
  );
}

/**
 * todo;
 */
function renderLoggingButtons(): JSXNode {
  return (
    <Fragment>
      <Xr3tButton
        tag={"log_planner_state"}
        label={"Log planner state"}
        x={12}
        y={72}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />

      <Xr3tButton
        tag={"log_state_manager_state"}
        label={"Log state manager"}
        x={12}
        y={92}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />

      <Xr3tButton
        tag={"log_relations_state"}
        label={"Log relations state"}
        x={12}
        y={112}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />

      <Xr3tButton
        tag={"log_inventory_state"}
        label={"Log inventory state"}
        x={12}
        y={132}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />

      <Xr3tButton
        tag={"log_state"}
        label={"Log state"}
        x={12}
        y={152}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />
    </Fragment>
  );
}

/**
 * todo;
 */
function renderRelationButtons(): JSXNode {
  return (
    <Fragment>
      <Xr3tButton
        tag={"set_friend_button"}
        label={"Set friends"}
        x={90}
        y={72}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />

      <Xr3tButton
        tag={"set_neutral_button"}
        label={"Set neutral"}
        x={90}
        y={92}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />

      <Xr3tButton
        tag={"set_enemy_button"}
        label={"Set enemy"}
        x={90}
        y={112}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />

      <Xr3tButton
        tag={"kill_button"}
        label={"Kill"}
        x={90}
        y={132}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />

      <Xr3tButton
        tag={"set_wounded_button"}
        label={"Set wounded"}
        x={90}
        y={152}
        width={72}
        height={16}
        textColor={WHITE}
        font={fonts.letterica16}
      />
    </Fragment>
  );
}
