export function normalizeBaseNodeCoordinates<T extends object>(props: T): T {
  const nextProps: T = { ...props };

  ["x", "y", "width", "height"].forEach((key) => {
    const it = nextProps[key];

    if (typeof it === "number") {
      nextProps[key] = Math.round(it);
    }
  });

  ["stretch"].forEach((key) => {
    const it = nextProps[key];

    if (typeof it === "boolean") {
      nextProps[key] = it ? "1" : "0";
    }
  });

  return nextProps;
}
