import { exec } from "node:child_process";
import { promisify } from "node:util";

const execAsync = promisify(exec);

export async function run(cmd: string) {
  const { stdout, stderr } = await execAsync(cmd);
  return { stdout, stderr };
}
