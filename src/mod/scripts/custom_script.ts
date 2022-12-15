const a: number = 1;
const b: number = 2;

function logCustom(value: string, ...rest: Array<string>): void {
  // console:execute(string.gsub(string.format(fmt,...), " ", "_"))
  log("Custom log");
  log(value);
}

logCustom("testing 123456");
logCustom("testing 15523525");
