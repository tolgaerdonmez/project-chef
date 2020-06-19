import { join } from "path";
import { CustomAnswers } from "../types/customAnswers";
import { StackPaths } from "../types/paths";
import { readdirSync } from "fs";

const basePath = join(__dirname, "../../templates");
export const stackPath = (stack: string) => join(basePath, stack);

export function createStackPaths(stacks: string[], data: CustomAnswers): StackPaths {
	const paths: StackPaths = { frontend: [], backend: [] };
	stacks.forEach(stack => {
		const framework = data[stack];
		const extras: string[] = data[stack + "Extras"];

		const templatePath = join(stackPath(stack), framework, "main"); // templates/{stack}/{framework}/main
		const extrasPaths = extras
			? extras.map(e => {
					const base = join(stackPath(stack), framework, "extras", e);
					const baseDirs = readdirSync(base);
					const hasMain = baseDirs.findIndex(x => x === "main") > -1;
					const hasInit = baseDirs.findIndex(x => x === "init") > -1;
					if (!hasMain) throw new Error("main directory for extra package not found!");
					return { name: e, path: join(base, "main"), initializer: hasInit ? join(base, "init") : undefined };
			  })
			: [];

		paths[stack].push({ path: templatePath, name: framework, extras: extrasPaths }); // name = {framework}
	});
	return paths;
}
