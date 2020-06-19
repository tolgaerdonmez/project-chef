import { getTemplates } from "./utils/templates";

async function main() {
	// getting the latest templates from github repo
	const gotTemplates = await getTemplates();
	if (!gotTemplates) {
		console.error("Error while fetching templates, try again!");
		process.exit();
	}
	import("./src"); // running the main script by importing
}

main();
