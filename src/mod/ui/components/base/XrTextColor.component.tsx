import { JSXNode, JSXXML } from "jsx-xml";

import { IRgbColor } from "@/mod/lib/types";

interface IXrTextColorProps {
  textColor: IRgbColor;
}

/**
 * TextComponent color describing component for usage in XML forms.
 */
export function XrTextColor({ textColor: { r, g, b } }: IXrTextColorProps): JSXNode {
  return (
    <text_color>
      <e r={r} g={g} b={b}/>
    </text_color>
  );
}
