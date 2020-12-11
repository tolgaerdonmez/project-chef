import { execSync } from "child_process";
import { join } from "path";
import { statSync, writeFileSync } from "fs";
import { getNestedFields, fixWhitespaces } from "./misc";

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
    // if (packages && devPackages && configs) {
    this.packages = packages || [];
    this.devPackages = devPackages || [];
    this.configs = configs || [];
    // }
    this.projectPath = projectPath;
    this.referencePath = referencePath;
  }

  installAllPackages = () => {
    const commands = [
      this.packages.length ? `yarn --cwd ${fixWhitespaces(this.projectPath)} add ${this.packages.join(" ")}` : "",
      this.devPackages.length ? `yarn --cwd ${fixWhitespaces(this.projectPath)} add -D ${this.devPackages.join(" ")}` : "",
    ];
    commands.forEach((c) => {
      if (c) execSync(c, { stdio: "inherit" });
    });
  };

  handleConfigs = async () => {
    if (!this.configs.length) return;

    this.configs.map(async ({ file, appenders }) => {
      const targetConfig = await this.getConfigFromProject(file);
      if (!targetConfig) return;
      const { default: referenceConfig } = await import(join(this.referencePath, file));

      if (!appenders.length) return;
      appenders.forEach((field) => {
        // if selected a nested field like: {a:{b:1}} -> a.b
        let targetField;
        let referenceField;
        if (field.split(".").length > 1) {
          const fields = field.split(".");
          targetField = getNestedFields([...fields], targetConfig);
          referenceField = getNestedFields([...fields], referenceConfig);
          field = fields[fields.length - 1];
        } else {
          targetField = targetConfig; //[field];
          referenceField = referenceConfig; //[field];
        }
        // changing the values of target fields
        if (Array.isArray(targetField[field])) {
          targetField[field] = [...targetField[field], ...referenceConfig[field]];
        } else {
          targetField[field] = referenceField[field];
        }
      });

      writeFileSync(join(this.projectPath, file), JSON.stringify(targetConfig));
    });
  };

  getConfigFromProject = async (filename: string): Promise<Config | null> => {
    try {
      const configPath = join(this.projectPath, filename);
      const exists = statSync(configPath).isFile();
      if (!exists) return null;

      const { default: config } = await import(configPath);
      return config;
    } catch (err) {
      return null;
    }
  };

  static loadFromConfig = async ({
    projectPath,
    referencePath,
  }: {
    projectPath: string;
    referencePath: string;
  }): Promise<Injector | undefined> => {
    try {
      const config: InjectorConstructor = {
        projectPath,
        referencePath,
      };
      const {
        default: { configs, devPackages, packages },
      }: { default: InjectorConfig } = await import(join(config.referencePath, "injector.config.json"));
      config.configs = configs || [];
      config.packages = packages || [];
      config.devPackages = devPackages || [];

      const instance = new Injector(config);
      return instance;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  };

  static inject = async (config: InjectorConstructor) => {
    try {
      const injector = await Injector.loadFromConfig(config);
      if (!injector) {
        throw new Error("Invalid config for Injector, check your injector.config.json or the object being passed to constructor");
      }
      if (!isDev) {
        injector.installAllPackages();
      }
      injector.handleConfigs();
    } catch (error) {
      console.error(error.message);
    }
  };
}
