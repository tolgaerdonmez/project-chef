import { execSync } from "child_process";
import { join } from "path";
import { statSync, writeFileSync } from "fs";
import { getNestedFields } from "./misc";

const isDev = !!process.env.DEV;

type Config = { [key: string]: any };

type ConfigResolver = {
	file: string;
	appenders: string[];
}[];

export interface InjectorConstructor {
	projectPath: string;
	referencePath: string;
	packages?: string[];
	devPackages?: string[];
	configs?: ConfigResolver;
}

export interface InjectorConfig {
	packages: string[];
	devPackages: string[];
	configs: ConfigResolver;
}

export default class Injector {
	projectPath: string;
	referencePath: string;
	packages: string[];
	devPackages: string[];
	configs: ConfigResolver;

	constructor({ packages, devPackages, configs, projectPath, referencePath }: InjectorConstructor) {
		if (packages && devPackages && configs) {
			this.packages = packages;
			this.devPackages = devPackages;
			this.configs = configs;
		}
		this.projectPath = projectPath;
		this.referencePath = referencePath;
	}

	installAllPackages = () => {
		const commands = [
			`yarn --cwd ${this.projectPath} add ${this.packages.join(" ")}`,
			`yarn --cwd ${this.projectPath} add -D ${this.devPackages.join(" ")}`,
		];
		commands.forEach(c => execSync(c));
	};

	handleConfigs = async () => {
		this.configs.map(async ({ file, appenders }) => {
			const targetConfig = await this.getConfigFromProject(file);
			if (!targetConfig) return;
			const { default: referenceConfig } = await import(join(this.referencePath, file));

			appenders.forEach(field => {
				// if selected a nested field like: {a:{b:1}} -> a.b
				let targetField;
				let referenceField;
				if (field.split(".").length > 1) {
					const fields = field.split(".");
					targetField = getNestedFields([...fields], targetConfig);
					referenceField = getNestedFields([...fields], referenceConfig);
					field = fields[fields.length - 1];
				} else {
					targetField = targetConfig[field];
					referenceField = referenceConfig[field];
				}

				// changing the values of target fields
				if (Array.isArray(targetField[field])) {
					targetField[field] = [...targetField[field], ...referenceField[field]];
				} else {
					targetField[field] = referenceField[field];
				}
			});
			writeFileSync(join(this.projectPath, file), JSON.stringify(targetConfig));
		});
	};

	getConfigFromProject = async (filename: string): Promise<Config | null> => {
		const configPath = join(this.projectPath, filename);
		const exists = statSync(configPath).isFile();
		if (!exists) return null;

		const { default: config } = await import(configPath);
		return config;
	};

	static inject = async (config: InjectorConstructor) => {
		try {
			if (!config.configs || !config.devPackages || !config.packages) {
				const {
					default: { configs, devPackages, packages },
				}: { default: InjectorConfig } = await import(join(config.referencePath, "injector.config.json"));
				config.configs = configs;
				config.packages = packages;
				config.devPackages = devPackages;

				if (!config.configs || !config.devPackages || !config.packages) {
					console.log(config);
					throw new Error("Config not valid");
				}
			}

			const injector = new Injector(config);
			if (!isDev) {
				injector.installAllPackages();
			}
			injector.handleConfigs();
		} catch (error) {
			console.error(error.message);
		}
	};
}
