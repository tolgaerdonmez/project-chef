import { execSync } from "child_process";

export const installPackages = (targetPath: string) => {
	const command = `yarn --cwd ${targetPath} install`;
	if (!process.env.DEV) execSync(command, { stdio: "inherit" });
};
