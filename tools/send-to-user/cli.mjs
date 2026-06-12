#!/usr/bin/env node
/**
 * send_to_user CLI — usable from any agent that can run shell commands.
 *
 * Usage:
 *   node cli.mjs "message" [--title "Title"] [--subtitle "Sub"]
 *   node cli.mjs --history [n]
 */

import { formatHistory, historyPath, loadHistory, sendToUser } from "./core.mjs";

function usage() {
	console.log(`Usage:
  send_to_user "message" [--title "Title"] [--subtitle "Sub"]
  send_to_user --history [n]`);
	process.exit(1);
}

const args = process.argv.slice(2);
if (args.length === 0) usage();

if (args[0] === "--history") {
	const n = args[1] ? Number(args[1]) : 100;
	const history = loadHistory(historyPath()).slice(-n);
	console.log(formatHistory(history));
	process.exit(0);
}

let message;
let title = "agent";
let subtitle;
for (let i = 0; i < args.length; i++) {
	if (args[i] === "--title") title = args[++i];
	else if (args[i] === "--subtitle") subtitle = args[++i];
	else if (message === undefined) message = args[i];
	else usage();
}
if (!message) usage();

const result = await sendToUser({ message, title, subtitle });
console.log(`${result.deliveryNote} (history: ${result.count}/100)`);
process.exit(result.ok ? 0 : 2);
