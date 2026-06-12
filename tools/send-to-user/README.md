# send_to_user

Native macOS notifications from AI agents, with a shared last-100-message
history. Works with **pi**, **opencode**, and **codex** (or anything that
speaks MCP / can run a CLI).

## Layout

| File | Purpose |
|---|---|
| `core.mjs` | Shared logic: osascript notification + JSON history (last 100) |
| `cli.mjs` | Standalone CLI for any shell-capable agent |
| `mcp-server.mjs` | Zero-dependency stdio MCP server (for codex etc.) |
| `../../.pi/extensions/send-to-user.ts` | pi extension (tool + `/notifications` TUI viewer) |
| `../../.opencode/tool/send_to_user.ts` | opencode custom tool |

History is stored in `.send-to-user-history.json` in the working directory
(git-ignored). Override the location with the `SEND_TO_USER_HISTORY` env var —
all integrations share the same file.

## pi

Auto-discovered from `.pi/extensions/` once the project is trusted.
The LLM gets a `send_to_user` tool; browse history with `/notifications`
(↑/↓ scroll, Esc closes).

## opencode

Auto-discovered from `.opencode/tool/send_to_user.ts`. The agent can call
`send_to_user` directly.

## codex

Add to `~/.codex/config.toml`:

```toml
[mcp_servers.send-to-user]
command = "node"
args = ["/Users/jarkko/_dev/fable-5-test-1/tools/send-to-user/mcp-server.mjs"]
```

Exposes two MCP tools: `send_to_user` and `notification_history`.

## CLI (any agent)

```bash
node tools/send-to-user/cli.mjs "Build finished" --title "CI" --subtitle "main"
node tools/send-to-user/cli.mjs --history 20
```
