type SomeAlias = number | string;

class SomeClass {
  public first!: string;
  public second!: number;
}

interface IAbstractInterface {
  a: number;
  b: string;
}

/**
 * Mock `extern` method for testing.
 */
function extern<TArgs extends Array<unknown>, TResult>(name: string, cb: (...args: TArgs) => TResult): void {}

/**
 * Mock `another` method for testing of incorrect module global level calls.
 */
function another<TArgs extends Array<unknown>, TResult>(name: string, cb: (...args: TArgs) => TResult): void {}

extern("module.callback_name_one", (a: number, b: string, c: boolean, d: SomeAlias): boolean => true);

/**
 * Docblock.
 *
 * @param a - some number
 * @param b - some string
 * @param c - some boolean
 * @returns some boolean value
 */
extern("module_two.callback_name_two", (a: SomeClass, b: IAbstractInterface): boolean => true);

/**
 * Docblock 2.
 *
 * @param c - some array
 * @param d
 * @returns some boolean value
 */
extern("module_two.callback_name_two", (c: Array<string>, d: [number, string]): boolean => true);

extern("module_two.callback_name_three", ([e, f]: [number, string, SomeAlias]): boolean => true);

extern("module_two.callback_name_four", ([e, f]: [null, unknown]): boolean => true);

extern(
  "module_two.callback_name_five",
  ([e, f, g, h]: ["a" | "b", 1 | 2, true | false, SomeClass | SomeAlias]): boolean => true
);

another("another_module.another_callback_name", (a: number, b: string): boolean => false);

// Invalid.
// @ts-expect-error -- `extern` requires a callback.
extern("test");
// Invalid.
// @ts-expect-error -- the module name and callback have incompatible types.
extern(1, 1);
// Invalid.
// @ts-expect-error -- `extern` requires a callback function.
extern("test", 1);

export {};
