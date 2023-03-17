import { JSXNode, JSXXML } from "jsx-xml";

import { normalizeBaseNodeProps } from "#/utils";

import { XrText, XrTextColor } from "@/mod/forms/components/base";
import { CustomTabButton } from "@/mod/forms/components/custom/CustomTabButton.component";
import { TFontId } from "@/mod/globals/fonts";
import { TTexture } from "@/mod/globals/textures";
import { IRgbColor, TTextAlign } from "@/mod/lib/types";

export interface ICustomTabProps {
  id?: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  font: TFontId;
  textColor: IRgbColor;
  align?: TTextAlign;
  vertAlign?: TTextAlign;
  tabs: Array<{ id: string; label: string; texture: TTexture }>;
}

export function CustomTab(props: ICustomTabProps): JSXNode {
  const { id, x, y, width, height = 38, font, textColor, tabs, align, vertAlign } = normalizeBaseNodeProps(props);
  const tabWidth: number = width / tabs.length;

  return (
    <tab id={id} x={x} y={y} width={width} height={height}>
      {tabs.map((it, index) => (
        <CustomTabButton
          id={it.id}
          x={index * tabWidth}
          y={0}
          width={tabWidth}
          height={height}
          texture={it.texture}
          align={align}
          vertAlign={vertAlign}
        >
          <XrText label={it.label} font={font} align={align} vertAlign={vertAlign} width={width} height={height} />
          <XrTextColor textColor={textColor} />
        </CustomTabButton>
      ))}
    </tab>
  );
}
