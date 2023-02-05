/**
 * List of types that are all cast to similar number type in lua / ts.
 * Main purpose is to indicate what is used with C++ side for better documentation.
 */
declare module "xray16" {
  type u64 = number;
  type u32 = number;
  type u16 = number;
  type u8 = number;

  type i64 = number;
  type i32 = number;
  type i16 = number;
  type i8 = number;

  type f64 = number;
  type f32 = number;

  type EnumerateStaticsKeys<T> = Exclude<keyof T, "prototype"| "constructor">;

  type EnumerateStaticsValues<T> = T[Exclude<keyof T, "prototype"| "constructor">]
}
