/**
 * todo;
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

  ["stretch", "alwaysShowScroll", "flipVert", "canSelect"].forEach((key) => {
    const it = nextProps[key as keyof T];

    if (typeof it === "boolean") {
      nextProps[key as keyof T] = (it ? "1" : "0") as any;
    }
  });

  return nextProps;
}
