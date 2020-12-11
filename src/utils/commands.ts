import { execSync } from "child_process";
import { fixWhitespaces } from "./misc";

export const installPackages = (targetPath: string) => {
  const command = `yarn --cwd ${fixWhitespaces(targetPath)} install`;
  if (!process.env.DEV) execSync(command, { stdio: "inherit" });
};
