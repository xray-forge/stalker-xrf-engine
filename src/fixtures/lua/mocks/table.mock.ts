/**
 * todo;
 */
export const table = {
  insert: (target: LuaTable, element: unknown) => {
    if (target instanceof Map) {
      target.set(target.size + 1, element);
    } else {
      target.set(target.length() + 1, element);
    }
  },
};
