import { Clone, Repository } from "nodegit";
import { join } from "path";
import { readdirSync } from "fs";
import { checkLocalVersion } from "project-chef-templates";
import { successMessage, errorMessage, infoMessage } from "./messages";
import { italic } from "kleur";

const templateURL = "https://github.com/tolgaerdonmez/project-chef-templates.git";
const templatesPath = join(__dirname, "../templates");

export const getTemplates = async () => {
	try {
		const exists = readdirSync(join(__dirname, "../")).indexOf("templates") > -1;
		if (exists) {
			const repo = await Repository.open(templatesPath);
			await repo.fetch("origin");
			await repo.mergeBranches("master", "origin/master");
			return true;
		}
		const repo = await Clone.clone(templateURL, templatesPath);
		if (!repo) return false;
		return true;
	} catch (error) {
		console.log(error.message);
		return false;
	}
};

export const checkTemplateVersion = async () => {
	const res = await checkLocalVersion();

	switch (res) {
		case 1:
			console.log("\n");
			console.log(successMessage("------------------------------------\n"));
			console.log(successMessage("New version of templates available"));
			console.log(successMessage("You can install the new version using:"));
			console.log(infoMessage(italic("yarn global add project-chef-templates")));
			console.log(successMessage("\n------------------------------------"));
			console.log("\n");
			break;
		case -1:
			console.log(errorMessage("An error occured with the network, please try again!"));
			process.exit();
		default:
			break;
	}
	return res;
};
