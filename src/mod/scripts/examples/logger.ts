const a: number = 1;
const b: number = 2;

export function logCustom(value: string | number, ...rest: Array<string>): void {
  // console:execute(string.gsub(string.format(fmt,...), " ", "_"))
  log("Custom log");
  log(value);
}
