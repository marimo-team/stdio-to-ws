import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { inspect } from "node:util";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";

let isQuiet = false;

export type FramingMode = "raw" | "line";

function logError(...args: unknown[]): void {
  if (!isQuiet) console.error("[stdio-to-ws]", ...args);
}
function log(...args: unknown[]): void {
  if (!isQuiet) console.log("[stdio-to-ws]", ...args);
}

function prettyPrintMessage(
  direction: "[Client → Server]" | "[Server → Client]",
  message: string,
): void {
  try {
    const parsed = JSON.parse(message);
    console.log(`${direction}:`, inspect(parsed, { depth: 5, colors: true }));
  } catch {
    // Not JSON, print as-is
    console.log(`${direction}:`, message);
  }
}

function handleWebSocketConnection(
  command: string[],
  webSocket: WebSocket,
  framing: FramingMode,
): void {
  const child = spawn(command[0]!, command.slice(1));

  const closeStdout = (() => {
    if (framing === "line") {
      child.stdout.setEncoding("utf8");
      const stdoutLines = createInterface({
        input: child.stdout,
        crlfDelay: Infinity,
      });
      stdoutLines.on("line", (line) => {
        try {
          if (line.length === 0) return;
          prettyPrintMessage("[Server → Client]", line);
          webSocket.send(line);
        } catch (error) {
          logError("Failed to send data to WebSocket:", error);
        }
      });
      return () => stdoutLines.close();
    }

    child.stdout.on("data", (data) => {
      try {
        const message = data.toString();
        const content = message.replace(/^Content-Length: \d+\r?\n\r?\n/, "");
        prettyPrintMessage("[Server → Client]", content);
        webSocket.send(content);
      } catch (error) {
        logError("Failed to send data to WebSocket:", error);
      }
    });
    return () => {};
  })();

  child.on("error", (error) => {
    logError("Child process error:", error);
    webSocket.close();
  });

  child.on("exit", (code) => {
    log(`Child process exited with code ${code}`);
    webSocket.close();
  });

  webSocket.on("message", (data) => {
    try {
      const message = data.toString();
      if (framing === "line") {
        prettyPrintMessage("[Client → Server]", message);
        const line = message.endsWith("\n") || message.endsWith("\r\n") ? message : `${message}\n`;
        child.stdin.write(line);
      } else {
        const content = message.replace(/^Content-Length: \d+\r?\n\r?\n/, "");
        prettyPrintMessage("[Client → Server]", content);
        child.stdin.write(content);
      }
    } catch (error) {
      logError("Failed to write to child stdin:", error);
    }
  });

  webSocket.on("close", () => {
    child.kill();
    closeStdout();
  });

  child.stderr.on("data", (data) => {
    logError("Child stderr:", data.toString());
  });
}

export function startWebSocketServer(opts: {
  port: number;
  command: string[];
  corsOrigin?: string | string[] | boolean;
  framing?: FramingMode;
  quiet?: boolean;
}): void {
  const { port, command, corsOrigin, framing = "line", quiet = false } = opts;
  isQuiet = quiet;

  const wss = new WebSocketServer({
    port,
    verifyClient: corsOrigin
      ? ({ origin }: { origin: string }) => {
          if (corsOrigin === true) return true;
          if (typeof corsOrigin === "string") return origin === corsOrigin;
          if (Array.isArray(corsOrigin)) return corsOrigin.includes(origin);
          return false;
        }
      : undefined,
  });

  wss.on("error", (error) => {
    logError("WebSocket server error:", error);
  });

  wss.on("connection", (webSocket) => {
    log("New WebSocket connection");
    handleWebSocketConnection(command, webSocket, framing);
  });

  log(`WebSocket server listening on port ${port}`);
}
