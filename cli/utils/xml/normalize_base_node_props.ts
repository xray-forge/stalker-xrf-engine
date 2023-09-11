/**
 * Normalize node props based on TS calculations to satisfy XRay format.
 * For example, some boolean fields should be casted to numbers (0, 1) or some numbers should be rounded.
 */
export function normalizeBaseNodeProps<T extends object>(props: T): T {
  const nextProps: T = { ...props };

  ["x", "y", "width", "height", "rightIdent", "leftIdent", "topIndent", "bottomIndent", "vertInterval"].forEach(
    (key) => {
      const it = nextProps[key as keyof T];

      if (typeof it === "number") {
        nextProps[key as keyof T] = Math.round(it) as any;
      }
    }
  );

  ["stretch", "complexMode", "alwaysShowScroll", "flipVert", "canSelect", "inverseDirection"].forEach((key) => {
    const it = nextProps[key as keyof T];

    if (typeof it === "boolean") {
      nextProps[key as keyof T] = (it ? "1" : "0") as any;
    }
  });

  return nextProps;
}
