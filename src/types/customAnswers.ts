import { Answers } from "inquirer";

export interface CustomAnswers extends Answers {
	stacks?: string[];
	frontend?: string;
	backend?: string;
	[key: string]: any;
}
