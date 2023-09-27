import { describe, expect, it } from "@jest/globals";

import {
  newBooleanField,
  newCondlistField,
  newCondlistsField,
  newFloatField,
  newFloatsField,
  newIntegerField,
  newIntegersField,
  newStringField,
  newStringsField,
} from "#/utils/ltx";
import { addInfo, checkChance, checkHasInfo, checkNoInfo } from "#/utils/ltx/condlist";
import { renderField } from "#/utils/ltx/render_field";

describe("render_field function", () => {
  const comment: string = "some text";

  it("should correctly generate primitive fields", () => {
    expect(renderField("test", 1)).toBe("test = 1");
    expect(renderField("test", 0)).toBe("test = 0");
    expect(renderField("test", -1)).toBe("test = -1");
    expect(renderField("test", 25.5)).toBe("test = 25.5");
    expect(renderField("test", 2000000)).toBe("test = 2000000");
    expect(renderField("test", "default_string")).toBe("test = default_string");
    expect(renderField("test", true)).toBe("test = true");
    expect(renderField("test", false)).toBe("test = false");
  });

  it("should correctly generate string fields", () => {
    expect(renderField("test", newStringField(""))).toBe("test = ");
    expect(renderField("test", newStringField("", { comment }))).toBe(`test =  ; ${comment}`);
    expect(renderField("test", newStringField("abcdef"))).toBe("test = abcdef");
    expect(renderField("test", newStringField("abcdef", { comment }))).toBe(`test = abcdef ; ${comment}`);
    expect(renderField("test", newStringField("abcdef", { comment, isBinding: true }))).toBe(
      `test abcdef ; ${comment}`
    );
    expect(renderField("test", newStringField("abcdef", { isBinding: true }))).toBe("test abcdef");
  });

  it("should correctly generate condlist fields", () => {
    expect(renderField("test", newCondlistField())).toBe("test = true");
    expect(renderField("test", newCondlistField(true))).toBe("test = true");
    expect(renderField("test", newCondlistField(true, { comment }))).toBe(`test = true ; ${comment}`);
    expect(
      renderField("test", newCondlistField({ condition: [checkHasInfo("first")], value: "ex" }, { comment }))
    ).toBe(`test = {+first} ex ; ${comment}`);
    expect(
      renderField(
        "test",
        newCondlistField(
          {
            condition: [checkHasInfo("second"), checkNoInfo("an_in"), checkChance(25)],
            action: [addInfo("some")],
            value: "ex",
          },
          { comment }
        )
      )
    ).toBe(`test = {+second -an_in ~25} ex %+some% ; ${comment}`);
  });

  it("should correctly generate condlists fields", () => {
    expect(renderField("test", newCondlistsField([true]))).toBe("test = true");
    expect(renderField("test", newCondlistsField([true], { comment }))).toBe(`test = true ; ${comment}`);
    expect(
      renderField("test", newCondlistsField([{ condition: [checkHasInfo("first")], value: "ex" }, true], { comment }))
    ).toBe(`test = {+first} ex, true ; ${comment}`);
    expect(
      renderField(
        "test",
        newCondlistsField(
          [
            {
              condition: [checkHasInfo("second"), checkNoInfo("an_in"), checkChance(25)],
              action: [addInfo("some")],
              value: "ex",
            },
            { value: "something_else", condition: [checkHasInfo("another")] },
            true,
          ],
          { comment }
        )
      )
    ).toBe(`test = {+second -an_in ~25} ex %+some%, {+another} something_else, true ; ${comment}`);
  });

  it("should correctly generate integer fields", () => {
    expect(renderField("test", newIntegerField(1234))).toBe("test = 1234");
    expect(renderField("test", newIntegerField(1234, { comment }))).toBe(`test = 1234 ; ${comment}`);
    expect(renderField("test", newIntegerField(1234, { isBinding: true }))).toBe("test 1234");
    expect(() => renderField("test", newIntegerField("a" as any, { comment }))).toThrow();
    expect(() => renderField("test", newIntegerField("a" as any, { comment }))).toThrow();
  });

  it("should correctly generate boolean fields", () => {
    expect(renderField("test", newBooleanField(true, { comment }))).toBe(`test = true ; ${comment}`);
    expect(renderField("test", newBooleanField(false, { comment }))).toBe(`test = false ; ${comment}`);
    expect(() => renderField("test", newBooleanField("a" as any, { comment }))).toThrow();
    expect(() => renderField("test", newBooleanField(1 as any, { comment }))).toThrow();
  });

  it("should correctly generate float fields", () => {
    expect(renderField("test", newFloatField(1234, { comment }))).toBe(`test = 1234.0 ; ${comment}`);
    expect(renderField("test", newFloatField(12.34, { comment }))).toBe(`test = 12.34 ; ${comment}`);
    expect(() => renderField("test", newFloatField("a" as any, { comment }))).toThrow();
  });

  it("should correctly generate empty fields", () => {
    expect(renderField("test", null)).toBe("test");
  });

  it("should correctly generate string array fields", () => {
    expect(() => renderField("test", newStringsField("a" as any, { comment }))).toThrow();
    expect(renderField("test", newStringsField(["", "", ""], { comment }))).toBe(`test = , ,  ; ${comment}`);
    expect(renderField("test", newStringsField(["a", "b", "c"], { comment }))).toBe(`test = a, b, c ; ${comment}`);
    expect(renderField("test", newStringsField(["a", "b", "c"], { comment, isBinding: true }))).toBe(
      `test a, b, c ; ${comment}`
    );
    expect(renderField("test", newStringsField(["a", "b", "c"], { isBinding: true }))).toBe("test a, b, c");
  });

  it("should correctly generate integer number array fields", () => {
    expect(renderField("test", newIntegersField([1, 2, 3], { comment }))).toBe(`test = 1, 2, 3 ; ${comment}`);
    expect(() => renderField("test", newIntegersField([1, 24, 3.4], { comment }))).toThrow();
    expect(() => renderField("test", newIntegersField(["a"] as any, { comment }))).toThrow();
    expect(() => renderField("test", newIntegersField("a" as any, { comment }))).toThrow();
  });

  it("should correctly generate floating point number array fields", () => {
    expect(() => renderField("test", newFloatsField("a" as any, { comment }))).toThrow();
    expect(renderField("test", newFloatsField([1, 2.0, 35.53], { comment }))).toBe(
      `test = 1.0, 2.0, 35.53 ; ${comment}`
    );
    expect(renderField("test", newFloatsField([123, 255.0, 1.22333], { comment }))).toBe(
      `test = 123.0, 255.0, 1.22333 ; ${comment}`
    );
  });

  it("should correctly generate fields without key", () => {
    expect(renderField(null, newStringField("bind test", { comment }))).toBe(`bind test ; ${comment}`);
    expect(renderField(null, newStringField("another"))).toBe("another");
    expect(renderField(null, newStringField("another text", { isBinding: true }))).toBe("another text");
    expect(renderField("", newStringField("another"))).toBe("another");
  });

  it("should correctly fail with unknown", () => {
    expect(() => renderField(null, {})).toThrow();
    expect(() => renderField("test", { type: "unknown" })).toThrow();
  });
});
