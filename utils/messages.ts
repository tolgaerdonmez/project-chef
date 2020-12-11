import kleur from "kleur";
import figlet from "figlet";
import { checkTemplateVersion } from "./templates";

export const infoMessage = (msg: string) => {
  return kleur.cyan(msg);
};

export const errorMessage = (msg: string) => {
  return kleur.red(msg);
};

export const successMessage = (msg: string) => {
  return kleur.green(msg);
};

export const packageMessage = async () => {
  console.clear();
  await checkTemplateVersion();
  const msg = figlet.textSync("Project Chef", { font: "Ogre" });
  console.log(kleur.bgCyan().white(msg) + "\n");
};
