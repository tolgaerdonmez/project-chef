import { readdirSync, statSync } from "fs";
import { stackPath } from "../paths/stacks";
import { join } from "path";
import { Question } from "inquirer";
import kleur from "kleur";
import { EMPTY_FOLDER } from "../constants";

const filterByFilename = (f: string) => !f.includes(".");
export const BACKEND_CHOICES: string[] = readdirSync(stackPath("backend")).filter(filterByFilename);
export const FRONTEND_CHOICES: string[] = readdirSync(stackPath("frontend")).filter(filterByFilename);

export const selectStacks = {
  name: "stacks",
  type: "checkbox",
  message: "What project template would you like to generate?",
  choices: ["frontend", "backend"],
};

export const createStackFrameworkSelect = (stack: string) => {
  const question = {
    name: stack,
    type: "list",
    message: `Which ${stack} framework`,
    choices: stack === "frontend" ? FRONTEND_CHOICES : BACKEND_CHOICES,
  };
  question.choices.push(kleur.italic(EMPTY_FOLDER));
  return question;
};

export const frameworkExtrasSelect = (stack: string, framework: string): Question | null => {
  try {
    const extrasPath = join(stackPath(stack), framework, "extras"); // templates/{stack}/{framework}/extras
    const stat = statSync(extrasPath);
    if (stat.isDirectory()) {
      const extras = readdirSync(extrasPath);
      const question = {
        type: "checkbox",
        name: stack + "Extras",
        message: `Extra packages for ${framework}?`,
        choices: extras,
      };
      return question;
    }
    return null;
  } catch (err) {
    // console.log(err);
    return null;
  }
};
