import { readdirSync, statSync, readFileSync, writeFileSync } from "fs";
import { ncp } from "ncp";

export const copyDir = (source: string, destination: string) =>
	new Promise((res, rej) => {
		ncp(source, destination, function (err) {
			if (err) {
				rej(err);
			}
			res();
		});
	});

export async function copyContents(templatePath: string, destination: string) {
	try {
		await copyDir(templatePath, destination);
	} catch (err) {
		console.log(err);
	}
}
