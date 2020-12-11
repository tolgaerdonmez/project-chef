import Injector from "../../Injector";
import { join } from "path";
import { copyFileSync } from "fs";

describe("Injector tests", () => {
  let injector: Injector | undefined;

  const testPaths = {
    projectPath: join(__dirname, "testProject"),
    referencePath: join(__dirname, "testTemplate"),
  };

  beforeAll(() => {
    // creating a new test.config.json from example
    copyFileSync(join(testPaths.projectPath, "example.test.config.json"), join(testPaths.projectPath, "test.config.json"));
  });

  it("loadFromConfig test", async () => {
    injector = await Injector.loadFromConfig(testPaths);

    expect(injector).toBeTruthy();
    expect(injector).toBeInstanceOf(Injector);
  });

  it("handleConfigs test", async () => {
    await injector?.handleConfigs();
    const targetConfig = await import("./testProject/test.config.json");
    const exampleConfig = await import("./testProject/example.test.config.json");
    expect(targetConfig).not.toBe(exampleConfig);
  });
});
