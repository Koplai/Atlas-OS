import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function runOpenClawStatus() {
  // No shell; fixed allowlisted command.
  // OpenClaw CLI: gateway status is the stable command.
  const { stdout, stderr } = await execFileAsync(
    "openclaw",
    ["gateway", "status"],
    { timeout: 5000, maxBuffer: 1024 * 1024 },
  );
  return { stdout, stderr };
}
