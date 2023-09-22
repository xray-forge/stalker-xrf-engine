import { describe, expect, it } from "@jest/globals";

import { extern, getExtern } from "@/engine/core/utils/binding";

describe("binding utils", () => {
  it("binding utils should correctly work in pair with simple examples", () => {
    extern("sample1", 10);
    expect(getExtern("sample1")).toBe(10);

    extern("sample2", true);
    expect(getExtern("sample2")).toBe(true);

    extern("sample3", { a: 1, b: 2, c: 3 });
    expect(getExtern("sample3")).toStrictEqual({ a: 1, b: 2, c: 3 });
  });

  it("binding utils should correctly work in pair with complex examples", () => {
    extern("sample4.deep.nested", 10);
    expect(getExtern("nested", getExtern("deep", getExtern("sample4")))).toBe(10);

    extern("sample5.deep.nested", { a: 1, b: 2, c: 3 });
    expect(getExtern("nested", getExtern("deep", getExtern("sample5")))).toStrictEqual({ a: 1, b: 2, c: 3 });
  });
});
