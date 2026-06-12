/**
 * send_to_user core — shared by the pi extension, the opencode tool,
 * the codex MCP server, and the standalone CLI.
 *
 * Sends native macOS notifications (osascript) and keeps a history of
 * the last 100 messages in a JSON file shared by all agents.
 */

import { execFile } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

export const MAX_HISTORY = 100;

/**
 * Resolve the history file path. Override with SEND_TO_USER_HISTORY env var;
 * defaults to `<cwd>/.send-to-user-history.json` (git-ignored).
 */
export function historyPath(cwd = process.cwd()) {
	return process.env.SEND_TO_USER_HISTORY || join(cwd, ".send-to-user-history.json");
}

export function loadHistory(file) {
	try {
		if (!existsSync(file)) return [];
		const parsed = JSON.parse(readFileSync(file, "utf8"));
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

export function saveHistory(file, history) {
	mkdirSync(dirname(file), { recursive: true });
	writeFileSync(file, JSON.stringify(history.slice(-MAX_HISTORY), null, "\t") + "\n", "utf8");
}

/** Escape a string for embedding in a double-quoted AppleScript literal. */
function escapeAppleScript(s) {
	return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

export function sendAppleNotification(title, message, subtitle) {
	let script = `display notification "${escapeAppleScript(message)}" with title "${escapeAppleScript(title)}"`;
	if (subtitle) script += ` subtitle "${escapeAppleScript(subtitle)}"`;
	script += ` sound name "Glass"`;

	return new Promise((resolve, reject) => {
		execFile("osascript", ["-e", script], (error) => {
			if (error) reject(error);
			else resolve();
		});
	});
}

/**
 * Send a notification and record it in history.
 * Returns { record, count, deliveryNote, ok }.
 */
export async function sendToUser({ message, title = "agent", subtitle, cwd } = {}) {
	if (!message) throw new Error("message is required");

	const record = { timestamp: Date.now(), title, message, subtitle };
	let ok = true;
	let deliveryNote = "Notification sent.";
	try {
		await sendAppleNotification(title, message, subtitle);
	} catch (error) {
		ok = false;
		deliveryNote = `Notification delivery failed (${error?.message ?? error}), but message was recorded in history.`;
	}

	const file = historyPath(cwd);
	const history = loadHistory(file);
	history.push(record);
	saveHistory(file, history);

	return { record, count: Math.min(history.length, MAX_HISTORY), deliveryNote, ok };
}

export function formatTime(ts) {
	const d = new Date(ts);
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatHistory(history) {
	if (!history.length) return "No notifications sent yet.";
	return history
		.map((r) => `${formatTime(r.timestamp)} [${r.title}]${r.subtitle ? ` (${r.subtitle})` : ""} ${r.message}`)
		.join("\n");
}
