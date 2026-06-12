#!/usr/bin/env node
/**
 * send_to_user MCP server (stdio) — for Codex and any MCP-capable agent.
 * Zero dependencies: speaks JSON-RPC 2.0 over stdin/stdout directly.
 *
 * Codex setup (~/.codex/config.toml):
 *
 *   [mcp_servers.send-to-user]
 *   command = "node"
 *   args = ["/Users/jarkko/_dev/fable-5-test-1/tools/send-to-user/mcp-server.mjs"]
 *
 * Tools: send_to_user, notification_history
 */

import { formatHistory, historyPath, loadHistory, sendToUser, MAX_HISTORY } from "./core.mjs";

const TOOLS = [
	{
		name: "send_to_user",
		description:
			"Send a native macOS notification to the user. Use for important updates the user should see even when not looking at the terminal: task completion, errors needing attention, or questions blocking progress. The last 100 messages are kept in history.",
		inputSchema: {
			type: "object",
			properties: {
				message: { type: "string", description: "Notification body text (keep it short)" },
				title: { type: "string", description: "Notification title (default: 'agent')" },
				subtitle: { type: "string", description: "Optional subtitle line" },
			},
			required: ["message"],
		},
	},
	{
		name: "notification_history",
		description: "Show the last notifications sent to the user via send_to_user (up to 100).",
		inputSchema: {
			type: "object",
			properties: {
				limit: { type: "number", description: `Max entries to return (default ${MAX_HISTORY})` },
			},
		},
	},
];

async function handleToolCall(name, args = {}) {
	if (name === "send_to_user") {
		const result = await sendToUser({
			message: args.message,
			title: args.title ?? "agent",
			subtitle: args.subtitle,
		});
		return { content: [{ type: "text", text: `${result.deliveryNote} (history: ${result.count}/${MAX_HISTORY})` }] };
	}
	if (name === "notification_history") {
		const limit = typeof args.limit === "number" ? args.limit : MAX_HISTORY;
		const history = loadHistory(historyPath()).slice(-limit);
		return { content: [{ type: "text", text: formatHistory(history) }] };
	}
	throw new Error(`Unknown tool: ${name}`);
}

async function handleRequest(req) {
	switch (req.method) {
		case "initialize":
			return {
				protocolVersion: req.params?.protocolVersion ?? "2024-11-05",
				capabilities: { tools: {} },
				serverInfo: { name: "send-to-user", version: "1.0.0" },
			};
		case "tools/list":
			return { tools: TOOLS };
		case "tools/call": {
			try {
				return await handleToolCall(req.params?.name, req.params?.arguments);
			} catch (error) {
				return { content: [{ type: "text", text: `Error: ${error?.message ?? error}` }], isError: true };
			}
		}
		case "ping":
			return {};
		default:
			throw { code: -32601, message: `Method not found: ${req.method}` };
	}
}

function send(msg) {
	process.stdout.write(JSON.stringify(msg) + "\n");
}

async function processLine(line) {
	let req;
	try {
		req = JSON.parse(line);
	} catch {
		return;
	}

	// Notifications (no id) need no response.
	if (req.id === undefined || req.id === null) return;

	try {
		const result = await handleRequest(req);
		send({ jsonrpc: "2.0", id: req.id, result });
	} catch (error) {
		send({
			jsonrpc: "2.0",
			id: req.id,
			error: { code: error?.code ?? -32603, message: error?.message ?? String(error) },
		});
	}
}

// Serialize requests; exit only after all pending work is done.
let queue = Promise.resolve();
let buffer = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
	buffer += chunk;
	let idx;
	while ((idx = buffer.indexOf("\n")) !== -1) {
		const line = buffer.slice(0, idx).trim();
		buffer = buffer.slice(idx + 1);
		if (line) queue = queue.then(() => processLine(line));
	}
});
process.stdin.on("end", () => {
	queue.then(() => process.exit(0));
});
