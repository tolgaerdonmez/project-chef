export const createNestedFields = (levels: string[], object: any, currentLevel?: { [key: string]: any }): any => {
	// for creating the nested fields
	if (levels.length) {
		let cLevel;
		if (currentLevel) {
			currentLevel[levels[0]] = {};
			cLevel = currentLevel[levels[0]];
		} else {
			object[levels[0]] = {};
			cLevel = object[levels[0]];
		}
		levels.shift();
		return createNestedFields(levels, object, cLevel);
	}
	return object;
};

// returns the last field
// levels = [a, b, c, d]
// returns { d: any }
export const getNestedFields = (levels: string[], object: any): any => {
	if (levels.length === 1) {
		return object;
	}
	// for getting the nested fields
	if (levels.length) {
		const nestedObject = object[levels[0]];
		levels.shift();
		if (!(levels[0] in nestedObject)) {
			createNestedFields([...levels], nestedObject);
		}
		return getNestedFields(levels, nestedObject);
	}
	return object;
};

export const fixWhitespaces = (text: string) => text.replace(/(\s+)/g, "\\$1");
