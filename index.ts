#!/usr/bin/env node

// import { getTemplates } from "./utils/templates";
import { packageMessage, infoMessage } from "./utils/messages";
import ora from "ora";
import { checkYarn } from "./utils/checkYarn";

async function main() {
	//checking yarn before doing something further
	checkYarn();
	//clearing and showing a spinner
	console.clear();
	// const loadingMessage = ora(infoMessage("loading project-chef")).start();
	// loadingMessage.color = "green";
	// getting the latest templates from github repo

	// loadingMessage.stop(); // stopping spinner
	await packageMessage(); // showing the package name

	import("./src"); // running the main script by importing
}

main();
