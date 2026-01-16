#!/usr/bin/env node
import minimist from "minimist";
import { parseArgsStringToArgv } from "string-argv";
import { startWebSocketServer } from "./stdio-to-ws.js";

const argv = minimist(process.argv.slice(2), {
  alias: { p: "port", h: "help", q: "quiet", f: "framing" },
  default: { port: 3000, framing: "raw" },
  boolean: ["quiet"],
  string: ["framing"],
});

if (argv.help) {
  console.log(`
Usage: stdio-to-ws [options] <command>

Options:
  -p, --port <port>    Port to listen on (default: 3000)
  -q, --quiet         Suppress logging output
  -f, --framing <mode> Message framing: raw | line (default: raw)
  -h, --help          Show this help message

Example:
  stdio-to-ws -p 8080 "python my-script.py"
  stdio-to-ws --quiet "python my-script.py"
  `);
  process.exit(0);
}

const [cmd] = argv._;

if (!cmd) {
  console.error("No command provided.");
  process.exit(1);
}

const framing = argv.framing;
if (framing !== "raw" && framing !== "line") {
  console.error(`Invalid framing mode: ${framing}`);
  process.exit(1);
}

void startWebSocketServer({
  command: parseArgsStringToArgv(cmd),
  port: argv.port,
  framing,
  quiet: argv.quiet,
});
