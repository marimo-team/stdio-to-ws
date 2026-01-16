# stdio-to-ws

Redirect stdio to WebSocket.

## Usage

```bash
npx stdio-to-ws [options] "stdio command"
```

## Options

- `-p, --port <port>`: port to listen on (default: 3000)
- `-f, --framing <mode>`: message framing (`raw` | `line`, default: `line`)
- `-q, --quiet`: suppress logging output
- `-h, --help`: show help

### Framing modes

- `line` (default): treats each stdout line as a message; useful for line-delimited protocols such as NDJSON (ACP uses NDJSON)
- `raw`: forwards stdout data chunks as-is and strips a leading `Content-Length` header if present

## Example

```bash
npx stdio-to-ws "npx @google/gemini-cli --experimental-acp" --port 3000
```

## License

Apache 2.0
