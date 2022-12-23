import { Fragment, JSXNode, JSXXML } from "jsx-xml";

import { TFontId } from "@/mod/globals/fonts";
import { textures } from "@/mod/globals/textures";
import { IBaseXmlNode, IRgbColor } from "@/mod/lib/types";
import { XrStatic } from "@/mod/ui/components/base/XrStatic.component";
import { XrTabButton } from "@/mod/ui/components/base/XrTabButton.component";
import { XrText } from "@/mod/ui/components/base/XrText.component";
import { XrTextColor } from "@/mod/ui/components/base/XrTextColor.component";

import { normalizeBaseNodeCoordinates } from "#/utils";

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
  const { id, x, y, width, height = 38, font, textColor, tabs } = normalizeBaseNodeCoordinates(props);
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
          texture={textures.ui_inGame2_opt_buttons_frame}
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
            texture={index === tabs.length - 1 ? textures.ui_inGame2_opt_button_2 : textures.ui_inGame2_opt_button_1}
          >
            <XrText label={it.label} font={font} align={"c"} />
            <XrTextColor textColor={textColor} />
          </XrTabButton>
        ))}
      </tab>
    </Fragment>
  );
}
