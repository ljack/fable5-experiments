/**
 * send_to_user tool for opencode — native macOS notifications with shared
 * last-100-message history (tools/send-to-user/core.mjs).
 */

import { tool } from "@opencode-ai/plugin";

// @ts-ignore - plain ESM module without type declarations
import { sendToUser, MAX_HISTORY } from "../../tools/send-to-user/core.mjs";

export default tool({
	description:
		"Send a native macOS notification to the user. Use for important updates the user should see even when not looking at the terminal: task completion, errors needing attention, or questions blocking progress. The last 100 messages are kept in history.",
	args: {
		message: tool.schema.string().describe("Notification body text (keep it short)"),
		title: tool.schema.string().optional().describe("Notification title (default: 'opencode')"),
		subtitle: tool.schema.string().optional().describe("Optional subtitle line"),
	},
	async execute(args) {
		const result = await sendToUser({
			message: args.message,
			title: args.title ?? "opencode",
			subtitle: args.subtitle,
		});
		return `${result.deliveryNote} (history: ${result.count}/${MAX_HISTORY})`;
	},
});
