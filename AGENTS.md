# stdio-to-ws

CLI that bridges a stdio process to WebSocket connections (line/NDJSON or raw framing; used for ACP). Published to npm as `stdio-to-ws` (`npx stdio-to-ws`).

## Development

```bash
pnpm install
pnpm lint        # biome check --write (autofix.ci runs this on PRs)
pnpm typecheck   # tsc --noEmit
pnpm build       # tsc -> dist/
```

- No test suite yet (`pnpm test` is a placeholder that just echoes).
