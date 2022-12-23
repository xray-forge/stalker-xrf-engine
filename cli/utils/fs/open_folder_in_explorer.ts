import * as cp from "child_process";
import * as os from "os";

export function openFolderInExplorer(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const osType: string = os.type();
    let cmd: string = "";

    if (osType == "Windows_NT") {
      cmd = "explorer";
    } else if (osType == "Darwin") {
      cmd = "open";
    } else {
      cmd = "xdg-open";
    }

    cp.exec(`${cmd} "${path}"`, (error, out) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
