import kleur from "kleur";
import figlet from "figlet";

export const infoMessage = (msg: string) => {
	return kleur.cyan(msg);
};

export const errorMessage = (msg: string) => {
	return kleur.red(msg);
};

export const successMessage = (msg: string) => {
	return kleur.green(msg);
};

export const packageMessage = () => {
	console.clear();
	const msg = figlet.textSync("Project Chef", { font: "Ogre" });
	console.log(kleur.bgCyan().white(msg) + "\n");
};
