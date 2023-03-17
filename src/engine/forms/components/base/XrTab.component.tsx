import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { XrStatic } from "@/engine/forms/components/base/XrStatic.component";
import { XrTabButton } from "@/engine/forms/components/base/XrTabButton.component";
import { XrText } from "@/engine/forms/components/base/XrText.component";
import { XrTextColor } from "@/engine/forms/components/base/XrTextColor.component";
import { TFontId } from "@/engine/lib/constants/fonts";
import { texturesIngame } from "@/engine/lib/constants/textures";
import { IBaseXmlNode, IRgbColor } from "@/engine/lib/types";

export interface IXrTabProps extends IBaseXmlNode {
  id?: string;
  font: TFontId;
  textColor: IRgbColor;
  width: number;
  tabs: Array<{ id: string; label: string }>;
}

/**
 * Tab navigation component.
 */
export function XrTab(props: IXrTabProps): JSXNode {
  const { id, x, y, width, height = 38, font, textColor, tabs } = normalizeBaseNodeProps(props);
  const tabWidth: number = width / tabs.length;
  const padding: number = tabWidth / 5;
  const totalWidth: number = tabWidth + (tabWidth - padding) * (tabs.length - 1);

  return (
    <Fragment>
      <tab_statics>
        <XrStatic
          tag={"auto_static"}
          x={x}
          y={y}
          width={totalWidth}
          height={height}
          texture={texturesIngame.ui_inGame2_opt_buttons_frame}
        />
      </tab_statics>

      <tab id={id} x={x} y={y} width={totalWidth} height={height}>
        {tabs.map((it, index) => (
          <XrTabButton
            id={it.id}
            x={index * tabWidth - padding * index}
            y={2}
            width={tabWidth}
            height={height - 12}
            texture={
              index === tabs.length - 1
                ? texturesIngame.ui_inGame2_opt_button_2
                : texturesIngame.ui_inGame2_opt_button_1
            }
          >
            <XrText label={it.label} font={font} align={"c"} />
            <XrTextColor textColor={textColor} />
          </XrTabButton>
        ))}
      </tab>
    </Fragment>
  );
}
