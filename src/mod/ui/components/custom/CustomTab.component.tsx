import { JSXNode, JSXXML } from "jsx-xml";

import { TFontId } from "@/mod/globals/fonts";
import { TTextureId } from "@/mod/globals/textures";
import { IRgbColor, TTextAlign } from "@/mod/lib/types";
import { XrText, XrTextColor } from "@/mod/ui/components/base";
import { CustomTabButton } from "@/mod/ui/components/custom/CustomTabButton.component";

import { normalizeBaseNodeCoordinates } from "#/utils";

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
  tabs: Array<{ id: string; label: string; texture: TTextureId }>;
}

export function CustomTab(props: ICustomTabProps): JSXNode {
  const { id, x, y, width, height = 38, font, textColor, tabs, align, vertAlign } = normalizeBaseNodeCoordinates(props);
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
