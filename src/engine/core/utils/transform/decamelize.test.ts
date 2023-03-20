import { describe, expect, it } from "@jest/globals";

import { decamelize } from "@/engine/core/utils/transform/decamelize";

describe("'decamelize' util", () => {
  it("decamelize", () => {
    expect(decamelize("")).toBe("");
    expect(decamelize("A")).toBe("a");
    expect(decamelize("A B")).toBe("a b");
    expect(decamelize("a2b")).toBe("a2b");
    expect(decamelize("A2B")).toBe("a2_b");
    expect(decamelize("_A2B")).toBe("_a2_b");
    expect(decamelize("myURLstring")).toBe("my_ur_lstring");
    expect(decamelize("unicornsAndRainbows")).toBe("unicorns_and_rainbows");
    expect(decamelize("UNICORNS AND RAINBOWS")).toBe("unicorns and rainbows");
    expect(decamelize("unicorns-and-rainbows")).toBe("unicorns-and-rainbows");
    expect(decamelize("thisIsATest")).toBe("this_is_a_test");
    expect(decamelize("thisIsATest", { separator: " " })).toBe("this is a test");
    expect(decamelize("thisIsATest", { separator: "" })).toBe("thisisatest");
    expect(decamelize("unicornRainbow", { separator: "|" })).toBe("unicorn|rainbow");
    expect(decamelize("unicornRainbow", { separator: "-" })).toBe("unicorn-rainbow");
    expect(decamelize("thisHasSpecialCharactersLikeČandŠ", { separator: " " })).toBe(
      "this has special characters like čand š"
    );
  });

  it("handles acronyms", () => {
    expect(decamelize("myURLString")).toBe("my_url_string");
    expect(decamelize("URLString")).toBe("url_string");
    expect(decamelize("StringURL")).toBe("string_url");
    expect(decamelize("testGUILabel")).toBe("test_gui_label");
    expect(decamelize("CAPLOCKED1")).toBe("caplocked1");
  });

  it("separator in string", () => {
    expect(decamelize("my_URL_string")).toBe("my_url_string");
  });

  it("separator and options passed", () => {
    expect(
      decamelize("testGUILabel", {
        separator: "!",
        preserveConsecutiveUppercase: true,
      })
    ).toBe("test!GUI!label");
  });

  it("keeping blocks of consecutive uppercase characters but split the last if lowercase characters follow", () => {
    expect(
      decamelize("A", {
        preserveConsecutiveUppercase: true,
      })
    ).toBe("A");
    expect(
      decamelize("myURLString", {
        preserveConsecutiveUppercase: true,
      })
    ).toBe("my_URL_string");
    expect(
      decamelize("URLString", {
        preserveConsecutiveUppercase: true,
      })
    ).toBe("URL_string");
    expect(
      decamelize("oxygenO2Level", {
        preserveConsecutiveUppercase: true,
      })
    ).toBe("oxygen_O2_level");
    expect(
      decamelize("StringURL", {
        preserveConsecutiveUppercase: true,
      })
    ).toBe("string_URL");
    expect(
      decamelize("STringURL", {
        preserveConsecutiveUppercase: true,
      })
    ).toBe("S_tring_URL");
    expect(
      decamelize("numberOfDataForUSA", {
        preserveConsecutiveUppercase: true,
      })
    ).toBe("number_of_data_for_USA");
    expect(
      decamelize("testGUILabel", {
        preserveConsecutiveUppercase: true,
      })
    ).toBe("test_GUI_label");
    expect(
      decamelize("CAPLOCKED1", {
        preserveConsecutiveUppercase: true,
      })
    ).toBe("CAPLOCKED1");
  });
});
