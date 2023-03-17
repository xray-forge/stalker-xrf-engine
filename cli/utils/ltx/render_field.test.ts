import { describe, expect, it } from "@jest/globals";

import {
  newBooleanField,
  newFloatField,
  newFloatsField,
  newIntegerField,
  newIntegersField,
  newStringField,
  newStringsField,
} from "#/utils";
import { renderField } from "#/utils/ltx/render_field";

describe("'render_field' function", () => {
  const comment: string = "some text";

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
});
