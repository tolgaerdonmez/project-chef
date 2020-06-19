import { Clone, Repository } from "nodegit";
import { join } from "path";
import { readdirSync } from "fs";

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
