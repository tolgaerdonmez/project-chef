export interface InitFunctionArgs {
	cwd: string;
	folderName: string;
}

export type InitFunction = (args: InitFunctionArgs) => any;
