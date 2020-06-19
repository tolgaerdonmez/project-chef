export interface StackPath {
	name: string;
	path: string;
	extras: { name: string; path: string; initializer: string }[];
}

export interface StackPaths {
	[key: string]: StackPath[];
}
