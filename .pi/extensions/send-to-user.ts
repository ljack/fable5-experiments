/**
 * send_to_user — notify the user via native macOS notifications.
 *
 * - Registers a `send_to_user` tool the LLM can call to ping the user
 *   (uses `osascript -e 'display notification ...'`).
 * - Keeps a history of the last 100 messages in `.send-to-user-history.json`,
 *   shared with the opencode tool and the codex MCP server
 *   (logic lives in tools/send-to-user/core.mjs).
 * - Registers a `/notifications` command to browse the history in the TUI.
 */

import { join } from "node:path";
import type { ExtensionAPI, Theme } from "@earendil-works/pi-coding-agent";
import { matchesKey, Text, truncateToWidth } from "@earendil-works/pi-tui";
import { Type } from "typebox";

// @ts-ignore - plain ESM module without type declarations
import { formatTime, historyPath, loadHistory, sendToUser, MAX_HISTORY } from "../../tools/send-to-user/core.mjs";

interface NotificationRecord {
	timestamp: number;
	title: string;
	message: string;
	subtitle?: string;
}

/** Scrollable history viewer for the /notifications command. */
class HistoryComponent {
	private history: NotificationRecord[];
	private theme: Theme;
	private onClose: () => void;
	private offset = 0; // 0 = newest at bottom

	constructor(history: NotificationRecord[], theme: Theme, onClose: () => void) {
		this.history = history;
		this.theme = theme;
		this.onClose = onClose;
	}

	handleInput(data: string): void {
		if (matchesKey(data, "escape") || matchesKey(data, "ctrl+c") || data === "q") {
			this.onClose();
		} else if (matchesKey(data, "up") || data === "k") {
			this.offset = Math.min(this.offset + 1, Math.max(0, this.history.length - 1));
		} else if (matchesKey(data, "down") || data === "j") {
			this.offset = Math.max(0, this.offset - 1);
		}
	}

	render(width: number): string[] {
		const th = this.theme;
		const lines: string[] = [];
		const pageSize = 15;

		lines.push("");
		const title = th.fg("accent", ` send_to_user history (${this.history.length}/${MAX_HISTORY}) `);
		lines.push(
			truncateToWidth(
				th.fg("borderMuted", "─".repeat(3)) + title + th.fg("borderMuted", "─".repeat(Math.max(0, width - 35))),
				width,
			),
		);
		lines.push("");

		if (this.history.length === 0) {
			lines.push(truncateToWidth(`  ${th.fg("dim", "No notifications sent yet.")}`, width));
		} else {
			const end = this.history.length - this.offset;
			const start = Math.max(0, end - pageSize);
			if (start > 0) {
				lines.push(truncateToWidth(`  ${th.fg("dim", `↑ ${start} earlier`)}`, width));
			}
			for (const rec of this.history.slice(start, end)) {
				const time = th.fg("dim", formatTime(rec.timestamp));
				const recTitle = th.fg("accent", rec.title);
				const sub = rec.subtitle ? th.fg("muted", ` · ${rec.subtitle}`) : "";
				lines.push(truncateToWidth(`  ${time}  ${recTitle}${sub}`, width));
				lines.push(truncateToWidth(`    ${th.fg("text", rec.message)}`, width));
			}
			if (this.offset > 0) {
				lines.push(truncateToWidth(`  ${th.fg("dim", `↓ ${this.offset} newer`)}`, width));
			}
		}

		lines.push("");
		lines.push(truncateToWidth(`  ${th.fg("dim", "↑/↓ scroll · Esc/q close")}`, width));
		lines.push("");
		return lines;
	}
}

export default function (pi: ExtensionAPI) {
	let cwd = process.cwd();

	pi.on("session_start", async (_event, ctx) => {
		cwd = ctx.cwd;
	});

	pi.registerTool({
		name: "send_to_user",
		label: "Send to User",
		description:
			"Send a native macOS notification to the user. Use for important updates the user should see even when not looking at the terminal: task completion, errors needing attention, or questions blocking progress. Keeps a history of the last 100 messages (viewable with /notifications).",
		parameters: Type.Object({
			message: Type.String({ description: "Notification body text (keep it short)" }),
			title: Type.Optional(Type.String({ description: "Notification title (default: 'pi')" })),
			subtitle: Type.Optional(Type.String({ description: "Optional subtitle line" })),
		}),

		async execute(_toolCallId, params, _signal, _onUpdate, _ctx) {
			const result = await sendToUser({
				message: params.message,
				title: params.title ?? "pi",
				subtitle: params.subtitle,
				cwd,
			});

			return {
				content: [{ type: "text", text: `${result.deliveryNote} (history: ${result.count}/${MAX_HISTORY})` }],
				details: { record: result.record, historyCount: result.count },
			};
		},

		renderCall(args, theme, _context) {
			const title = args.title ?? "pi";
			return new Text(
				theme.fg("toolTitle", theme.bold("send_to_user ")) +
					theme.fg("accent", `[${title}] `) +
					theme.fg("muted", args.message ?? ""),
				0,
				0,
			);
		},

		renderResult(result, _options, theme, _context) {
			const text = result.content[0];
			const msg = text?.type === "text" ? text.text : "";
			const ok = !msg.includes("failed");
			return new Text((ok ? theme.fg("success", "✓ ") : theme.fg("error", "✗ ")) + theme.fg("muted", msg), 0, 0);
		},
	});

	pi.registerCommand("notifications", {
		description: "Show send_to_user notification history (last 100)",
		handler: async (_args, ctx) => {
			const history: NotificationRecord[] = loadHistory(historyPath(cwd));

			if (ctx.mode !== "tui") {
				const tail = history.slice(-10);
				ctx.ui.notify(
					tail.length
						? tail.map((r) => `${formatTime(r.timestamp)} [${r.title}] ${r.message}`).join("\n")
						: "No notifications sent yet.",
					"info",
				);
				return;
			}
			await ctx.ui.custom<void>((_tui, theme, _kb, done) => {
				return new HistoryComponent(history, theme, () => done());
			});
		},
	});
}
