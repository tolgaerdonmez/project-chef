import { execSync } from "child_process";
import { errorMessage, infoMessage, successMessage } from "./messages";

export const checkYarn = () => {
	try {
		execSync("yarn --version", { encoding: "utf-8", stdio: "inherit" });
	} catch {
		console.clear();
		console.log(errorMessage("An error occured while checking yarn!"));
		console.log(infoMessage("Check your yarn installation, or install yarn using"));
		console.log(successMessage("npm install -g yarn"));
		process.exit();
	}
};
