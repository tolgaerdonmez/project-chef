import { writeFileSync } from "fs";
import { join } from "path";
import { ncp } from "ncp";

export const copyDir = (source: string, destination: string) =>
	new Promise((res, rej) => {
		ncp(source, destination, function (err) {
			if (err) {
				rej(err);
			}
			res(true);
		});
	});

export async function copyContents(templatePath: string, destination: string) {
	try {
		await copyDir(templatePath, destination);
	} catch (err) {
		console.log(err);
	}
}

// Renames the "name" property in package.json
export async function renamePackageName(projectName: string, targetPath: string) {
	const packageJsonPath = join(targetPath, "package.json");

	// importing package.json of the project
	const packageData: { name: string; [key: string]: string } = await import(packageJsonPath);

	// setting the name as project's name
	const newPackageData = { ...packageData, name: projectName };

	writeFileSync(packageJsonPath, JSON.stringify(newPackageData));
}
