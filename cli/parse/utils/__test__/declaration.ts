type SomeAlias = number | string;

class SomeClass {
  public first: string;
  public second: number;
}

interface IAbstractInterface {
  a: number;
  b: string;
}

function extern(name: string, cb: (...args: Array<unknown>) => void): void {}

function another(name: string, cb: (...args: Array<unknown>) => void): void {}

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
 * @param d - another array
 * @returns some boolean value
 */
extern("module_two.callback_name_two", (c: Array<string>, d: [number, string]): boolean => true);

extern("module_two.callback_name_three", ([e, f]: [number, string, SomeAlias]): boolean => true);

another("another_module.another_callback_name", (a: number, b: string): boolean => false);
