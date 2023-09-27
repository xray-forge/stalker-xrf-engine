import { beforeAll, describe, expect, it, jest } from "@jest/globals";

import {
  ILtxFieldDescriptor,
  LTX_EXTEND,
  LTX_INCLUDE,
  LTX_ROOT,
  newBooleanField,
  newCondlistField,
  newCondlistsField,
  newFloatField,
  newFloatsField,
  newIntegerField,
  newIntegersField,
  newSection,
  newStringField,
  newStringsField,
  renderJsonToLtx,
  renderLtxImports,
} from "#/utils/ltx";
import { addInfo, callEffect, checkHasInfo, checkNoCondition, checkNoInfo } from "#/utils/ltx/condlist";

const NOW: string = "Sun May 28 2023 19:25:38 GMT+0300 (Eastern European Summer Time)";
const HEADER: string = `; test.ltx @ generated ${NOW}\n`;

const EMPTY: string = HEADER;
const SIMPLE: string = `${HEADER}
#include "a.ltx"
#include "b\\c.ltx"
#include "d.ltx"

a = 1
b = 2

[section1]
a
b
c

[section2]
a = test ; comment
b = t, g, r_t ; comment2
c = ex
d = e, f, g
e example ; 123

[section3]:another
a = 1
b = 2, 3, 4.5, -20.25
c = 50.5
d = -10.2
e = 1.0 ; test
f = 1.0, 5.0
g = 255
h = 2, 4, 8, 16, 32

[section4]:b1,b2,b3
a = true
b = false
c
d
e = true ; test
f false

[section5]

[section6]:base

[section7]:base1,base2,base3

[section8]:base
a
b
c\\d

[section9]
first = {+abc -def} test %=abc(p1:p2) +some_info%
second = {+ab} false, true
third = {!cd(p1)} nil
`;

describe("render_json_to_ltx utility should transform correctly", () => {
  beforeAll(() => {
    jest.spyOn(Date.prototype, "toString").mockImplementation(() => NOW);
  });

  it("should render empty ltx with imports", () => {
    expect(renderJsonToLtx("test.ltx", {})).toBe(EMPTY);
  });

  it("renderLtxImports should render imports to valid ini", () => {
    expect(renderLtxImports(["a.ltx"] as unknown as Record<string, ILtxFieldDescriptor<unknown>>)).toBe(`
#include "a.ltx"
`);
    expect(renderLtxImports(["b.ltx", "c.ltx"] as unknown as Record<string, ILtxFieldDescriptor<unknown>>)).toBe(`
#include "b.ltx"
#include "c.ltx"
`);
    expect(() => renderLtxImports({} as unknown as Record<string, ILtxFieldDescriptor<unknown>>)).toThrow();
    expect(() => renderLtxImports("test" as unknown as Record<string, ILtxFieldDescriptor<unknown>>)).toThrow();
    expect(() => renderLtxImports(null as unknown as Record<string, ILtxFieldDescriptor<unknown>>)).toThrow();
  });

  it("should render ltx with imports", () => {
    expect(
      renderJsonToLtx("test.ltx", {
        [LTX_INCLUDE]: ["a.ltx", "b\\c.ltx", "d.ltx"],
        [LTX_ROOT]: {
          a: 1,
          b: 2,
        },
        section1: ["a", "b", "c"],
        section2: {
          a: newStringField("test", { comment: "comment" }),
          b: newStringsField(["t", "g", "r_t"], { comment: "comment2" }),
          c: "ex",
          d: ["e", "f", "g"],
          e: newStringField("example", { comment: "123", isBinding: true }),
        },
        section3: {
          [LTX_EXTEND]: "another",
          a: 1,
          b: [2, 3, 4.5, -20.25],
          c: 50.5,
          d: -10.2,
          e: newFloatField(1, { comment: "test" }),
          f: newFloatsField([1, 5]),
          g: newIntegerField(255),
          h: newIntegersField([2, 4, 8, 16, 32]),
        },
        section4: {
          [LTX_EXTEND]: ["b1", "b2", "b3"],
          a: true,
          b: false,
          c: null,
          d: undefined,
          e: newBooleanField(true, { comment: "test" }),
          f: newBooleanField(false, { isBinding: true }),
        },
        section5: newSection([]),
        section6: newSection([], "base"),
        section7: newSection([], ["base1", "base2", "base3"]),
        section8: newSection(["a", "b", "c\\d"], "base"),
        section9: {
          first: newCondlistField({
            condition: [checkHasInfo("abc"), checkNoInfo("def")],
            action: [callEffect("abc", "p1", "p2"), addInfo("some_info")],
            value: "test",
          }),
          second: newCondlistsField([{ condition: [checkHasInfo("ab")], value: false }, true]),
          third: newCondlistsField([{ condition: [checkNoCondition("cd", "p1")], value: null }]),
        },
      })
    ).toBe(SIMPLE);
  });
});
