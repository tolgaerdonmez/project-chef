import inquirer, { QuestionCollection, Answers, Question } from "inquirer";
import fs from "fs";
import { join } from "path";
import { CustomAnswers } from "./types/customAnswers";
import { createStackPaths } from "./paths/stacks";
import { selectStacks, createStackFrameworkSelect, frameworkExtrasSelect } from "./questions/stacks";
import { copyContents } from "./utils/file";
import { StackPaths } from "./types/paths";
import { Subject } from "rxjs";
import Injector from "./utils/Injector";
import { installPackages } from "./utils/commands";

const prompts = new Subject<Question>();
let selectedStacks: string[] = [];
let selectedFrameworks: string[] = [];

const onStacksAnswered = (name: string, answer: string) => {
	selectedFrameworks.push(name);
	const extras = frameworkExtrasSelect(name, answer);
	if (extras) {
		prompts.next(extras);
	}
	if (selectedStacks.length === selectedFrameworks.length) {
		prompts.complete();
	}
};

const onEachAnswer = ({ name, answer }: Answers) => {
	switch (name) {
		case "stacks": {
			selectedStacks = answer; // setting to global var

			answer.forEach((stack: string) => {
				prompts.next(createStackFrameworkSelect(stack));
			});
			break;
		}
		case "backend": {
			onStacksAnswered(name, answer);
			break;
		}
		case "frontend": {
			onStacksAnswered(name, answer);
			break;
		}
		default:
			if (name !== "project-name") prompts.complete();
			break;
	}
};

const onError = (err: any) => console.error(err);

const projectName = {
	name: "project-name",
	type: "input",
	message: "Project name:",
	validate: function (input: string) {
		try {
			if (/^([A-Za-z\-\_\d])+$/.test(input)) {
				const currentFiles = fs.readdirSync(process.cwd());
				currentFiles.forEach(f => {
					if (f === input) {
						throw new Error("file exists");
					}
				});
				return true;
			} else throw new Error("invalid name");
		} catch (error) {
			switch (error.message) {
				case "file exists":
					return "A directory named " + input + " already exists!";

				case "invalid name":
					return "Project name may only include letters, numbers, underscores and hashes.";

				default:
					return error.message;
			}
		}
	},
	default: "awesome-project",
};

const prompt = inquirer.prompt(prompts as QuestionCollection);

prompt.ui.process.subscribe(onEachAnswer, onError);

prompt.then(({ stacks, ...answers }: CustomAnswers) => {
	const projectName = answers["project-name"];
	let stackPaths: StackPaths;

	if (!stacks) return;
	stackPaths = createStackPaths(stacks, answers);

	if (!stackPaths) return;

	const fullStack = stacks.length === 2;

	// creating main frameworks for stacks
	console.log(stackPaths);

	fs.mkdirSync(join(process.cwd(), projectName));
	stacks.forEach(stack => {
		// copying contents for both stacks
		stackPaths[stack].forEach(async ({ path, extras }) => {
			const folderName = stack === "frontend" ? "client" : "server";
			// separate folders if fullstack -> client & server
			const targetPath = fullStack
				? join(process.cwd(), projectName, folderName)
				: join(process.cwd(), projectName);

			await copyContents(path, targetPath);
			// installing main module dependencies
			console.log(stack + ": Installing core dependencies...");
			installPackages(targetPath);

			console.log(stack + ": Installing extra dependencies...");
			extras.forEach(async ({ path, initializer }) => {
				try {
					await copyContents(path, targetPath);
					// adding needed configs to target project using Injector
					if (initializer) await Injector.inject({ projectPath: targetPath, referencePath: initializer });
				} catch (err) {
					console.error(err.message);
				}
			});
		});
	});
});

prompts.next(projectName);
prompts.next(selectStacks);
