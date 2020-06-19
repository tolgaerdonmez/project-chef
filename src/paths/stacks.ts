import { join } from "path";
import { CustomAnswers } from "../types/customAnswers";
import { StackPaths } from "../types/paths";

const basePath = join(__dirname, "../templates");
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
					return { name: e, path: join(base, "main"), initializer: join(base, "init") };
			  })
			: [];

		paths[stack].push({ path: templatePath, name: framework, extras: extrasPaths }); // name = {framework}
	});
	return paths;
}
