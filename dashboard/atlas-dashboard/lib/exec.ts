import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function runOpenClaw(args: string[], timeout = 5000) {
  const { stdout, stderr } = await execFileAsync("openclaw", args, {
    timeout,
    maxBuffer: 1024 * 1024,
  });
  return { stdout, stderr };
}

export async function runOpenClawStatus() {
  // No shell; fixed allowlisted command.
  // OpenClaw CLI: gateway status is the stable command.
  return runOpenClaw(["gateway", "status"]);
}

export async function runOpenClawSessionsJson() {
  return runOpenClaw(["sessions", "--json"], 10_000);
}
