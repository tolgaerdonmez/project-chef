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

const prompts = new Subject<Question>();

const onStacksAnswered = (name: string, answer: string) => {
	const extras = frameworkExtrasSelect(name, answer);
	if (extras) {
		prompts.next(extras);
	}
};

const onEachAnswer = ({ name, answer }: Answers) => {
	console.log(name, answer);
	switch (name) {
		case "stacks": {
			answer.forEach((stack: string) => prompts.next(createStackFrameworkSelect(stack)));
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
const onComplete = () => console.log("Finished");

const projectName = {
	name: "project-name",
	type: "input",
	message: "Project name:",
	validate: function (input: string) {
		if (/^([A-Za-z\-\_\d])+$/.test(input)) return true;
		else return "Project name may only include letters, numbers, underscores and hashes.";
	},
};

const prompt = inquirer.prompt(prompts as QuestionCollection);

prompt.ui.process.subscribe(onEachAnswer, onError, onComplete);

prompt.then(({ stacks, ...answers }: CustomAnswers) => {
	const projectName = answers["project-name"];
	let stackPaths: StackPaths;

	if (!stacks) return;
	stackPaths = createStackPaths(stacks, answers);

	if (!stackPaths) return;

	const fullStack = stacks.length === 2;

	// creating main frameworks for stacks
	fs.mkdirSync(join(process.cwd(), projectName));
	stacks.forEach(stack => {
		// copying contents for both stacks
		stackPaths[stack].forEach(async ({ path, extras }) => {
			const folderName = stack === "frontend" ? "client" : "server";
			// separate folders if fullstack -> client & server
			const destination = fullStack
				? join(process.cwd(), projectName, folderName)
				: join(process.cwd(), projectName);

			await copyContents(path, destination);

			extras.forEach(async ({ path, initializer }) => {
				await copyContents(path, destination);
				// adding needed configs to target project using Injector
				await Injector.inject({ projectPath: destination, referencePath: initializer });
			});
		});
	});

	console.log(answers);
});

prompts.next(projectName);
prompts.next(selectStacks);
