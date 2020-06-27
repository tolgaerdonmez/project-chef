import { join } from "path";
import { CustomAnswers } from "../types/customAnswers";
import { StackPaths } from "../types/paths";
import { readdirSync, existsSync } from "fs";
import { EMPTY_FOLDER } from "../constants";

const isProd = process.env.PROD !== "false";
const node_modules_path = isProd ? "../../../node_modules" : "../../node_modules";

export const basePath = join(__dirname, node_modules_path, "project-chef-templates");
export const stackPath = (stack: string) => join(basePath, stack);

export function createStackPaths(stacks: string[], data: CustomAnswers): StackPaths {
	const paths: StackPaths = { frontend: [], backend: [] };
	stacks.forEach(stack => {
		const framework = data[stack];
		if (framework === EMPTY_FOLDER) return;

		const extras: string[] = data[stack + "Extras"];

		const templatePath = join(stackPath(stack), framework, "main"); // templates/{stack}/{framework}/main
		const initPath = join(stackPath(stack), framework, "init"); // templates/{stack}/{framework}/init

		const templateExists = existsSync(templatePath);
		const initExists = existsSync(initPath);

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

		paths[stack].push({
			path: templateExists ? templatePath : undefined,
			initPath: initExists ? initPath : undefined,
			name: framework,
			extras: extrasPaths,
		}); // name = {framework}
	});
	return paths;
}
