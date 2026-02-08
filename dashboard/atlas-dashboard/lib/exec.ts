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

export async function runOpenClawGatewayStatus() {
  return runOpenClaw(["gateway", "status"]);
}

export async function runOpenClawGatewayRestart() {
  return runOpenClaw(["gateway", "restart"], 15_000);
}

export async function runOpenClawGatewayStart() {
  return runOpenClaw(["gateway", "start"], 15_000);
}

export async function runOpenClawSessionsJson() {
  return runOpenClaw(["sessions", "--json"], 10_000);
}
