# stdio-to-ws

Redirect stdio to WebSocket.

## Usage

```bash
npx stdio-to-ws [options] "stdio command"
```

## Options

- `-p, --port <port>`: port to listen on (default: 3000)
- `-f, --framing <mode>`: message framing (`raw` | `line`, default: `raw`)
- `-q, --quiet`: suppress logging output
- `-h, --help`: show help

### Framing modes

- `raw` (default): forwards stdout data chunks as-is and strips a leading `Content-Length` header if present
- `line`: treats each stdout line as a message; useful for line-delimited protocols such as NDJSON (ACP uses NDJSON, so use `line` for ACP)

## Example

```bash
npx stdio-to-ws "npx @google/gemini-cli --experimental-acp" --port 3000 --framing line
```

## License

Apache 2.0
