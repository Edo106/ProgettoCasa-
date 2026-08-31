import { execFile } from "node:child_process";
import { timingSafeEqual } from "node:crypto";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";

const execFileAsync = promisify(execFile);
const DB_SETUP_ARGS = ["db", "push", "--skip-generate"];

export const runtime = "nodejs";

function isSecureTokenMatch(expected: string, received: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

async function runDbPush(): Promise<{ command: string; output: string }> {
  const prismaCliPath = join(process.cwd(), "node_modules", "prisma", "build", "index.js");
  const commandAttempts: Array<[string, string[]]> = [];

  try {
    await access(prismaCliPath);
    commandAttempts.push([process.execPath, [prismaCliPath, ...DB_SETUP_ARGS]]);
  } catch {
    // Fallbacks below
  }

  commandAttempts.push(["prisma", DB_SETUP_ARGS]);
  commandAttempts.push(["npx", ["--yes", "prisma", ...DB_SETUP_ARGS]]);

  let lastError: unknown;

  for (const [command, args] of commandAttempts) {
    try {
      const { stdout, stderr } = await execFileAsync(command, args, {
        cwd: process.cwd(),
        env: process.env,
        timeout: 120_000,
        maxBuffer: 1024 * 1024,
      });

      return {
        command: [command, ...args].join(" "),
        output: [stdout, stderr].filter(Boolean).join("\n").trim(),
      };
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  if (process.env.ENABLE_DB_SETUP_ENDPOINT !== "true") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const expectedToken = process.env.DB_SETUP_TOKEN;
  if (!expectedToken) {
    return NextResponse.json(
      { error: "Server misconfiguration: missing DB_SETUP_TOKEN" },
      { status: 500 },
    );
  }

  const receivedToken = request.headers.get("x-setup-token");
  if (!receivedToken || !isSecureTokenMatch(expectedToken, receivedToken)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Server misconfiguration: missing DATABASE_URL" },
      { status: 500 },
    );
  }

  try {
    const result = await runDbPush();

    return NextResponse.json({
      ok: true,
      message: "Database schema initialized successfully.",
      command: result.command,
      output: result.output,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to initialize database schema.",
        details: message,
      },
      { status: 500 },
    );
  }
}
